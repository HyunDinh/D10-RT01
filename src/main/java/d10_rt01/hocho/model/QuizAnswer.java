package d10_rt01.hocho.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_answers")
@Data
public class QuizAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerId;

    @ManyToOne
    @JoinColumn(name = "result_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private QuizResult result;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @ToString.Exclude
    private QuizQuestion question;

    @Column(name = "selected_option_id", nullable = false)
    private String selectedOptionId;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
} 