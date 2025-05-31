package com.d10rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "games")
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_id")
    private Long gameId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "age_group", nullable = false)
    @Enumerated(EnumType.STRING)
    private AgeGroup ageGroup;

    @Column(name = "category")
    private String category;

    @Column(name = "game_url")
    private String gameUrl;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ContentStatus status = ContentStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

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

enum ContentStatus {
    PENDING,
    APPROVED,
    REJECTED
} 