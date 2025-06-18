package d10_rt01.hocho.controller.course;

import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.course.CourseService;
import d10_rt01.hocho.service.course.TeacherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {
    private static final Logger logger = LoggerFactory.getLogger(TeacherController.class);
    private final TeacherService teacherService;
    private final CourseService courseService;

    @Autowired
    public TeacherController(TeacherService teacherService, CourseService courseService) {
        this.teacherService = teacherService;
        this.courseService = courseService;
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getCourses(Authentication authentication) {
        if (authentication == null) {
            logger.error("Authentication is null");
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        
        Optional<User> teacherOpt = teacherService.findTeacherByUsername(username);
        if (teacherOpt.isEmpty()) {
            logger.error("Teacher not found for username: {}. Authentication details: {}", 
                username, authentication.getDetails());
            return ResponseEntity.status(403).build();
        }
        User teacher = teacherOpt.get();
        List<Course> courses = courseService.getCourseByTeacherId(teacher.getId());
        return ResponseEntity.ok(courses);
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

    @PostMapping("/course/add")
    public ResponseEntity<Course> addCourse(@RequestBody Course course, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        
        String username = authentication.getName();
        User teacher = teacherService.findTeacherByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        course.setTeacher(teacher);
        Course savedCourse = courseService.addCourseByTeacherId(teacher.getId(), course);
        return ResponseEntity.ok(savedCourse);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable Long courseId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        
        String username = authentication.getName();
        User teacher = teacherService.findTeacherByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        Course course = courseService.getCourseByTeacherId(teacher.getId()).stream()
                .filter(c -> c.getCourseId().equals(courseId))
                .findFirst()
                .orElse(null);
                
        if (course == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(course);
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long courseId, @RequestBody Course course, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        
        String username = authentication.getName();
        User teacher = teacherService.findTeacherByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        course.setTeacher(teacher);
        Course updatedCourse = courseService.editCourse(courseId, course);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/course/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        
        String username = authentication.getName();
        User teacher = teacherService.findTeacherByUsername(username)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        courseService.deleteCourse(courseId);
        return ResponseEntity.ok().build();
    }
}