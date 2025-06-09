package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findLessonByCourseCourseId(Long courseId);
}