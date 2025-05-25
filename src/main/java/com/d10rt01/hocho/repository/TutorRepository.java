package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorRepository extends JpaRepository<Tutor, Long> {
    // Spring Data JPA will provide basic CRUD methods
    // Add custom query methods if needed later
    Tutor findByUser_UserId(Long userId);
} 