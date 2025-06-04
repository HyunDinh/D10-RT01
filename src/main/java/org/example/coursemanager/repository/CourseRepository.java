package org.example.coursemanager.repository;

import org.example.coursemanager.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // This method retrieves all courses associated with a specific teacher by their ID
    @Query("SELECT c FROM Course c WHERE c.teacher.userId = ?1")
    List<Course> findCoursesByTeacherId(Long teacherId);

    List<Course> findByAgeGroup(String ageGroup);
}
