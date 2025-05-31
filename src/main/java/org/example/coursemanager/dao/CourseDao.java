package org.example.coursemanager.dao;

import org.example.coursemanager.entity.Course;

import java.util.List;

public interface CourseDao {
//    List<Course> findAllCourses();
    List<Course> findCoursesByTeacherId(int teacherId);
    void addCourseByTeacherId(int teacherId, Course course);
}
