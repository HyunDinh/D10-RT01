package org.example.coursemanager.repository;

import org.example.coursemanager.dto.TeacherDAO;
import org.example.coursemanager.entity.Teacher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TeacherRepositoryImpl {
    TeacherDAO teacherDAO;

    @Autowired
    public TeacherRepositoryImpl(TeacherDAO teacherDAO) {
        this.teacherDAO = teacherDAO;
    }

    public List<Teacher> getAllTeachers() {
        return teacherDAO.getAllTeachers();
    }


    public Teacher findById(int id) {
        return teacherDAO.findById(id);
    }


    public void saveTeacher(Teacher teacher) {
        teacherDAO.saveTeacher(teacher);
    }

    public void deleteById(int id) {
        teacherDAO.deleteById(id);
    }

    public void update(Teacher teacher) {
        teacherDAO.updateTeacher(teacher);
    }
}
