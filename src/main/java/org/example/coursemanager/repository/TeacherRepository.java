package org.example.coursemanager.repository;

import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository<Teacher> extends JpaRepository<Teacher, Integer> {
    List<Teacher> getAllTeachers();
    Teacher findById(int id);
    void saveTeacher(Teacher teacher);
    void deleteById(int id);
    void update(Teacher teacher);
}
