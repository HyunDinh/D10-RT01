package d10_rt01.hocho.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@JsonIdentityInfo(
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "quizId")
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quizId;

    @ManyToOne
    @JoinColumn(name = "course_id", referencedColumnName = "course_id", nullable = false)
    @ToString.Exclude
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "time_limit", nullable = false)
    private Integer timeLimit; // Thời gian làm bài (phút)

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @ToString.Exclude
    private List<QuizQuestion> questions = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Helper method to add a question and set the bidirectional relationship
    public void addQuestion(QuizQuestion question) {
        questions.add(question);
        question.setQuiz(this);
    }

    // Helper method to remove a question and break the bidirectional relationship
    public void removeQuestion(QuizQuestion question) {
        questions.remove(question);
        question.setQuiz(null);
    }
} 