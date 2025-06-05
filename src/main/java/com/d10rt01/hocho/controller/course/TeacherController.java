package com.d10rt01.hocho.controller.course;

import com.d10rt01.hocho.model.Course;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.service.CourseService;
import com.d10rt01.hocho.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

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

    @GetMapping("/age-groups")
    public ResponseEntity<List<String>> getAgeGroups() {
        return ResponseEntity.ok(Arrays.asList(
                "AGE_4_6",
                "AGE_7_9",
                "AGE_10_12",
                "AGE_13_15"
        ));
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<Course>> getCoursesByTeacherId(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<User> teacher = teacherService.findTeacherById(id);
        List<Course> courses = courseService.getCourseByTeacherId(id);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/{id}/courses/add")
    public ResponseEntity<Void> addCourseToTeacher(@PathVariable Long id, @RequestBody Course course) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<User> teacher = teacherService.findTeacherById(id);
        courseService.addCourseByTeacherId(id, course);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/courses/{courseId}/edit")
    public ResponseEntity<Course> getCourseForEdit(@PathVariable Long id, @PathVariable Long courseId) {
        if (id == null || courseId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<User> teacher = teacherService.findTeacherById(id);
        Course course = courseService.getCourseByTeacherId(id).stream()
                .filter(c -> c.getCourseId().equals(courseId))
                .findFirst()
                .orElse(null);
        if (course == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}/courses/{courseId}/edit")
    public ResponseEntity<Void> editCourse(@PathVariable Long id, @PathVariable Long courseId, @RequestBody Course course) {
        if (id == null || courseId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<User> teacher = teacherService.findTeacherById(id);
        courseService.editCourse(courseId, course);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/courses/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, @PathVariable Long courseId) {
        if (id == null || courseId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<User> teacher = teacherService.findTeacherById(id);
        courseService.deleteCourse(courseId);
        return ResponseEntity.ok().build();
    }
}