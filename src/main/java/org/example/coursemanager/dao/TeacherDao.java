package org.example.coursemanager.dao;

import org.example.coursemanager.entity.Teacher;

import java.util.List;

public interface TeacherDao {
    List<Teacher> findAllTeachers();
    Teacher findById(int id);
}
