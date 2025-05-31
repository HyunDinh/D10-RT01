package org.example.coursemanager.repository;

import io.micrometer.common.lang.NonNullApi;
import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository {
    List<Teacher> findAll();
    Teacher findById(int id);
    List<Course> findCoursesByTeacherId(int teacherId);
//    void saveTeacher(Teacher teacher);
//    void deleteById(int id);
//    void update(Teacher teacher);
}
