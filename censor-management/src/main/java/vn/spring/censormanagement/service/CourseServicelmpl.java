package vn.spring.censormanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.spring.censormanagement.entity.Course;
import vn.spring.censormanagement.repository.CourseRepository;

import java.util.List;

@Service
public class CourseServicelmpl implements CourseService {
    private CourseRepository courseRepository;

    @Autowired
    public CourseServicelmpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public Course findCourseDetails(Long courseId) {
        return null;
    }

    public List<Course> findByCourseName(String courseName) {
        return courseRepository.findByTitle(courseName);
    }

    public List<Course> getAllCourse() {
        return courseRepository.findAll();
    }
}
