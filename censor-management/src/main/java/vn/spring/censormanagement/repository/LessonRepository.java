package vn.spring.censormanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.spring.censormanagement.entity.Lesson;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @Query("Select l from Lesson l WHERE l.course.courseId = :courseId")
    List<Lesson> findByCourseId(Long courseId);
}
