package org.example.coursemanager.service;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

public interface TeacherService {
    List<Teacher> getAllTeachers();
    Teacher findById(int id);
    List<Course> findCoursesByTeacherId(int teacherId);
//    void saveTeacher(Teacher t);
//    void deleteById(int id);
//    void update(Teacher t);
    void addCourseToTeacher(int teacherId, Course course);
}
