package com.d10rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "parent_child_mapping")
public class ParentChildMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mapping_id")
    private Long mappingId;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;
} 