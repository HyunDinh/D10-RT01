package vn.spring.censormanagement.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.spring.censormanagement.entity.Lesson;
import vn.spring.censormanagement.service.LessonService;

import java.util.List;


@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "http://localhost:3000")
public class LessonController {

    private final LessonService lessonService;

    @Autowired
    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping("/by-course/{CourseId}")
    public ResponseEntity<List<Lesson>> findByCourseId(@PathVariable Long CourseId) {
        List<Lesson> list = lessonService.getLessonByCourseId(CourseId);
        if(list.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        else{
            return ResponseEntity.ok(list);
        }
    }

}
