package com.d10rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_notifications")
public class UserNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(name = "notification_type", nullable = false)
    private String notificationType;

    @Column(name = "content", columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
} 