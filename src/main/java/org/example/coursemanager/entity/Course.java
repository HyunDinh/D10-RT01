package org.example.coursemanager.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Represents a Course entity in the system.
 * Maps to the "courses" table in the database.
 */
@Getter
@Setter
@Entity
@Table(name = "courses")
public class Course {

    /**
     * The unique identifier for the course.
     * Auto-generated using the IDENTITY strategy.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int course_id;

    /**
     * The title of the course.
     * Cannot be null and has a maximum length of 100 characters.
     */
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    /**
     * A brief description of the course.
     * Optional and has a maximum length of 500 characters.
     */
    @Column(name = "description", length = 500)
    private String description;

    /**
     * The target age group for the course.
     * Cannot be null and has a maximum length of 10 characters.
     */
    @Column(name = "age_group", nullable = false, length = 10)
    private String age_group;

    /**
     * The price of the course.
     * Cannot be null.
     */
    @Column(name = "price", nullable = false)
    private Double price;

    /**
     * The current status of the course (e.g., active, inactive).
     * Cannot be null and has a maximum length of 20 characters.
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    /**
     * The timestamp when the course was created.
     * Automatically set before the entity is persisted.
     * Cannot be updated.
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime created_at;

    /**
     * The timestamp when the course was last updated.
     * Automatically set before the entity is updated.
     */
    @Column(name = "updated_at")
    private LocalDateTime updated_at;

    /**
     * The teacher associated with the course.
     * Uses a many-to-one relationship with cascading operations.
     * Maps to the "teacher_id" column in the database.
     */
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

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
        this.age_group = course.age_group;
        this.price = course.price;
        this.status = course.status;
        this.created_at = course.created_at;
        this.updated_at = course.updated_at;
    }

    /**
     * Parameterized constructor.
     * Initializes a new Course instance with the specified properties.
     *
     * @param title       The title of the course.
     * @param description The description of the course.
     * @param age_group   The target age group for the course.
     * @param price       The price of the course.
     * @param status      The status of the course.
     */
    public Course(String title, String description, String age_group, Double price, String status) {
        this.title = title;
        this.description = description;
        this.age_group = age_group;
        this.price = price;
        this.status = status;
    }

    /**
     * Sets the created_at timestamp before the entity is persisted.
     * Automatically called by JPA.
     */
    @PrePersist
    protected void onCreate() {
        this.created_at = LocalDateTime.now();
    }

    /**
     * Sets the updated_at timestamp before the entity is updated.
     * Automatically called by JPA.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updated_at = LocalDateTime.now();
    }
}