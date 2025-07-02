package d10_rt01.hocho.dto;

import d10_rt01.hocho.model.enums.NotificationType;
import d10_rt01.hocho.model.enums.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private Long notificationId;
    private Long userId;
    private UserRole userRole;
    private NotificationType notificationType;
    private String content;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private Long relatedEntityId;
    private String senderName; // Tên người gửi (nếu có)
} 