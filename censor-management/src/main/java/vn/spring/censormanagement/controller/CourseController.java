package vn.spring.censormanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import vn.spring.censormanagement.entity.Course;
import vn.spring.censormanagement.service.CourseService;

import java.util.List;


@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    private final CourseService courseService;

    @Autowired
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

//    @GetMapping("/course")
//    public String censorCourse(Model model) {
//        List<Course> list = courseService.getAllCourse();
//        model.addAttribute("coursesList", list);
//        return "admin/censor-course";
//    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveCourse(@PathVariable Long id) {
        courseService.approveCourse(id);
        return ResponseEntity.ok().build();

    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectCourse(@PathVariable Long id) {
        courseService.rejectCourse(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Course>>getPendingCourse() {
        return ResponseEntity.ok(courseService.getAllPendingCourse());
    }
}
