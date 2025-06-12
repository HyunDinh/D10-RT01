package vn.spring.censormanagement.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.spring.censormanagement.entity.Course;
import vn.spring.censormanagement.entity.CourseStatus;
import vn.spring.censormanagement.repository.CourseRepository;

import java.util.List;

@Service
public class CourseServicelmpl implements CourseService {
    private CourseRepository courseRepository;

    @Autowired
    public CourseServicelmpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourse() {
        return courseRepository.findAll();
    }

    @Override
    public List<Course> getAllPendingCourse() {
        CourseStatus status = CourseStatus.PENDING;
        List<Course> courseList = courseRepository.findByStatus(status);
        return courseList;
    }

    @Transactional
    @Override
    public void rejectCourse(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(()-> new RuntimeException("Course Not Found"));
        course.setStatus(CourseStatus.REJECTED);
        courseRepository.save(course);
    }

    @Transactional
    @Override
    public void approveCourse(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(()-> new RuntimeException("Course Not Found"));
        course.setStatus(CourseStatus.APPROVED);
        courseRepository.save(course);
    }
}
