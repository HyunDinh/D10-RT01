package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByChildId(Long childId);
    List<CourseEnrollment> findByParentId(Long parentId);
    boolean existsByChildIdAndCourseCourseId(Long childId, Long courseId);
} 