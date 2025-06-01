package org.example.coursemanager.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Session;
import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public class CourseDaoImpl implements CourseDao {

    @PersistenceContext
    private EntityManager em;

//    @Override
//    public List<Course> findAllCourses() {
//        return em.createQuery("SELECT c FROM Course c", Course.class).getResultList();
//    }

    @Override
    public List<Course> findCoursesByTeacherId(int teacherId) {
        return em.createQuery("SELECT c FROM Course c WHERE c.teacher.id = :teacherId", Course.class)
                .setParameter("teacherId", teacherId)
                .getResultList();
    }

    @Override
    @Transactional
    public void addCourseByTeacherId(int teacherId, Course course) {
        course.setTeacher(em.find(Teacher.class, teacherId));
        em.persist(course);
        em.flush(); // Ensure the course is saved immediately
    }
}
