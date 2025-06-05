package com.d10rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "chat_sessions")
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    @ManyToOne
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (user1 != null && user2 != null && user1.getId() > user2.getId()) {
            User temp = user1;
            user1 = user2;
            user2 = temp;
        }
    }

    public boolean isParticipant(Long userId) {
        return user1 != null && user2 != null && 
               (user1.getId().equals(userId) || user2.getId().equals(userId));
    }

    public User getOtherParticipant(Long userId) {
        if (user1 != null && user2 != null) {
            return user1.getId().equals(userId) ? user2 : user1;
        }
        return null;
    }
} 