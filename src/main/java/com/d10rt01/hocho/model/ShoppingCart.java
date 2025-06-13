package com.d10rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "shopping_cart")
public class ShoppingCart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Long cartId;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    @Column(name = "status_by_parent")
    @Enumerated(EnumType.STRING)
    private CartStatus statusByParent = CartStatus.PENDING_APPROVAL;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
} 