package com.d10rt01.hocho.controller.courseEnrollment;

import com.d10rt01.hocho.model.CourseEnrollment;
import com.d10rt01.hocho.repository.CourseEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class CourseEnrollmentController {

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    // Lấy danh sách khóa học đã đăng ký của học viên
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<CourseEnrollment>> getEnrollmentsByChildId(@PathVariable Long childId) {
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByChildId(childId);
        return ResponseEntity.ok(enrollments);
    }

    // Lấy danh sách khóa học đã mua của phụ huynh
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<CourseEnrollment>> getEnrollmentsByParentId(@PathVariable Long parentId) {
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByParentId(parentId);
        return ResponseEntity.ok(enrollments);
    }

    // Kiểm tra xem học viên đã đăng ký khóa học chưa
    @GetMapping("/check/{childId}/{courseId}")
    public ResponseEntity<Boolean> checkEnrollment(@PathVariable Long childId, @PathVariable Long courseId) {
        boolean exists = courseEnrollmentRepository.existsByChildIdAndCourseCourseId(childId, courseId);
        return ResponseEntity.ok(exists);
    }
} 