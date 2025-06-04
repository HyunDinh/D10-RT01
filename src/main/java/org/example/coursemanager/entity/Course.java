package org.example.coursemanager.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a Course entity in the system.
 * Maps to the "courses" table in the database.
 */
@Data
@Entity
@Table(name = "courses")
public class Course {

    /**
     * The unique identifier for the course.
     * Auto-generated using the IDENTITY strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    /**
     * The title of the course.
     * Cannot be null and has a maximum length of 100 characters.
     */
    @Column(name = "title", nullable = false)
    private String title;

    /**
     * A brief description of the course.
     * Optional and has a maximum length of 500 characters.
     */
    @Column(name = "description")
    private String description;

    /**
     * The target age group for the course.
     * Cannot be null and has a maximum length of 10 characters.
     */
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @JsonProperty("age_group")
    @Column(name = "age_group", nullable = false)
    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup;

    /**
     * The price of the course.
     * Cannot be null.
     */
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * The current status of the course (e.g., active, inactive).
     * Cannot be null and has a maximum length of 20 characters.
     */
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.PENDING;

    /**
     * The timestamp when the course was created.
     * Automatically set before the entity is persisted.
     * Cannot be updated.
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * The timestamp when the course was last updated.
     * Automatically set before the entity is updated.
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Default constructor.
     * Initializes a new instance of the Course class.
     */
    public Course() {
        super();
    }

    /**
     * Copy constructor.
     * Creates a new Course instance by copying the properties of another Course.
     *
     * @param course The Course instance to copy.
     */
    public Course(Course course) {
        this.title = course.title;
        this.description = course.description;
        this.ageGroup = course.ageGroup;
        this.price = course.price;
        this.status = course.status;
        this.createdAt = course.createdAt;
        this.updatedAt = course.updatedAt;
    }

    /**
     * Parameterized constructor.
     * Initializes a new Course instance with the specified properties.
     *
     * @param title       The title of the course.
     * @param description The description of the course.
     * @param ageGroup    The target age group for the course.
     * @param price       The price of the course.
     * @param status      The status of the course.
     */
    public Course(String title, String description, AgeGroup ageGroup, BigDecimal price, CourseStatus status) {
        this.title = title;
        this.description = description;
        this.ageGroup = ageGroup;
        this.price = price;
        this.status = status;
    }

    /**
     * Sets the created_at timestamp before the entity is persisted.
     * Automatically called by JPA.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Sets the updated_at timestamp before the entity is updated.
     * Automatically called by JPA.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum AgeGroup {
    AGE_4_6,
    AGE_7_9,
    AGE_10_12,
    AGE_13_15
}

enum CourseStatus {
    PENDING,
    APPROVED,
    REJECTED
}