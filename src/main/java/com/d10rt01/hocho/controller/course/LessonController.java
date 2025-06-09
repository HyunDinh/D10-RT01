package com.d10rt01.hocho.controller.course;

import com.d10rt01.hocho.model.Lesson;
import com.d10rt01.hocho.model.LessonContent;
import com.d10rt01.hocho.service.lesson.LessonContentService;
import com.d10rt01.hocho.service.lesson.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {
    private final LessonService lessonService;
    private final LessonContentService lessonContentService;

    @Autowired
    public LessonController(LessonService lessonService, LessonContentService lessonContentService) {
        this.lessonService = lessonService;
        this.lessonContentService = lessonContentService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Lesson>> getLessonsByCourse(@PathVariable Long courseId) {
        List<Lesson> lessons = lessonService.getLessonsByCourseId(courseId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<Lesson> getLesson(@PathVariable Long lessonId) {
        Lesson lesson = lessonService.getLessonById(lessonId);
        return ResponseEntity.ok(lesson);
    }

    @PostMapping("/add/{courseId}")
    public ResponseEntity<Lesson> addLesson(@PathVariable Long courseId, @RequestBody Lesson lesson) {
        Lesson savedLesson = lessonService.addLessonByCourseId(courseId, lesson);
        return ResponseEntity.ok(savedLesson);
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long lessonId, @RequestBody Lesson lesson) {
        Lesson updatedLesson = lessonService.editLesson(lessonId, lesson);
        return ResponseEntity.ok(updatedLesson);
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.ok().build();
    }

    // Lesson Content endpoints
    @GetMapping("/{lessonId}/contents")
    public ResponseEntity<List<LessonContent>> getLessonContents(@PathVariable Long lessonId) {
        List<LessonContent> contents = lessonContentService.getLessonContentsByLessonId(lessonId);
        return ResponseEntity.ok(contents);
    }

    @PostMapping("/{lessonId}/contents/add")
    public ResponseEntity<LessonContent> addLessonContent(
            @PathVariable Long lessonId,
            @RequestBody LessonContent content) {
        LessonContent savedContent = lessonContentService.addContent(lessonId, content);
        return ResponseEntity.ok(savedContent);
    }

    @PutMapping("/contents/{contentId}")
    public ResponseEntity<LessonContent> updateLessonContent(
            @PathVariable Long contentId,
            @RequestBody LessonContent content) {
        LessonContent updatedContent = lessonContentService.updateContent(contentId, content);
        return ResponseEntity.ok(updatedContent);
    }

    @DeleteMapping("/contents/{contentId}")
    public ResponseEntity<Void> deleteLessonContent(@PathVariable Long contentId) {
        lessonContentService.deleteContent(contentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/content-types")
    public ResponseEntity<List<String>> getContentTypes() {
        return ResponseEntity.ok(Arrays.asList(
                "PDF",
                "VIDEO",
                "INTERACTIVE"
        ));
    }
}