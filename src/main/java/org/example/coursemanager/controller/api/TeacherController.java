package org.example.coursemanager.controller.api;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.User;
import org.example.coursemanager.service.CourseService;
import org.example.coursemanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {
    private final TeacherService teacherService;
    private final CourseService courseService;

    @Autowired
    public TeacherController(TeacherService teacherService, CourseService courseService) {
        this.teacherService = teacherService;
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllTeachers() {
        List<User> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<Course>> getCoursesByTeacherId(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        User teacher = teacherService.findTeacherById(id);
        List<Course> courses = courseService.getCourseById(id);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/{id}/courses/add")
    public ResponseEntity<Void> addCourseToTeacher(@PathVariable Long id, @Valid @RequestBody Course course) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        User teacher = teacherService.findTeacherById(id);
        courseService.addCourseByTeacherId(id, course);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/courses/{courseId}")
    public ResponseEntity<Void> editCourse(@PathVariable Long id, @PathVariable Long courseId, @Valid @RequestBody Course course) {
        if (id == null || courseId == null) {
            return ResponseEntity.badRequest().build();
        }
        User teacher = teacherService.findTeacherById(id);
        courseService.editCourse(courseId, course);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/courses/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, @PathVariable Long courseId) {
        if (id == null || courseId == null) {
            return ResponseEntity.badRequest().build();
        }
        User teacher = teacherService.findTeacherById(id);
        courseService.deleteCourse(courseId);
        return ResponseEntity.ok().build();
    }
}