package org.example.coursemanager.dto;

import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import org.example.coursemanager.entity.Teacher;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TeacherDAO {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Teacher> getAllTeachers() {
        return entityManager.createQuery("from Teacher", Teacher.class).getResultList();
    }

    @Transactional
    public Teacher findById(int id) {
        return entityManager.find(Teacher.class, id);
    }

    @Transactional
    public void deleteById(int id) {
        Teacher teacher = entityManager.find(Teacher.class, id);
        if (teacher != null) {
            entityManager.remove(teacher);
        }
    }

    @Transactional
    public void saveTeacher(Teacher teacher) {
            entityManager.persist(teacher);
    }

    @Transactional
    public void updateTeacher(Teacher teacher) {
        Teacher existingTeacher = entityManager.find(Teacher.class, teacher.getUser_id());
        if (existingTeacher != null) {
            existingTeacher.setFull_name(teacher.getFull_name());
            existingTeacher.setEmail(teacher.getEmail());
            existingTeacher.set_active(teacher.is_active());
        }
    }
}