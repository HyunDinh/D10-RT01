package org.example.coursemanager.controller;

import org.example.coursemanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class TeacherController {
    @Autowired
    private TeacherService teacherService;

//    @Autowired
//    public TeacherController(TeacherService teacherService) {
//        this.teacherService = teacherService;
//    }

    @GetMapping("/teachers")
    public String getAllTeachers(Model model) {
        model.addAttribute("teachers", teacherService.getAllTeachers());
        return "teachers";
    }

    @GetMapping("/teachers/{id}/courses")
    public String getCoursesByTeacherId(@PathVariable int id, Model model) {
        model.addAttribute("courses", teacherService.findCoursesByTeacherId(id));
        return "courses";
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