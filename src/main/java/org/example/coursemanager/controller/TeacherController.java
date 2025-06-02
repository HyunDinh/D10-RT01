package org.example.coursemanager.controller;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.example.coursemanager.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
public class TeacherController {
    @Autowired
    private TeacherService teacherService;

//    @Autowired
//    public TeacherController(TeacherService teacherService) {
//        this.teacherService = teacherService;
//    }

    // Endpoint to get all teachers
    @GetMapping("/teachers")
//    public String getAllTeachers(Model model) {
//        model.addAttribute("teachers", teacherService.getAllTeachers());
//        return "teachers";
//    }
    List<Teacher> getAllTeachers() {
        return teacherService.getAllTeachers();
    }

    @GetMapping("teachers/{id}/courses")
    public List<Course> getCoursesByTeacherId(@PathVariable int id) {
//        model.addAttribute("courses", teacherService.findCoursesByTeacherId(id));
//        model.addAttribute("teacherId", id);
//        return "courses";
        return teacherService.findCoursesByTeacherId(id);
    }

//    @GetMapping("teachers/{id}/courses/add")
//    public String showAddCourseForm(@PathVariable int id, Model model) {
//        model.addAttribute("course", new Course());
//        model.addAttribute("teacherId", id);
//        return "add-course";
//    }
    @PostMapping("teachers/{id}/courses/add")
    public void addCourseToTeacher(@RequestBody @Valid Course course, @RequestBody @PathVariable int id) {
        teacherService.addCourseToTeacher(id, course);
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