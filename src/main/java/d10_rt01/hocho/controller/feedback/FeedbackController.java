package d10_rt01.hocho.controller.feedback;

import d10_rt01.hocho.model.Feedback;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.feedback.FeedbackService;
import d10_rt01.hocho.utils.CustomLogger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(FeedbackController.class), d10_rt01.hocho.config.DebugModeConfig.CONTROLLER_LAYER);

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserRepository userRepository;

    // Submit new feedback
    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> request) {
        logger.info("User submitting feedback");
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String subject = request.get("subject");
            String content = request.get("content");
            String category = request.get("category");
            String priority = request.get("priority");

            if (subject == null || subject.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Subject is required");
            }
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }
            if (category == null || category.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Category is required");
            }
            if (priority == null || priority.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Priority is required");
            }

            Feedback feedback = feedbackService.createFeedback(
                    currentUser.getId(),
                    subject.trim(),
                    content.trim(),
                    category.trim(),
                    priority.trim()
            );

            logger.info("Feedback submitted successfully: id={}, subject={}", feedback.getFeedbackId(), feedback.getSubject());
            return ResponseEntity.ok(feedback);
            
        } catch (Exception e) {
            logger.error("Error submitting feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to submit feedback: " + e.getMessage());
        }
    }

    // Get user's own feedbacks
    @GetMapping("/my-feedbacks")
    public ResponseEntity<List<Feedback>> getMyFeedbacks() {
        logger.info("User requesting their feedbacks");
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Feedback> feedbacks = feedbackService.getFeedbacksByUser(currentUser.getId());
            logger.info("Retrieved {} feedbacks for user {}", feedbacks.size(), currentUser.getUsername());
            return ResponseEntity.ok(feedbacks);
            
        } catch (Exception e) {
            logger.error("Error fetching user feedbacks: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get specific feedback by ID (user can only see their own)
    @GetMapping("/{feedbackId}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long feedbackId) {
        logger.info("User requesting feedback: {}", feedbackId);
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Feedback> feedbackOpt = feedbackService.getFeedbackById(feedbackId);
            if (feedbackOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Feedback feedback = feedbackOpt.get();
            
            // Check if the feedback belongs to the current user
            if (!feedback.getUser().getId().equals(currentUser.getId())) {
                logger.warn("User {} trying to access feedback {} which belongs to user {}", 
                        currentUser.getUsername(), feedbackId, feedback.getUser().getUsername());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            logger.info("Feedback retrieved successfully: id={}", feedbackId);
            return ResponseEntity.ok(feedback);
            
        } catch (Exception e) {
            logger.error("Error fetching feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get feedback categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getFeedbackCategories() {
        logger.info("User requesting feedback categories");
        List<String> categories = List.of(
                "BUG_REPORT",
                "FEATURE_REQUEST", 
                "GENERAL",
                "TECHNICAL_SUPPORT"
        );
        return ResponseEntity.ok(categories);
    }

    // Get feedback priorities
    @GetMapping("/priorities")
    public ResponseEntity<List<String>> getFeedbackPriorities() {
        logger.info("User requesting feedback priorities");
        List<String> priorities = List.of(
                "LOW",
                "MEDIUM",
                "HIGH",
                "URGENT"
        );
        return ResponseEntity.ok(priorities);
    }
} 