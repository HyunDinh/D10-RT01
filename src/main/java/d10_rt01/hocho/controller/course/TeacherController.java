package d10_rt01.hocho.controller.course;

import d10_rt01.hocho.dto.DailyRevenueDto;
import d10_rt01.hocho.dto.TotalStudentsDto;
import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.model.CourseEnrollment;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.CourseStatus;
import d10_rt01.hocho.service.course.CourseEnrollmentService;
import d10_rt01.hocho.service.course.CourseService;
import d10_rt01.hocho.service.course.TeacherService;
import d10_rt01.hocho.service.payment.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
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
    private final PaymentService paymentService;

    @Autowired
    public TeacherController(TeacherService teacherService, CourseService courseService, CourseEnrollmentService courseEnrollmentService, PaymentService paymentService) {
        this.teacherService = teacherService;
        this.courseService = courseService;
        this.courseEnrollmentService = courseEnrollmentService;
        this.paymentService = paymentService;
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

    @GetMapping("/student/total") // tổng số học sinh
    public ResponseEntity<Integer> getStudentTotal(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> teacher = teacherService.findTeacherByUsername(username);
        if (teacher.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } else {
            List<Course> courses = courseService.getCourseByTeacherId(teacher.get().getId());
            if (courses.isEmpty()) {
                return ResponseEntity.ok(0);
            }

            List<CourseEnrollment> courseEnrollments = courseEnrollmentService.findAll();

            // Danh sách courseIds của giáo viên
            List<Long> courseIdsOfTeacher = courses.stream()
                    .map(Course::getCourseId)
                    .toList();

            // Lọc ra những enrollment thuộc về các course của giáo viên
            List<CourseEnrollment> filteredEnrollments = courseEnrollments.stream()
                    .filter(enrollment -> courseIdsOfTeacher.contains(enrollment.getCourse().getCourseId()))
                    .toList();

            // Sử dụng Set để lưu các studentId đã được đếm, tránh trùng lặp
            Set<Long> countedStudents = new HashSet<>();

            // Đếm số lượng học sinh duy nhất
            int uniqueStudentCount = (int) filteredEnrollments.stream()
                    .filter(enrollment -> countedStudents.add(enrollment.getChild().getId())) // chỉ thêm học sinh nếu chưa có trong Set
                    .count();

            return ResponseEntity.ok(uniqueStudentCount);
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

    @GetMapping("/courses/top") // danh sach khoa hoc ban chay
    public ResponseEntity<List<Map<String, Object>>> getTopCoursesByStudentCount(Authentication auth) {
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

        // Đếm số học sinh cho mỗi khóa học của giáo viên
        List<Map<String, Object>> topCoursesData = new ArrayList<>();
        for (Course course : courses) {
            int studentCount = courseEnrollmentService.countStudentsByCourseId(course.getCourseId());
            // Tính doanh thu từ số học sinh tham gia và giá của khóa học
            BigDecimal revenue = course.getPrice().multiply(BigDecimal.valueOf(studentCount));

            // Tạo đối tượng chứa thông tin khóa học, số học sinh và doanh thu
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("course", course);
            courseData.put("students", studentCount); // Thêm số học sinh vào dữ liệu khóa học
            courseData.put("revenue", revenue); // Thêm doanh thu vào dữ liệu khóa học
            topCoursesData.add(courseData);
        }

        // Sắp xếp theo số lượng học sinh giảm dần, lấy top 5
        List<Map<String, Object>> topCourses = topCoursesData.stream()
                .sorted((e1, e2) -> Integer.compare((int) e2.get("students"), (int) e1.get("students")))
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(topCourses);
    }

    @GetMapping("/revenue/total") // tong doanh thu
    public ResponseEntity<?> getRevenueTotal(Authentication authentication) {

        String username = authentication.getName();
        Optional<User> teacher = teacherService.findTeacherByUsername(username);
        if (teacher.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        else {
            return ResponseEntity.ok(paymentService.getTotalRevenueForTeacher(teacher.get().getId()));
        }

    }
    @GetMapping("/student/total/today") // tong so hoc sinh tham gia vao ngay hom nay
    public ResponseEntity<TotalStudentsDto> getTotalStudentsToday(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> teacher = teacherService.findTeacherByUsername(username);
        if (teacher.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        else {
            TotalStudentsDto totalStudents = teacherService.getTotalStudentsForTeacherToday(teacher.get().getId());
            return ResponseEntity.ok(totalStudents);
        }
    }

    @GetMapping("/student/age-groups")
    public ResponseEntity<Map<String, Integer>> getStudentCountByAgeGroup(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        Optional<User> teacherOpt = teacherService.findTeacherByUsername(username);
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User teacher = teacherOpt.get();
        List<Course> courses = courseService.getCourseByTeacherId(teacher.getId());

        Map<String, Integer> ageGroupCounts = new HashMap<>();
        ageGroupCounts.put("AGE_4_6", 0);
        ageGroupCounts.put("AGE_7_9", 0);
        ageGroupCounts.put("AGE_10_12", 0);
        ageGroupCounts.put("AGE_13_15", 0);

        // Debugging: in ra số khóa học của giáo viên
        System.out.println("Total courses for teacher " + teacher.getUsername() + ": " + courses.size());

        for (Course course : courses) {
            System.out.println("Processing course: " + course.getTitle()); // Debugging: in ra tên khóa học
            List<CourseEnrollment> enrollments = courseEnrollmentService.findByCourse(course);  // Sử dụng phương thức findByCourse
            for (CourseEnrollment enrollment : enrollments) {
                User student = enrollment.getChild();
                if (student.getDateOfBirth() != null) {
                    int age = Period.between(student.getDateOfBirth(), LocalDate.now()).getYears();

                    // Debugging: in ra độ tuổi của học sinh
                    System.out.println("Processing student: " + student.getFullName() + ", Age: " + age);

                    if (age >= 4 && age <= 6) {
                        ageGroupCounts.put("AGE_4_6", ageGroupCounts.get("AGE_4_6") + 1);
                    } else if (age >= 7 && age <= 9) {
                        ageGroupCounts.put("AGE_7_9", ageGroupCounts.get("AGE_7_9") + 1);
                    } else if (age >= 10 && age <= 12) {
                        ageGroupCounts.put("AGE_10_12", ageGroupCounts.get("AGE_10_12") + 1);
                    } else if (age >= 13 && age <= 15) {
                        ageGroupCounts.put("AGE_13_15", ageGroupCounts.get("AGE_13_15") + 1);
                    }
                }
            }
        }

        // Debugging: in ra kết quả cuối cùng trước khi trả về
        System.out.println("Age group counts: " + ageGroupCounts);

        return ResponseEntity.ok(ageGroupCounts); // Trả về số học sinh theo độ tuổi
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<List<DailyRevenueDto>> getDailyRevenue(
            Authentication authentication,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        // Tham số teacherId có thể là optional

        // Lấy thời gian hiện tại làm endDate
        LocalDateTime endDateTime = endDate.atStartOfDay();  // Lấy ngày hiện tại làm endDate
        LocalDateTime startDateTime = startDate.atTime(LocalTime.MAX);

        // In ra các tham số để kiểm tra giá trị
        System.out.println("Start Date: " + startDate);
        System.out.println("End Date: " + endDate);

        // Lấy username từ authentication
        String username = authentication.getName();
        System.out.println("Authenticated Username: " + username);  // In username của người dùng

        // Tìm giáo viên từ username
        Optional<User> teacherOpt = teacherService.findTeacherByUsername(username);

        if (teacherOpt.isEmpty()) {
            System.out.println("Teacher not found for username: " + username);  // Nếu không tìm thấy giáo viên
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        User teacher = teacherOpt.get();
        System.out.println("Teacher found: " + teacher.getUsername());  // In tên giáo viên

        // Lấy doanh thu hàng ngày từ service
        List<DailyRevenueDto> dailyRevenue = paymentService.getDailyRevenue(teacher.getId(), startDateTime, endDateTime);

        // In kết quả của dữ liệu doanh thu hàng ngày để kiểm tra
        System.out.println("Daily Revenue Data: " + dailyRevenue);

        return ResponseEntity.ok(dailyRevenue);
    }










}