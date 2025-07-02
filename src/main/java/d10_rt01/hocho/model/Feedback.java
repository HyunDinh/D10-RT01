package d10_rt01.hocho.model;

import d10_rt01.hocho.model.enums.FeedbackStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "subject", nullable = false, columnDefinition = "NVARCHAR(MAX)", length = 200)
    private String subject;

    @Column(name = "content", nullable = false, columnDefinition = "NVARCHAR(MAX)", length = 5000)
    private String content;

    @Column(name = "category", nullable = false, length = 50)
    private String category; // BUG_REPORT, FEATURE_REQUEST, GENERAL, TECHNICAL_SUPPORT

    @Column(name = "priority", nullable = false, length = 20)
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private FeedbackStatus status = FeedbackStatus.PENDING;

    @Column(name = "admin_response", columnDefinition = "NVARCHAR(MAX)")
    private String adminResponse;

    @Column(name = "response_date")
    private LocalDateTime responseDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 