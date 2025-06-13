package com.d10rt01.hocho.repository.quiz;

import com.d10rt01.hocho.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    @Query("SELECT q FROM Quiz q JOIN q.course c WHERE c.courseId = :courseId")
    List<Quiz> findQuizzesByCourseId(Long courseId);
} 