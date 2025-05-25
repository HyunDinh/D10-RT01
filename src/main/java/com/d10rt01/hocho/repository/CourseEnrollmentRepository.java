package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByChildUserId(Long childId);
    List<CourseEnrollment> findByParentUserId(Long parentId);
    boolean existsByChildUserIdAndCourseCourseId(Long childId, Long courseId);
} 