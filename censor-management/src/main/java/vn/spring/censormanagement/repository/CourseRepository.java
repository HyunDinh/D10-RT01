package vn.spring.censormanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.spring.censormanagement.entity.Course;
import vn.spring.censormanagement.entity.CourseStatus;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    //Course findByCourseId(Long courseId);

    List<Course> findByStatus(CourseStatus status);
}
