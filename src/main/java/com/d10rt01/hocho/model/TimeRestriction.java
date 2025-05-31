package com.d10rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "time_restrictions")
public class TimeRestriction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restriction_id")
    private Long restrictionId;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @Column(name = "max_study_time")
    private Integer maxStudyTime;

    @Column(name = "max_play_time")
    private Integer maxPlayTime;

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