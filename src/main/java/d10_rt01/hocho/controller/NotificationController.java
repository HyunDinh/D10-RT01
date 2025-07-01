package d10_rt01.hocho.controller;

import d10_rt01.hocho.dto.NotificationDto;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.UserRole;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.NotificationService;
import d10_rt01.hocho.service.feedback.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final FeedbackService feedbackService;

    // Lấy tất cả notification theo userId và role
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @RequestParam Long userId,
            @RequestParam UserRole role) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserIdAndRole(userId, role));
    }

    // Lấy notification chưa đọc
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(
            @RequestParam Long userId,
            @RequestParam UserRole role) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsByUserIdAndRole(userId, role));
    }

    // Đánh dấu một notification đã đọc
    @PostMapping("/mark-as-read/{notificationId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // Đánh dấu tất cả notification đã đọc
    @PostMapping("/mark-all-as-read")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam Long userId,
            @RequestParam UserRole role) {
        notificationService.markAllAsRead(userId, role);
        return ResponseEntity.ok().build();
    }

    // Đếm số notification chưa đọc
    @GetMapping("/unread/count")
    public ResponseEntity<Long> countUnreadNotifications(
            @RequestParam Long userId,
            @RequestParam UserRole role) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(userId, role));
    }

    @PostMapping("/test-create")
    public ResponseEntity<String> testCreateNotification() {
        try {
            // Tạo một notification test
            notificationService.createWelcomeNotification(1L, "Test User");
            return ResponseEntity.ok("Test notification created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create test notification: " + e.getMessage());
        }
    }

    @GetMapping("/check-admins")
    public ResponseEntity<String> checkAdmins() {
        try {
            List<User> admins = userRepository.findByRole("ADMIN");
            StringBuilder result = new StringBuilder();
            result.append("Found ").append(admins.size()).append(" admin users:\n");
            for (User admin : admins) {
                result.append("- ID: ").append(admin.getId())
                      .append(", Name: ").append(admin.getFullName())
                      .append(", Role: ").append(admin.getRole()).append("\n");
            }
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to check admins: " + e.getMessage());
        }
    }

    @GetMapping("/check-database")
    public ResponseEntity<String> checkDatabase() {
        try {
            // Kiểm tra xem có notification nào trong database không
            List<NotificationDto> allNotifications = notificationService.getNotificationsByUserIdAndRole(1L, UserRole.ADMIN);
            StringBuilder result = new StringBuilder();
            result.append("Total notifications in database: ").append(allNotifications.size()).append("\n");
            
            for (NotificationDto notification : allNotifications) {
                result.append("- ID: ").append(notification.getNotificationId())
                      .append(", Type: ").append(notification.getNotificationType())
                      .append(", Content: ").append(notification.getContent())
                      .append(", Created: ").append(notification.getCreatedAt()).append("\n");
            }
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to check database: " + e.getMessage());
        }
    }

    @PostMapping("/test-admin-notification")
    public ResponseEntity<String> testAdminNotification() {
        try {
            // Tìm admin đầu tiên
            List<User> admins = userRepository.findByRole("ADMIN");
            if (admins.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No admin users found in database");
            }
            
            User admin = admins.get(0);
            
            // Tạo notification test cho admin
            notificationService.createFeedbackReceivedNotification(
                admin.getId(), 
                "Test User", 
                "Test Feedback"
            );
            
            return ResponseEntity.ok("Test admin notification created successfully for admin ID: " + admin.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create test admin notification: " + e.getMessage());
        }
    }

    @PostMapping("/test-feedback-notification")
    public ResponseEntity<String> testFeedbackNotification() {
        try {
            // Tìm user đầu tiên để tạo feedback
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No users found in database");
            }
            
            User user = users.get(0);
            
            // Tạo feedback test
            d10_rt01.hocho.model.Feedback feedback = feedbackService.createFeedback(
                user.getId(),
                "Test Feedback Subject",
                "This is a test feedback content",
                "General",
                "Medium"
            );
            
            return ResponseEntity.ok("Test feedback created successfully with ID: " + feedback.getFeedbackId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create test feedback: " + e.getMessage());
        }
    }
} 