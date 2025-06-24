package d10_rt01.hocho.service.user;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.email.EmailService;
import d10_rt01.hocho.utils.CustomLogger;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
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

    public User registerUser(String username, String password, String email, String parentEmail, String role, String phoneNumber) throws MessagingException {
        logger.info("Bắt đầu đăng ký user: username={}, role={}", username, role);

        // Kiểm tra định dạng email
        if (role.equals("child") && !EMAIL_PATTERN.matcher(parentEmail).matches()) {
            logger.error("Email phụ huynh không hợp lệ: {}", parentEmail);
            throw new IllegalArgumentException("Email phụ huynh không hợp lệ.");
        }
        if (!role.equals("child") && !EMAIL_PATTERN.matcher(email).matches()) {
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
        user.setEmail(role.equals("child") ? null : email); // Không lưu email cho child
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

                // Gửi email xác nhận đến phụ huynh
                logger.info("Gửi email xác nhận tài khoản học sinh tới: {}, token: {}", parentEmail, token);
                if(HochoConfig.EMAIL_SENDER){
                    emailService.sendChildRegistrationConfirmationEmail(parentEmail, savedUser.getUsername(), token);
                } else {
                    savedUser.setVerified(true);
                    savedUser.setIsActive(true);
                    userRepository.save(user);
                }
            } else if (role.equals("parent")) {
                // Gửi email xác nhận cho parent
                logger.info("Gửi email xác nhận tới: {}, token: {}", email, token);
                if(HochoConfig.EMAIL_SENDER){
                    emailService.sendVerificationEmail(email, token);
                } else {
                    savedUser.setVerified(true);
                    savedUser.setIsActive(true);
                    userRepository.save(user);
                }
            } else {
                // Cho teacher: không cần email xác nhận, kích hoạt ngay
                savedUser.setVerified(true);
                savedUser.setIsActive(true);
                userRepository.save(savedUser);
            }
            return savedUser;
        } catch (Exception e) {
            logger.error("Lỗi khi lưu user vào cơ sở dữ liệu: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi lưu user: " + e.getMessage());
        }
    }

    public boolean verifyUser(String token) {
        logger.info("Xác nhận user với token: {}", token);
        User user = userRepository.findByVerificationToken(token);
        if (user != null && !user.getVerified()) {
            user.setVerified(true);
            user.setIsActive(true);
            user.setVerificationToken(null);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            logger.info("Xác nhận thành công cho user: {}", user.getUsername());
            return true;
        }
        logger.warn("Xác nhận thất bại, token không hợp lệ hoặc đã được xác nhận: {}", token);
        return false;
    }

    public User findByEmail(String email) {
        logger.info("Tìm kiếm user với email: {}", email);
        User user = userRepository.findByEmail(email);
        if (user != null) {
            logger.info("Tìm thấy user: username={}, role={}, verified={}", user.getUsername(), user.getRole(), user.getVerified());
        } else {
            logger.warn("Không tìm thấy user với email: {}", email);
        }
        return user;
    }

    public User findByUsername(String username) {
        logger.info("Tìm kiếm user với username: {}", username);
        User user = userRepository.findByUsername(username).get();
        if (user != null) {
            logger.info("Tìm thấy user: username={}, role={}, verified={}", user.getUsername(), user.getRole(), user.getVerified());
        } else {
            logger.warn("Không tìm thấy user với username: {}", username);
        }
        return user;
    }

    // Gửi yêu cầu đặt lại mật khẩu
    public void requestPasswordReset(String email) throws MessagingException {
        logger.info("Bắt đầu xử lý yêu cầu đặt lại mật khẩu cho email: {}", email);

        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.warn("Không tìm thấy người dùng với email: {}", email);
            throw new IllegalArgumentException("Email không tồn tại trong hệ thống.");
        }

        // Kiểm tra vai trò: không cho phép child
        if (user.getRole().equals("child")) {
            logger.warn("Yêu cầu đặt lại mật khẩu bị từ chối cho tài khoản học sinh: {}", email);
            throw new IllegalArgumentException("Tài khoản học sinh không được phép đặt lại mật khẩu.");
        }

        // Tạo token đặt lại mật khẩu
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiry(Instant.now().plusSeconds(RESET_TOKEN_EXPIRY_MINUTES * 60));
        userRepository.save(user);
        logger.info("Đã lưu token đặt lại mật khẩu cho user: {}", user.getUsername());

        // Gửi email đặt lại mật khẩu
        emailService.sendPasswordResetEmail(email, user.getUsername(), token);
        logger.info("Đã gửi email đặt lại mật khẩu tới: {}", email);
    }

    // Đặt lại mật khẩu
    public boolean resetPassword(String token, String newPassword) {
        logger.info("Xác nhận đặt lại mật khẩu với token: {}", token);

        User user = userRepository.findByResetPasswordToken(token);
        if (user != null && user.getResetPasswordExpiry() != null && user.getResetPasswordExpiry().isAfter(Instant.now())) {
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setResetPasswordToken(null);
            user.setResetPasswordExpiry(null);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            logger.info("Đặt lại mật khẩu thành công cho user: {}", user.getUsername());
            return true;
        }

        logger.warn("Đặt lại mật khẩu thất bại, token không hợp lệ hoặc đã hết hạn: {}", token);
        return false;
    }


    // PROFILE

    public User updateUserProfile(String username, String fullName, String dateOfBirth, String phoneNumber) {
        User user = userRepository.findByUsername(username).get();

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

        user.setUpdatedAt(java.time.Instant.now());
        return userRepository.save(user);
    }

    public User updateUserPassword(String username, String oldPassword, String newPassword) {
        User user = findByUsername(username);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Error : Wrong old password!");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User updateProfilePicture(String username, MultipartFile file) throws IOException {
        User user = findByUsername(username);

        // Kiểm tra loại file
        String contentType = file.getContentType();
        if (!"image/png".equals(contentType) && !"image/jpeg".equals(contentType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận file PNG hoặc JPG");
        }

        // Xử lý file: scale nếu cần
        byte[] processedFileBytes = processFile(file);

        // Xóa file avatar cũ nếu có
        if (user.getAvatarUrl() != null && !"none".equals(user.getAvatarUrl())) {
            Path oldFilePath = Paths.get(HochoConfig.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR, user.getAvatarUrl());
            Files.deleteIfExists(oldFilePath);
        }

        // Lưu file mới
        String fileName = username + "_" + System.currentTimeMillis() + "." + getFileExtension(file.getOriginalFilename());
        Path uploadPath = Paths.get(HochoConfig.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR, fileName);
        Files.createDirectories(uploadPath.getParent());
        Files.write(uploadPath, processedFileBytes);

        user.setAvatarUrl(fileName);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    private byte[] processFile(MultipartFile file) throws IOException {
        byte[] fileBytes = file.getBytes();
        long fileSize = fileBytes.length;

        // Nếu file nhỏ hơn giới hạn, không cần scale
        if (fileSize <= HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
            return fileBytes;
        }

        // Scale file để giảm kích thước
        double quality = 0.8; // Chất lượng ban đầu (0.0 - 1.0)
        double scale = 1.0;   // Tỷ lệ resize ban đầu
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE && quality > 0.1 && scale > 0.1) {
            outputStream.reset(); // Reset stream để ghi lại từ đầu
            Thumbnails.of(new ByteArrayInputStream(fileBytes))
                    .scale(scale) // Resize kích thước ảnh
                    .outputQuality(quality) // Giảm chất lượng ảnh
                    .toOutputStream(outputStream);

            fileBytes = outputStream.toByteArray();
            fileSize = fileBytes.length;

            // Giảm scale hoặc quality nếu vẫn vượt giới hạn
            if (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
                if (scale > 0.1) {
                    scale -= 0.1; // Giảm kích thước ảnh 10%
                } else {
                    quality -= 0.1; // Giảm chất lượng 10%
                    scale = 1.0; // Reset scale nếu đã giảm quality
                }
            }
        }

        // Nếu vẫn không đạt yêu cầu sau khi scale tối đa, throw exception
        if (fileSize > HochoConfig.MAX_PROFILE_PICTURE_SIZE) {
            throw new IllegalArgumentException("Không thể giảm kích thước file xuống dưới 10MB. Vui lòng chọn file nhỏ hơn.");
        }

        return fileBytes;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    // Lấy danh sách các con của phụ huynh
    public List<User> getChildrenOfParent(Long parentId) {
        List<ParentChildMapping> mappings = parentChildMappingRepository.findByParentId(parentId);
        List<User> children = new java.util.ArrayList<>();
        for (ParentChildMapping mapping : mappings) {
            children.add(mapping.getChild());
        }
        return children;
    }
}