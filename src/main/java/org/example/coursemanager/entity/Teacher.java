package org.example.coursemanager.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "users")
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int user_id;

    @Column(name = "username", unique = true, nullable = false, length = 20)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String password_hash;

    @Column(name = "full_name", unique = true, nullable = false, length = 50)
    private String full_name;

    @Column(name = "email", unique = true, nullable = false, length = 50)
    private String email;

    @Column(name = "role", nullable = false, length = 20)
    private String role = "teacher";

    @Column(name = "is_active", nullable = false)
    private boolean is_active;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "teacher_id")
    private Set<Course> courses;

    // Default constructor
    public Teacher() {
        this.courses = new HashSet<>();
    }

    // Parameterized constructor
    public Teacher(String full_name, String username, String password_hash, String email, boolean is_active) {
        this.full_name = full_name;
        this.username = username;
        this.password_hash = password_hash;
        this.email = email;
        this.is_active = is_active;
        this.courses = new HashSet<>();
    }
}