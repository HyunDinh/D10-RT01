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
@Table(name = "quiz_results")
@Data
@JsonIdentityInfo(
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "resultId")
public class QuizResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    @ToString.Exclude
    private User child;

    @Column(nullable = false)
    private Integer score;

    @OneToMany(mappedBy = "result", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @ToString.Exclude
    private List<QuizAnswer> answers = new ArrayList<>();

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
} 