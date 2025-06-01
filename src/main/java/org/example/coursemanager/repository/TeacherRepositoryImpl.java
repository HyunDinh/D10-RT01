package org.example.coursemanager.repository;

import org.example.coursemanager.dao.CourseDaoImpl;
import org.example.coursemanager.dao.TeacherDaoImpl;
import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TeacherRepositoryImpl implements TeacherRepository {
    @Autowired
    private TeacherDaoImpl teacherDao;

    @Autowired
    private CourseDaoImpl courseDao;

    @Override
    public List<Teacher> findAll() {
        return teacherDao.findAllTeachers();
    }

    @Override
    public Teacher findById(int id) {
        return teacherDao.findById(id);
    }

    @Override
    public List<Course> findCoursesByTeacherId(int teacherId) {
        return courseDao.findCoursesByTeacherId(teacherId);
    }

    @Override
    public void addCourseByTeacherId(int teacherId, Course course) {
        Teacher teacher = teacherDao.findById(teacherId);
        if (teacher != null) {
            course.setTeacher(teacher);
            courseDao.addCourseByTeacherId(teacherId, course);
        } else {
            throw new IllegalArgumentException("Teacher not found with ID: " + teacherId);
        }
    }
//    TeacherDao teacherDAO;
//
//    @Autowired
//    public TeacherRepositoryImpl(TeacherDao teacherDAO) {
//        this.teacherDAO = teacherDAO;
//    }
//
//    public List<Teacher> getAllTeachers() {
//        return teacherDAO.getAllTeachers();
//    }
//
//    public Teacher findById(int id) {
//        return teacherDAO.findById(id);
//    }
//
//    public void saveTeacher(Teacher teacher) {
//        teacherDAO.saveTeacher(teacher);
//    }
//
//    public void deleteById(int id) {
//        teacherDAO.deleteById(id);
//    }
//
//    public void update(Teacher teacher) {
//        teacherDAO.updateTeacher(teacher);
//    }
}
