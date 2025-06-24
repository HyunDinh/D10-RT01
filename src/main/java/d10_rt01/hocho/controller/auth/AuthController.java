package d10_rt01.hocho.controller.auth;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.dto.LoginRequest;
import d10_rt01.hocho.dto.RegisterRequest;
import d10_rt01.hocho.dto.UserResponse;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.user.UserService;
import d10_rt01.hocho.utils.CustomLogger;
import jakarta.servlet.http.HttpSession;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.MessagingException;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(AuthController.class), DebugModeConfig.CONTROLLER_LAYER);

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    // ------------------------------------ REGISTER ------------------------------------

    @PostMapping(value = "/register", consumes = {"multipart/form-data"})
    public ResponseEntity<?> register(
            @RequestPart("request") RegisterRequest request,
            @RequestPart(value = "teacherImage", required = false) MultipartFile teacherImage) throws MessagingException, IOException {
        logger.info("Processing register request for username: {}, role: {}", request.getUsername(), request.getRole());

        if (!request.getPassword().equals(request.getRetypePassword())) {
            logger.warn("Password mismatch for username: {}", request.getUsername());
            return ResponseEntity.badRequest().body("Mật khẩu không khớp.");
        }

        if (request.getRole().equals("teacher") && (teacherImage == null || teacherImage.isEmpty())) {
            logger.warn("Teacher image is required for teacher registration: {}", request.getUsername());
            return ResponseEntity.badRequest().body("Ảnh xác thực giáo viên là bắt buộc.");
        }

        try {
            User user = userService.registerUser(
                    request.getUsername(),
                    request.getPassword(),
                    request.getEmail(),
                    request.getParentEmail(),
                    request.getRole(),
                    request.getPhoneNumber(),
                    teacherImage
            );
            String successMessage = user.getRole().equals("parent") || user.getRole().equals("child") ?
                    "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản." :
                    "Đăng ký thành công. Vui lòng chờ admin duyệt tài khoản.";
            logger.info("Registration successful for username: {}", request.getUsername());
            return ResponseEntity.ok(successMessage);
        } catch (IllegalArgumentException e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .header("Location", "http://localhost:3000/hocho/login?error=" +
                            URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8))
                    .body(null);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) throws MessagingException {
        boolean verified = userService.verifyUser(token);
        if (verified) {
            logger.info("Verification successful for token: {}", token);
            return ResponseEntity.ok("Xác nhận thành công. Bạn có thể đăng nhập.");
        }
        logger.warn("Verification failed for token: {}", token);
        return ResponseEntity.badRequest().body("Token không hợp lệ hoặc đã được xác nhận.");
    }

    @GetMapping("/verify-child")
    public ResponseEntity<?> verifyChild(@RequestParam String token) throws MessagingException {
        boolean verified = userService.verifyUser(token);
        if (verified) {
            logger.info("Child verification successful for token: {}", token);
            return ResponseEntity.ok("Xác nhận tài khoản học sinh thành công. Tài khoản đã được kích hoạt.");
        }
        logger.warn("Child verification failed for token: {}", token);
        return ResponseEntity.badRequest().body("Token không hợp lệ hoặc tài khoản đã được xác nhận.");
    }

    // ------------------------------------ LOGIN ------------------------------------

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContext securityContext = SecurityContextHolder.getContext();
            securityContext.setAuthentication(authentication);
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);

            if (request.isRememberMe()) {
                logger.info("Remember Me enabled for username: {}", request.getUsername());
            }

            logger.info("Login successful for username: {}", request.getUsername());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Login failed for username: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Wrong username or password. Please try again.");
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            if (user != null) {
                UserResponse userResponse = getUserResponse(user);
                logger.info("Retrieved user info for username: {}", username);
                return ResponseEntity.ok(userResponse);
            }
        }
        logger.warn("No authenticated user found");
        return ResponseEntity.status(401).body("Chưa đăng nhập.");
    }

    private static UserResponse getUserResponse(User user) {
        UserResponse userResponse = new UserResponse();
        userResponse.setUsername(user.getUsername());
        userResponse.setEmail(user.getEmail());
        userResponse.setFullName(user.getFullName());
        userResponse.setDateOfBirth(user.getDateOfBirth());
        userResponse.setPhoneNumber(user.getPhoneNumber());
        userResponse.setRole(user.getRole());
        userResponse.setAvatarUrl(user.getAvatarUrl());
        userResponse.setActive(user.getIsActive());
        userResponse.setVerified(user.getVerified());
        if (user.getCreatedAt() != null) {
            userResponse.setCreatedAt(LocalDateTime.ofInstant(user.getCreatedAt(), ZoneId.systemDefault()));
        }
        if (user.getUpdatedAt() != null) {
            userResponse.setUpdatedAt(LocalDateTime.ofInstant(user.getUpdatedAt(), ZoneId.systemDefault()));
        }
        return userResponse;
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<?> oauth2Success(HttpSession session) {
        logger.task("Processing Google login success, session ID: {}", session.getId());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof OidcUser oidcUser) {
            String email = oidcUser.getEmail();
            User user = userService.findByEmail(email);
            if (user != null) {
                if (!user.getIsActive() || !user.getVerified()) {
                    logger.error("User not active or not verified for email: {}", email);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Tài khoản chưa được kích hoạt hoặc xác minh.");
                }
                session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
                logger.info("Google login successful for email: {} - Username founded : {}", email, user.getUsername());
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", "http://localhost:3000/hocho/home")
                        .body(null);
            } else {
                logger.error("Email not found in database: {}", email);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", "http://localhost:3000/hocho/login?oauthError=" +
                                java.net.URLEncoder.encode("Chưa liên kết tài khoản", StandardCharsets.UTF_8))
                        .body(null);
            }
        }
        logger.error("No authenticated user found after Google login");
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "http://localhost:3000/hocho/login?oauthError=" +
                        java.net.URLEncoder.encode("Đăng nhập Google thất bại", StandardCharsets.UTF_8))
                .body(null);
    }

    // Yêu cầu đặt lại mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            logger.warn("Email is required for password reset");
            return ResponseEntity.badRequest().body("Email is required.");
        }

        try {
            if (HochoConfig.EMAIL_SENDER) {
                userService.requestPasswordReset(email);
                logger.info("Password reset link sent to email: {}", email);
                return ResponseEntity.ok("A password reset link has been sent to your email.");
            } else {
                logger.info("Email sending disabled for password reset");
                return ResponseEntity.ok("Email related features are currently disabled, please contact the developer to use this feature");
            }
        } catch (IllegalArgumentException e) {
            logger.error("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (MessagingException e) {
            logger.error("Lỗi gửi email đặt lại mật khẩu: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi gửi email. Vui lòng thử lại sau.");
        }
    }

    // Đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null || token.isEmpty() || newPassword.isEmpty()) {
            logger.warn("Token or new password missing");
            return ResponseEntity.badRequest().body("Token và mật khẩu mới là bắt buộc.");
        }

        boolean success = userService.resetPassword(token, newPassword);
        if (success) {
            logger.info("Password reset successful");
            return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
        }
        logger.warn("Password reset failed for token: {}", token);
        return ResponseEntity.badRequest().body("Token không hợp lệ hoặc đã hết hạn.");
    }

    // ------------------------------------ LOGOUT ------------------------------------
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        logger.task("Processing logout, session ID: {}", session.getId());
        SecurityContextHolder.clearContext();
        session.invalidate();
        return ResponseEntity.ok("Đăng xuất thành công.");
    }
}