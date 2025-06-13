package com.d10rt01.hocho.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hocho")
public class MainApiController {

    @GetMapping("/home")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("title", "Hocho - Trang chủ");
        return response;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        Map<String, Object> response = new HashMap<>();
        response.put("title", "Hocho - Dashboard");
        response.put("totalStudents", 100); // Giả định dữ liệu
        response.put("totalCourses", 20);  // Giả định dữ liệu
        return response;
    }

    @GetMapping("/access-denied")
    public Map<String, Object> accessDenied() {
        Map<String, Object> response = new HashMap<>();
        response.put("title", "Hocho - Truy cập bị từ chối");
        return response;
    }

    @GetMapping("/childList")
    public Map<String, Object> childList() {
        Map<String, Object> response = new HashMap<>();
        response.put("title", "Hocho - Danh sách học sinh");
        // Thêm logic lấy danh sách học sinh nếu có
        return response;
    }

    @GetMapping("/parent")
    public Map<String, Object> parent() {
        Map<String, Object> response = new HashMap<>();
        response.put("title", "Hocho - Thông tin phụ huynh");
        // Thêm logic lấy thông tin phụ huynh nếu có
        return response;
    }

    @GetMapping("/teacher")
    public Map<String, Object> teacher() {
        Map<String, Object> response = new HashMap<>();
        response.put("title", "Hocho - Quản lý khóa học");
        // Thêm logic lấy thông tin giáo viên/khóa học nếu có
        return response;
    }
}