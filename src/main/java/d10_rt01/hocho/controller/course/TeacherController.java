package d10_rt01.hocho.controller.course;

import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.model.CourseEnrollment;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.CourseStatus;
import d10_rt01.hocho.service.course.CourseEnrollmentService;
import d10_rt01.hocho.service.course.CourseService;
import d10_rt01.hocho.service.course.TeacherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {
    private static final Logger logger = LoggerFactory.getLogger(TeacherController.class);
    private final TeacherService teacherService;
    private final CourseService courseService;
    private final CourseEnrollmentService courseEnrollmentService;

    @Autowired
    public TeacherController(TeacherService teacherService, CourseService courseService, CourseEnrollmentService courseEnrollmentService) {
        this.teacherService = teacherService;
        this.courseService = courseService;
        this.courseEnrollmentService = courseEnrollmentService;
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
        course.setStatus(CourseStatus.PENDING); // Set status to PENDING for admin approval
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
        course.setStatus(CourseStatus.PENDING); // Reset status to PENDING when updated
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

    @GetMapping("/student/total") // tong so hoc sinh
    public ResponseEntity<Integer> getStudentTotal(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> teacher = teacherService.findTeacherByUsername(username);
        if (teacher.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        else {
            List<Course> courses = courseService.getCourseByTeacherId(teacher.get().getId());
            if(courses.isEmpty()) {
                return ResponseEntity.ok(0);
            }

            List<CourseEnrollment> courseEnrollments = courseEnrollmentService.findAll();

            List<Long> courseIdsOfTeacher = courses.stream()
                    .map(Course::getCourseId)
                    .toList();

            List<CourseEnrollment> filteredEnrollments = courseEnrollments.stream()
                    .filter(enrollment -> courseIdsOfTeacher.contains(enrollment.getCourse().getCourseId()))
                    .toList();

            return ResponseEntity.ok(filteredEnrollments.size());
        }
    }

    @GetMapping("/courses/total") // tong so khoa hoc da tao
    public ResponseEntity<Integer> getTotalCourses(Authentication auth)
    {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = auth.getName();

        Optional<User> teacherOpt = teacherService.findTeacherByUsername(username);
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User teacher = teacherOpt.get();
        int courseTotal = courseService.getCourseByTeacherId(teacher.getId()).size();
        return ResponseEntity.ok(courseTotal);
    }

    @GetMapping("/courses/top") // danh sach cac khoa hoc ban chay
    public ResponseEntity<List<Course>> getTopCoursesByStudentCount(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = auth.getName();
        Optional<User> teacherOpt = teacherService.findTeacherByUsername(username);
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User teacher = teacherOpt.get();
        List<Course> courses = courseService.getCourseByTeacherId(teacher.getId());

        // Lấy danh sách tất cả các enrollment
        List<CourseEnrollment> allEnrollments = courseEnrollmentService.findAll();

        // Đếm số học sinh cho mỗi khóa học của giáo viên
        Map<Course, Long> courseToStudentCount = new HashMap<>();
        for (Course course : courses) {
            long count = allEnrollments.stream()
                    .filter(e -> e.getCourse().getCourseId().equals(course.getCourseId()))
                    .count();
            courseToStudentCount.put(course, count);
        }

        // Sắp xếp theo số lượng học sinh giảm dần, lấy top 5
        List<Course> topCourses = courseToStudentCount.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return ResponseEntity.ok(topCourses);
    }



}