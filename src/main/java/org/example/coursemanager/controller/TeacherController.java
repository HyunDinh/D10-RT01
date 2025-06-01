package org.example.coursemanager.controller;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@Controller
public class TeacherController {
    @Autowired
    private TeacherService teacherService;

//    @Autowired
//    public TeacherController(TeacherService teacherService) {
//        this.teacherService = teacherService;
//    }

    // Endpoint to get all teachers
    @GetMapping("/teachers")
    public String getAllTeachers(Model model) {
        model.addAttribute("teachers", teacherService.getAllTeachers());
        return "teachers";
    }

    @GetMapping("/teachers/{id}/courses")
    public String getCoursesByTeacherId(@PathVariable int id, Model model) {
        model.addAttribute("courses", teacherService.findCoursesByTeacherId(id));
        model.addAttribute("teacherId", id);
        return "courses";
    }

    @GetMapping("/teachers/{id}/courses/add")
    public String showAddCourseForm(@PathVariable int id, Model model) {
        model.addAttribute("course", new Course());
        model.addAttribute("teacherId", id);
        return "add-course";
    }
    @PostMapping("/teachers/{id}/courses/add")
    public String addCourseToTeacher(@PathVariable int id,
                                     @Valid @ModelAttribute("course") Course course,
                                     BindingResult bindingResult,
                                     Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("error", "Validation failed. Please check the input fields.");
            return "add-course";
        }
        teacherService.addCourseToTeacher(id, course);
        return "redirect:/teachers/" + id + "/courses";
    }


//    @GetMapping("/teachers/add")
//    public void addTeacher(Teacher teacher) {
//        teacherService.save(teacher);
//    }
//
//    @GetMapping("teachers/{id}")
//    public Teacher getTeacherById(@PathVariable int id) {
//        return teacherService.findById(id);
//    }
//
//    @PostMapping("/{id}/courses")
//    public void addCourseToTeacher(@PathVariable int id, @RequestBody Course course) {
//        teacherService.addCourseToTeacher(id, course);
//    }
}