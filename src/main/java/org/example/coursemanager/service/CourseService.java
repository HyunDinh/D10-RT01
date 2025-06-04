package org.example.coursemanager.service;

import jakarta.transaction.Transactional;
import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.User;
import org.example.coursemanager.repository.CourseRepository;
import org.example.coursemanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCourseByTeacherId(long teacherId) {
        return courseRepository.findCoursesByTeacherId(teacherId);
    }

    @Transactional
    public void addCourseByTeacherId(Long teacherId, Course course) {
        if (course == null || teacherId == null || teacherId <= 0) {
            throw new IllegalArgumentException("Course and teacher ID must not be null");
        }
        User teacher = userRepository.findById(teacherId)
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found with ID: " + teacherId));

        course.setTeacher(teacher);
        courseRepository.save(course);
    }

    @Transactional
    public void editCourse(long id, Course course) {
        if (course != null && courseRepository.existsById(id)) {
            Course existingCourse = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
            existingCourse.setTitle(course.getTitle());
            existingCourse.setDescription(course.getDescription());
            existingCourse.setAgeGroup(course.getAgeGroup());
            existingCourse.setPrice(course.getPrice());
            existingCourse.setTeacher(course.getTeacher());
            courseRepository.save(existingCourse);
        }
    }

    public void deleteCourse(long id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
        }
    }
}
