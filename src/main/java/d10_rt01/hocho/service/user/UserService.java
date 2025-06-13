package d10_rt01.hocho.service.user;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.email.EmailService;
import d10_rt01.hocho.utils.CustomLogger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UserService {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(UserService.class), DebugModeConfig.SERVICE_LAYER);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User registerUser(String username, String password, String email, String parentEmail, String role) throws MessagingException {
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

        // Kiểm tra username/email tồn tại
        if (userRepository.findByUsername(username) != null) {
            logger.error("Tài khoản đã tồn tại: username={}", username);
            throw new IllegalArgumentException("Tài khoản đã tồn tại.");
        }
        if (userRepository.findByEmail(role.equals("child") ? parentEmail : email) != null) {
            logger.error("Email đã được sử dụng: email={}", role.equals("child") ? parentEmail : email);
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmail(role.equals("child") ? parentEmail : email);
        user.setRole(role);
        user.setIsActive(false);
        user.setVerified(false);
        user.setCreatedAt(Instant.now());

        if (role.equals("parent")) {
            String token = UUID.randomUUID().toString();
            user.setVerificationToken(token);
            logger.info("Gửi email xác nhận tới: {}, token: {}", email, token);
            try {
                emailService.sendVerificationEmail(email, token);
            } catch (MessagingException e) {
                logger.error("Lỗi khi gửi email xác nhận: {}", e.getMessage());
                throw new MessagingException("Không thể gửi email xác nhận.", e);
            }
        } else {
            user.setVerified(true);
            user.setIsActive(true);
        }

        try {
            User savedUser = userRepository.save(user);
            logger.info("Đã lưu user vào cơ sở dữ liệu: id={}, username={}, role={}", savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
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
        User user = userRepository.findByUsername(username);
        if (user != null) {
            logger.info("Tìm thấy user: username={}, role={}, verified={}", user.getUsername(), user.getRole(), user.getVerified());
        } else {
            logger.warn("Không tìm thấy user với username: {}", username);
        }
        return user;
    }
}