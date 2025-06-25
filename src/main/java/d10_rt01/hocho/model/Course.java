package d10_rt01.hocho.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import d10_rt01.hocho.model.enums.AgeGroup;
import d10_rt01.hocho.model.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "course_image_url")
    private String courseImageUrl;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @JsonProperty("age_group")
    @Column(name = "age_group", nullable = false)
    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}