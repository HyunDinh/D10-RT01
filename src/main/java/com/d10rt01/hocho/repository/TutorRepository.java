package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorRepository extends JpaRepository<Tutor, Long> {
    //Tim kiem gia su dua tren user Id
    Tutor findByUser_UserId(Long userId);
} 