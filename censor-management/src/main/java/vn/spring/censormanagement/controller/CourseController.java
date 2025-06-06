package vn.spring.censormanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import vn.spring.censormanagement.entity.Course;
import vn.spring.censormanagement.service.CourseService;

import java.util.List;

@Controller
@RequestMapping("/admin/censor")
public class CourseController {

    private final CourseService courseService;

    @Autowired
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/course")
    public String censorCourse(Model model) {
        List<Course> list = courseService.getAllCourse();
        model.addAttribute("coursesList", list);
        return "admin/censor-course";
    }
}
