package d10_rt01.hocho.controller.course;

import d10_rt01.hocho.model.LessonContent;
import d10_rt01.hocho.service.lesson.LessonContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/lesson-contents")
public class LessonContentController {

    @Autowired
    private LessonContentService lessonContentService;

    @PostMapping("/{lessonId}")
    public ResponseEntity<LessonContent> createLessonContent(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) throws IOException {
        return ResponseEntity.ok(lessonContentService.addContent(lessonId, file, title));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<List<LessonContent>> getLessonContentsByLessonId(@PathVariable Long lessonId) {
        return ResponseEntity.ok(lessonContentService.getLessonContentsByLessonId(lessonId));
    }

    @PutMapping("/{contentId}")
    public ResponseEntity<LessonContent> updateLessonContent(
            @PathVariable Long contentId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title) throws IOException {
        return ResponseEntity.ok(lessonContentService.updateContent(contentId, file, title));
    }

    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> deleteLessonContent(@PathVariable Long contentId) {
        lessonContentService.deleteContent(contentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/content/{contentId}")
    public ResponseEntity<LessonContent> getContentById(@PathVariable Long contentId) {
        return ResponseEntity.ok(lessonContentService.getContentById(contentId));
    }
} 