// File: src/main/java/org/example/coursemanager/controller/CourseController.java
package org.example.coursemanager.controller.api;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.repository.CourseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @GetMapping("/by-age")
    public ResponseEntity<List<Course>> getCoursesByUserAge(@RequestParam int age) {
        // Convert numeric age to AgeGroup using custom logic
        String ageGroup = convertAgeToAgeGroup(age);
        List<Course> courses = courseRepository.findByAgeGroup(ageGroup);
        return ResponseEntity.ok(courses);
    }

    private String convertAgeToAgeGroup(int age) {
        // Define age thresholds as needed
        if (age >= 4 && age <= 6) {
            return "AGE_4_6";
        } else if (age >= 7 && age <= 9) {
            return "AGE_7_9";
        } else if (age >= 10 && age <= 12) {
            return "AGE_10_12";
        } else {
            return "AGE_13_15";
        }
    }
}