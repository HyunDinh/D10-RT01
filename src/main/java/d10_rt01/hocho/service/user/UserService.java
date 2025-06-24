package d10_rt01.hocho.service.user;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.UserRole;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.email.EmailService;
import d10_rt01.hocho.utils.CustomLogger;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UserService {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(UserService.class), DebugModeConfig.SERVICE_LAYER);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final long RESET_TOKEN_EXPIRY_MINUTES = 60;

    private final ParentChildMappingRepository parentChildMappingRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, ParentChildMappingRepository parentChildMappingRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.parentChildMappingRepository = parentChildMappingRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public User registerUser(String username, String password, String email, String parentEmail, String role, String phoneNumber) throws MessagingException, IOException {
        return registerUser(username, password, email, parentEmail, role, phoneNumber, null);
    }

    @Transactional
    public User registerUser(String username, String password, String email, String parentEmail, String role, String phoneNumber, MultipartFile teacherImage) throws MessagingException, IOException {
        logger.info("Bắt đầu đăng ký user: username={}, role={}", username, role);

        if (role.equals("teacher") && teacherImage != null) {
            return registerTeacher(username, password, email, phoneNumber, teacherImage);
        }

        // Kiểm tra định dạng email
        if (role.equals("child") && (parentEmail == null || !EMAIL_PATTERN.matcher(parentEmail).matches())) {
            logger.error("Email phụ huynh không hợp lệ: {}", parentEmail);
            throw new IllegalArgumentException("Email phụ huynh không hợp lệ.");
        }
        if (!role.equals("child") && (email == null || !EMAIL_PATTERN.matcher(email).matches())) {
            logger.error("Email cá nhân không hợp lệ: {}", email);
            throw new IllegalArgumentException("Email cá nhân không hợp lệ.");
        }

        // Kiểm tra username tồn tại
        if (userRepository.findByUsername(username).isPresent()) {
            logger.error("Tài khoản đã tồn tại: username={}", username);
            throw new IllegalArgumentException("Tài khoản đã tồn tại.");
        }

        // Kiểm tra email tồn tại (chỉ áp dụng cho parent/teacher)
        if (!role.equals("child") && userRepository.findByEmail(email) != null) {
            logger.error("Email đã được sử dụng: email={}", email);
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }

        // Kiểm tra tài khoản phụ huynh khi đăng ký cho child
        if (role.equals("child")) {
            User parent = userRepository.findByEmail(parentEmail);
            if (parent == null || !parent.getRole().equals("parent")) {
                logger.error("Không tìm thấy tài khoản phụ huynh với email: {}", parentEmail);
                throw new IllegalArgumentException("Không tìm thấy tài khoản phụ huynh.");
            }
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmail(role.equals("child") ? null : email);
        user.setRole(role);
        user.setPhoneNumber(phoneNumber);
        user.setIsActive(false);
        user.setVerified(false);
        user.setCreatedAt(Instant.now());

        // Tạo token xác nhận
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);

        try {
            User savedUser = userRepository.save(user);
            logger.info("Đã lưu user vào cơ sở dữ liệu: id={}, username={}, role={}", savedUser.getId(), savedUser.getUsername(), savedUser.getRole());

            // Lưu mối quan hệ phụ huynh-học sinh và gửi email xác nhận nếu là child
            if (role.equals("child")) {
                User parent = userRepository.findByEmail(parentEmail);
                ParentChildMapping mapping = new ParentChildMapping();
                mapping.setParent(parent);
                mapping.setChild(savedUser);
                parentChildMappingRepository.save(mapping);
                logger.info("Đã lưu mối quan hệ phụ huynh-học sinh: parentId={}, childId={}", parent.getId(), savedUser.getId());

                logger.info("Gửi email xác nhận tài khoản học sinh tới: {}, token: {}", parentEmail, token);
                if (HochoConfig.EMAIL_SENDER) {
                    emailService.sendChildRegistrationConfirmationEmail(parentEmail, savedUser.getUsername(), token);
                } else {
                    savedUser.setVerified(true);
                    savedUser.setIsActive(true);
                    userRepository.save(savedUser);
                }
            } else {
                logger.info("Gửi email xác nhận tới: {}, token: {}", email, token);
                if (HochoConfig.EMAIL_SENDER) {
                    emailService.sendVerificationEmail(email, token);
                } else {
                    savedUser.setVerified(true);
                    savedUser.setIsActive(true);
                    userRepository.save(savedUser);
                }
            }
            return savedUser;
        } catch (Exception e) {
            logger.error("Lỗi khi lưu user vào cơ sở dữ liệu: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi lưu user: " + e.getMessage());
        }
    }

    @Transactional
    public User registerTeacher(String username, String password, String email, String phoneNumber, MultipartFile teacherImage) throws MessagingException, IOException {
        logger.info("Bắt đầu đăng ký giáo viên: username={}, email={}", username, email);

        // Kiểm tra định dạng email
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            logger.error("Email không hợp lệ: {}", email);
            throw new IllegalArgumentException("Email không hợp lệ.");
        }

        // Kiểm tra username tồn tại
        if (userRepository.findByUsername(username).isPresent()) {
            logger.error("Tài khoản đã tồn tại: username={}", username);
            throw new IllegalArgumentException("Tài khoản đã tồn tại.");
        }

        // Kiểm tra email tồn tại
        if (userRepository.findByEmail(email) != null) {
            logger.error("Email đã được sử dụng: email={}", email);
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole("teacher");
        user.setPhoneNumber(phoneNumber);
        user.setIsActive(false); // Chờ admin duyệt
        user.setVerified(false);
        user.setCreatedAt(Instant.now());

        // Tạo token xác nhận
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);

        // Xử lý ảnh xác thực
        if (teacherImage != null && !teacherImage.isEmpty()) {
            String contentType = teacherImage.getContentType();
            if (!"image/png".equals(contentType) && !"image/jpeg".equals(contentType)) {
                throw new IllegalArgumentException("Chỉ chấp nhận file PNG hoặc JPG");
            }

            byte[] processedFileBytes = processTeacherVerificationImage(teacherImage);
            String fileName = email.replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";
            Path uploadPath = Paths.get(HochoConfig.ABSOLUTE_PATH_TEACHER_VERIFICATION_UPLOAD_DIR, fileName);
            Files.createDirectories(uploadPath.getParent());
            Files.write(uploadPath, processedFileBytes);
        } else {
            throw new IllegalArgumentException("Ảnh xác thực giáo viên là bắt buộc.");
        }

        try {
            User savedUser = userRepository.save(user);
            logger.info("Đã lưu giáo viên vào cơ sở dữ liệu: id={}, username={}", savedUser.getId(), savedUser.getUsername());

            logger.info("Gửi email xác nhận tới: {}, token: {}", email, token);
            if (HochoConfig.EMAIL_SENDER) {
                emailService.sendVerificationEmail(email, token);
            } else {
                savedUser.setVerified(true);
                userRepository.save(savedUser);
            }
            return savedUser;
        } catch (Exception e) {
            logger.error("Lỗi khi lưu giáo viên: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi lưu giáo viên: " + e.getMessage());
        }
    }

    @Transactional
    public boolean verifyUser(String token) throws MessagingException {
        logger.info("Xác nhận user với token: {}", token);
        User user = userRepository.findByVerificationToken(token);
        if (user != null && !user.getVerified()) {
            user.setVerified(true);
            user.setVerificationToken(null);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            logger.info("Xác nhận thành công cho user: {}", user.getUsername());

            if (user.getRole().equals("teacher") && HochoConfig.EMAIL_SENDER) {
                emailService.sendTeacherRegistrationConfirmationEmail(user.getEmail(), user.getUsername());
            } else if (!user.getRole().equals("teacher")) {
                user.setIsActive(true);
                userRepository.save(user);
            }
            return true;
        }
        logger.warn("Xác nhận thất bại, token không hợp lệ hoặc đã được xác nhận: {}", token);
        return false;
    }

    public List<User> getPendingTeachers() {
        logger.info("Lấy danh sách giáo viên chờ duyệt");
        return userRepository.findByRoleAndIsActiveFalse("teacher");
    }

    @Transactional
    public void approveTeacher(Long userId) throws MessagingException {
        logger.info("Duyệt giáo viên với id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên với id: " + userId));
        if (user.getRole().equals("teacher")) {
            user.setIsActive(true);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            if (HochoConfig.EMAIL_SENDER) {
                emailService.sendTeacherApprovalEmail(user.getEmail(), user.getUsername(), true);
            }
            logger.info("Đã duyệt giáo viên: id={}, username={}", userId, user.getUsername());
        } else {
            logger.warn("User không phải giáo viên: id={}, role={}", userId, user.getRole());
            throw new IllegalArgumentException("User không phải giáo viên.");
        }
    }

    @Transactional
    public void rejectTeacher(Long userId) throws MessagingException {
        logger.info("Từ chối giáo viên với id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên với id: " + userId));
        if (user.getRole().equals("teacher")) {
            String fileName = user.getEmail().replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";
            Path filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_TEACHER_VERIFICATION_UPLOAD_DIR, fileName);
            try {
                Files.deleteIfExists(filePath);
                logger.info("Đã xóa ảnh xác thực: {}", filePath);
            } catch (IOException e) {
                logger.error("Lỗi khi xóa ảnh xác thực: {}", e.getMessage());
            }
            userRepository.delete(user);
            if (HochoConfig.EMAIL_SENDER) {
                emailService.sendTeacherApprovalEmail(user.getEmail(), user.getUsername(), false);
            }
            logger.info("Đã từ chối giáo viên: id={}, username={}", userId, user.getUsername());
        } else {
            logger.warn("User không phải giáo viên: id={}, role={}", userId, user.getRole());
            throw new IllegalArgumentException("User không phải giáo viên.");
        }
    }

    @Transactional
    public User updateUser(Long id, String username, String email, String phoneNumber, String fullName, String dateOfBirth, String role, Boolean isActive, Boolean verified) {
        logger.info("Updating user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (username != null) {
            if (!username.equals(user.getUsername()) && userRepository.findByUsername(username).isPresent()) {
                throw new IllegalArgumentException("Username đã tồn tại.");
            }
            user.setUsername(username);
        }
        if (email != null && !user.getRole().equals("child")) {
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                throw new IllegalArgumentException("Email không hợp lệ.");
            }
            if (!email.equals(user.getEmail()) && userRepository.findByEmail(email) != null) {
                throw new IllegalArgumentException("Email đã được sử dụng.");
            }
            user.setEmail(email);
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber);
        }
        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (dateOfBirth != null) {
            try {
                user.setDateOfBirth(LocalDate.parse(dateOfBirth));
            } catch (Exception e) {
                throw new IllegalArgumentException("Định dạng ngày sinh không hợp lệ.");
            }
        }
        if (role != null) {
            user.setRole(role);
        }
        if (isActive != null) {
            user.setIsActive(isActive);
        }
        if (verified != null) {
            user.setVerified(verified);
        }

        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    private byte[] processTeacherVerificationImage(MultipartFile file) throws IOException {
        byte[] fileBytes = file.getBytes();
        long fileSize = fileBytes.length;

        if (fileSize <= HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
            return fileBytes;
        }

        double quality = 0.8;
        double scale = 1.0;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE && scale > 0.1) {
            outputStream.reset();
            Thumbnails.of(new ByteArrayInputStream(fileBytes))
                    .scale(scale)
                    .outputQuality(quality)
                    .toOutputStream(outputStream);

            fileBytes = outputStream.toByteArray();
            fileSize = fileBytes.length;

            if (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
                scale -= 0.1;
            }
        }

        if (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
            throw new IllegalArgumentException("Không thể giảm kích thước file xuống dưới 10MB. Vui lòng chọn file nhỏ hơn.");
        }

        return fileBytes;
    }

    public User findByEmail(String email) {
        logger.info("Fetching user with email: {}", email);
        User user = userRepository.findByEmail(email);
        if (user != null) {
            logger.info("Found user: username={}, role={}, verified={}", user.getUsername(), user.getRole(), user.getVerified());
            return user;
        }
        logger.warn("No user found with email: {}", email);
        return null;
    }

    public User findByUsername(String username) {
        logger.info("Finding user with username: {}", username);
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            logger.info("Found user: username={}, role={}, verified={}", user.get().getUsername(), user.get().getRole(), user.get().getVerified());
            return user.get();
        } else {
            logger.warn("User not found with username: {}", username);
            throw new IllegalArgumentException("User not found with username: " + username);
        }
    }

    public void requestPasswordReset(String email) throws MessagingException {
        logger.info("Initiating password reset for email: {}", email);

        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.warn("No user found with email: {}", email);
            throw new IllegalArgumentException("Email không tồn tại trong hệ thống.");
        }

        if (user.getRole().equals("child")) {
            logger.warn("Password reset request denied for child account: {}", email);
            throw new IllegalArgumentException("Tài khoản học sinh không được phép đặt lại mật khẩu.");
        }

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiry(Instant.now().plusSeconds(RESET_TOKEN_EXPIRY_MINUTES * 60));
        userRepository.save(user);
        logger.info("Saved password reset token for user: {}", user.getUsername());

        emailService.sendPasswordResetEmail(email, user.getUsername(), token);
        logger.info("Password reset email sent to: {}", email);
    }

    public boolean resetPassword(String token, String newPassword) {
        logger.info("Processing password reset with token: {}", token);

        User user = userRepository.findByResetPasswordToken(token);
        if (user != null && user.getResetPasswordExpiry() != null && user.getResetPasswordExpiry().isAfter(Instant.now())) {
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null);
            user.setResetPasswordExpiry(null);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            logger.info("Password reset successful for user: {}", user.getUsername());
            return true;
        }

        logger.warn("Password reset failed, invalid or expired token: {}", token);
        return false;
    }

    public User updateUserProfile(String username, String fullName, String dateOfBirth, String phoneNumber) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));

        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (dateOfBirth != null) {
            try {
                user.setDateOfBirth(LocalDate.parse(dateOfBirth));
            } catch (Exception e) {
                throw new IllegalArgumentException("Wrong date format");
            }
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber);
        }

        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User updateUserPassword(String username, String oldPassword, String newPassword) {
        User user = findByUsername(username);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Error: Wrong old password!");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User updateProfilePicture(String username, MultipartFile file) throws IOException {
        User user = findByUsername(username);

        String contentType = file.getContentType();
        if (!"image/png".equalsIgnoreCase(contentType) && !"image/jpeg".equalsIgnoreCase(contentType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận file PNG hoặc JPG");
        }

        byte[] processedFileBytes = processFile(file);

        if (user.getAvatarUrl() != null && !"none".equals(user.getAvatarUrl())) {
            Path oldFilePath = Paths.get(HochoConfig.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR, user.getAvatarUrl());
            Files.deleteIfExists(oldFilePath);
        }

        String fileName = username + "_" + System.currentTimeMillis() + "." + getFileExtension(file.getOriginalFilename());
        Path uploadPath = Paths.get(HochoConfig.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR, fileName);
        Files.createDirectories(uploadPath.getParent());
        Files.write(uploadPath, processedFileBytes);

        user.setAvatarUrl(fileName);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        logger.info("Deleting user with id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (user.getRole().equals("child")) {
            parentChildMappingRepository.deleteByChildId(id);
            logger.info("Deleted parent-child mappings for child user id: {}", id);
        }

        userRepository.deleteById(id);
        logger.info("User deleted successfully: id={}", id);
    }

    private byte[] processFile(MultipartFile file) throws IOException {
        byte[] fileBytes = file.getBytes();
        long fileSize = fileBytes.length;

        if (fileSize <= HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
            return fileBytes;
        }

        double quality = 0.8;
        double scale = 1.0;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE && scale > 0.1) {
            outputStream.reset();
            Thumbnails.of(new ByteArrayInputStream(fileBytes))
                    .scale(scale)
                    .outputQuality(quality)
                    .toOutputStream(outputStream);

            fileBytes = outputStream.toByteArray();
            fileSize = outputStream.size();

            if (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
                scale -= 0.1;
            }
        }

        if (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
            throw new IllegalArgumentException("Không thể giảm kích thước file xuống dưới 10MB. Vui lòng chọn file nhỏ hơn.");
        }

        return fileBytes;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    // ADMIN

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id){
        return userRepository.findById(id);
    }

    public User save(User user){
        return userRepository.save(user);
    }

    public void deleteByChildId(Long id){
        parentChildMappingRepository.deleteByChildId(id);
    }

    public void deleteById(Long id){
        userRepository.deleteById(id);
    }

    public int getNumberOfChild(String username){
        User user = findByUsername(username);
        if (user.getRole().equalsIgnoreCase(UserRole.PARENT.name())) {
            return parentChildMappingRepository.getNumberOfChild(user);
        } else {
            return 0;
        }
    }
}