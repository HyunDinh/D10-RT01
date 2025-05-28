package org.example.coursemanager.controller;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.example.coursemanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teachers")
public class TeacherController {

    private final TeacherService<Teacher, Course> teacherService;

    @Autowired
    public TeacherController(TeacherService<Teacher, Course> teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/teachers")
    public List<Teacher> getAllTeachers() {
        return teacherService.getAllTeachers();
    }

    @GetMapping("/{id}")
    public Teacher getTeacherById(@PathVariable int id) {
        return teacherService.findById(id);
    }

    @PostMapping("/{id}/courses")
    public void addCourseToTeacher(@PathVariable int id, @RequestBody Course course) {
        teacherService.addCourseToTeacher(id, course);
    }
}