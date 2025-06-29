package d10_rt01.hocho.controller.parent;

import d10_rt01.hocho.dto.CourseProgressDto;
import d10_rt01.hocho.dto.LearningProgressDto;
import d10_rt01.hocho.service.LearningProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parent/learning-progress")
@CrossOrigin(origins = "*")
public class LearningProgressController {

    @Autowired
    private LearningProgressService learningProgressService;

    @GetMapping("/child/{childId}")
    public ResponseEntity<LearningProgressDto> getChildLearningProgress(@PathVariable Long childId) {
        try {
            LearningProgressDto progress = learningProgressService.getChildLearningProgress(childId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/child/{childId}/course/{courseId}")
    public ResponseEntity<CourseProgressDto> getCourseProgress(@PathVariable Long childId, @PathVariable Long courseId) {
        try {
            CourseProgressDto progress = learningProgressService.getCourseProgress(childId, courseId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/child/{childId}/overall-progress")
    public ResponseEntity<Double> getOverallProgress(@PathVariable Long childId) {
        try {
            double progress = learningProgressService.calculateOverallProgress(childId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/child/{childId}/course/{courseId}/progress")
    public ResponseEntity<Double> getCourseProgressPercentage(
            @PathVariable Long childId, 
            @PathVariable Long courseId) {
        try {
            double progress = learningProgressService.calculateCourseProgress(childId, courseId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/child/{childId}/lesson/{lessonId}/complete")
    public ResponseEntity<String> markLessonAsCompleted(@PathVariable Long childId, @PathVariable Long lessonId) {
        try {
            learningProgressService.markLessonAsCompleted(childId, lessonId);
            return ResponseEntity.ok("Lesson marked as completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to mark lesson as completed: " + e.getMessage());
        }
    }
} 