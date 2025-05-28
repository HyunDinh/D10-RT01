package org.example.coursemanager.service;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.example.coursemanager.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherServiceImpl implements TeacherService<Teacher, Course> {

    private final TeacherRepository<Teacher> teacherRepository;

    @Autowired
    public TeacherServiceImpl(TeacherRepository<Teacher> teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @Override
    public List<Teacher> getAllTeachers() {
        return teacherRepository.getAllTeachers();
    }

    @Override
    public Teacher findById(int id) {
        return teacherRepository.findById(id);
    }

    @Override
    public void save(Teacher t) {
        teacherRepository.save(t);
    }

    @Override
    public void deleteById(int id) {
        teacherRepository.deleteById(id);
    }

    @Override
    public void update(Teacher t) {
        teacherRepository.update(t);
    }

    @Override
    public void addCourseToTeacher(int teacherId, Course course) {
        Teacher teacher = teacherRepository.findById(teacherId);
        if (teacher != null) {
            course.setTeacher(teacher);
            teacher.getCourses().add(course);
            teacherRepository.save(teacher);
        } else {
            throw new IllegalArgumentException("Teacher not found with ID: " + teacherId);
        }
    }


}