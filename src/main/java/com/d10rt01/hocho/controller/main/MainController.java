package com.d10rt01.hocho.controller.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;

@Controller
@RequestMapping("hocho")
public class MainController {

    @GetMapping
    public String hocho() {
        return "home";
    }

    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("title", "Hocho - Trang chủ");
        return "home";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("title", "Hocho - Dashboard");
        model.addAttribute("totalStudents", 100); // Giả định dữ liệu
        model.addAttribute("totalCourses", 20);  // Giả định dữ liệu
        return "dashboard";
    }

    @GetMapping("/access-denied")
    public String accessDenied(Model model) {
        model.addAttribute("title", "Hocho - Truy cập bị từ chối");
        return "access-denied";
    }

}