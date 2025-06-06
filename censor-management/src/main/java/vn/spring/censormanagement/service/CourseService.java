package vn.spring.censormanagement.service;

import vn.spring.censormanagement.entity.Course;

import java.util.List;

public interface CourseService {
    public Course findCourseDetails(Long courseId);

    List<Course> findByCourseName(String courseName);
    List<Course> getAllCourse();
}
