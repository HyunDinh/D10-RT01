package org.example.coursemanager.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.coursemanager.entity.Teacher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.parser.Entity;
import java.util.List;

@Repository
public class TeacherDaoImpl implements TeacherDao {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<Teacher> findAllTeachers() {
        return em.createQuery("SELECT t FROM Teacher t", Teacher.class).getResultList();
    }

    @Override
    public Teacher findById(int id) {
        return em.find(Teacher.class, id);
    }
}
