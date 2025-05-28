package org.example.coursemanager.service;

import java.util.List;

public interface TeacherService<Teacher, Course> {
    List<Teacher> getAllTeachers();
    Teacher findById(int id);
    void save(Teacher t);
    void deleteById(int id);
    void update(Teacher t);
    void addCourseToTeacher(int teacherId, Course course);
}
