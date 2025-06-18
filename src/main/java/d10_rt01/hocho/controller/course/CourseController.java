// File: src/main/java/org/example/coursemanager/controller/CourseController.java
package d10_rt01.hocho.controller.course;

import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.repository.CourseRepository;
import d10_rt01.hocho.service.course.CourseService;
import d10_rt01.hocho.service.course.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final TeacherService teacherService;
    private final CourseService courseService;
    private final CourseRepository courseRepository;

    @Autowired
    public CourseController(TeacherService teacherService,
                            CourseService courseService,
                            CourseRepository courseRepository) {
        this.teacherService = teacherService;
        this.courseService = courseService;
        this.courseRepository = courseRepository;
    }

    // Retrieves all courses for the authenticated teacher
//    @GetMapping
//    public ResponseEntity<List<Course>> getCourses(Principal principal) {
//        Long teacherId = teacherService.findTeacherIdByUsername(principal.getName());
//        List<Course> courses = courseService.getCourseByTeacherId(teacherId);
//        return ResponseEntity.ok(courses);
//    }

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