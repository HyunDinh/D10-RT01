package d10_rt01.hocho.controller;

import d10_rt01.hocho.config.DebugModeConfig;
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

import jakarta.mail.MessagingException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(UserController.class), DebugModeConfig.CONTROLLER_LAYER);

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public UserController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    // ------------------------------------ REGISTER ------------------------------------

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) throws MessagingException {
        if (!request.getPassword().equals(request.getRetypePassword())) {
            return ResponseEntity.badRequest().body("Mật khẩu không khớp.");
        }

        try {
            User user = userService.registerUser(
                    request.getUsername(),
                    request.getPassword(),
                    request.getEmail(),
                    request.getParentEmail(),
                    request.getRole(),
                    request.getPhoneNumber()
            );
            String successMessage = user.getRole().equals("parent") ?
                    "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản." :
                    "Đăng ký thành công.";
            return ResponseEntity.ok(successMessage);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .header("Location", "http://localhost:3000/hocho/login?error=" +
                            URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8))
                    .body(null);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        boolean verified = userService.verifyUser(token);
        if (verified) {
            return ResponseEntity.ok("Xác nhận thành công. Bạn có thể đăng nhập.");
        }
        return ResponseEntity.badRequest().body("Token không hợp lệ hoặc đã được xác nhận.");
    }

    @GetMapping("/verify-child")
    public ResponseEntity<?> verifyChild(@RequestParam String token) {
        boolean verified = userService.verifyUser(token);
        if (verified) {
            return ResponseEntity.ok("Xác nhận tài khoản học sinh thành công. Tài khoản đã được kích hoạt.");
        }
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

            // Spring Security tự động xử lý rememberMe dựa trên tham số rememberMe
            if (request.isRememberMe()) {
                logger.info("Remember Me enabled for username: {}", request.getUsername());
            }

            return ResponseEntity.ok().build(); // Trả về 200 OK
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Tên đăng nhập hoặc mật khẩu sai.");
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
            return ResponseEntity.badRequest().body("Email là bắt buộc.");
        }

        try {
            userService.requestPasswordReset(email);
            return ResponseEntity.ok("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.");
        } catch (IllegalArgumentException e) {
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
            return ResponseEntity.badRequest().body("Token và mật khẩu mới là bắt buộc.");
        }

        boolean success = userService.resetPassword(token, newPassword);
        if (success) {
            return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công.");
        }
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

