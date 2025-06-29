package d10_rt01.hocho.controller.admin;

import d10_rt01.hocho.model.Feedback;
import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.FeedbackStatus;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.feedback.FeedbackService;
import d10_rt01.hocho.service.user.UserService;
import d10_rt01.hocho.utils.CustomLogger;
import jakarta.mail.MessagingException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('admin')")
public class AdminController {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(AdminController.class), d10_rt01.hocho.config.DebugModeConfig.CONTROLLER_LAYER);

    @Autowired
    private UserService userService;

    @Autowired
    private ParentChildMappingRepository parentChildMappingRepository;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserRepository userRepository;

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = userService.getAllUsers();
        logger.info("Retrieved {} users", users.size());
        return ResponseEntity.ok(users);
    }

    // Get number of children for a parent
    @GetMapping("/users/{username}/children/count")
    public ResponseEntity<Integer> getNumberOfChildren(@PathVariable String username) {
        logger.info("Fetching number of children for username: {}", username);
        int count = userService.getNumberOfChild(username);
        return ResponseEntity.ok(count);
    }

    // Get children by parent email
    @GetMapping("/users/{parentEmail}/children")
    public ResponseEntity<List<User>> getChildrenByParentEmail(@PathVariable String parentEmail) {
        logger.info("Fetching children for parent email: {}", parentEmail);
        List<ParentChildMapping> mappings = parentChildMappingRepository.findByParentEmail(parentEmail);
        List<User> children = mappings.stream()
                .map(ParentChildMapping::getChild)
                .collect(Collectors.toList());
        logger.info("Retrieved {} children for parent email: {}", children.size(), parentEmail);
        return ResponseEntity.ok(children);
    }

    // Create a new user
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        logger.info("Creating new user with username: {}", request.get("username"));
        try {
            User user = userService.registerUser(
                    request.get("username"),
                    request.get("password"),
                    request.get("email"),
                    request.get("parentEmail"),
                    request.get("role"),
                    request.get("phoneNumber")
            );
            logger.info("User created successfully: username={}, role={}", user.getUsername(), user.getRole());
            return ResponseEntity.ok("User created successfully. " +
                    (user.getRole().equals("parent") ? "Please check email for verification." : ""));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (MessagingException e) {
            logger.error("Error sending email during user creation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email. Please try again.");
        } catch (Exception e) {
            logger.error("Unexpected error during user creation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create user: " + e.getMessage());
        }
    }

    // Update an existing user
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        logger.info("Updating user with id: {}", id);
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

            // Update fields if provided
            if (request.containsKey("username")) {
                user.setUsername(request.get("username"));
            }
            if (request.containsKey("email") && !user.getRole().equals("child")) {
                user.setEmail(request.get("email"));
            }
            if (request.containsKey("phoneNumber")) {
                user.setPhoneNumber(request.get("phoneNumber"));
            }
            if (request.containsKey("fullName")) {
                user.setFullName(request.get("fullName"));
            }
            if (request.containsKey("dateOfBirth")) {
                user.setDateOfBirth(java.time.LocalDate.parse(request.get("dateOfBirth")));
            }
            if (request.containsKey("role")) {
                user.setRole(request.get("role"));
            }
            if (request.containsKey("isActive")) {
                user.setIsActive(Boolean.parseBoolean(request.get("isActive")));
            }
            if (request.containsKey("verified")) {
                user.setVerified(Boolean.parseBoolean(request.get("verified")));
            }

            user.setUpdatedAt(java.time.Instant.now());
            User updatedUser = userService.save(user);
            logger.info("User updated successfully: id={}, username={}", updatedUser.getId(), updatedUser.getUsername());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during user update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update user: " + e.getMessage());
        }
    }

    // Delete a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        logger.info("Deleting user with id: {}", id);
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

            // Check if user is a child and remove parent-child mappings
            if (user.getRole().equals("child")) {
                userService.deleteByChildId(id);
                logger.info("Deleted parent-child mappings for child user id: {}", id);
            }

            userService.deleteById(id);
            logger.info("User deleted successfully: id={}", id);
            return ResponseEntity.ok("User deleted successfully.");
        } catch (IllegalArgumentException e) {
            logger.error("Failed to delete user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during user deletion: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete user: " + e.getMessage());
        }
    }

    // Get pending teachers
    @GetMapping("/pending-teachers")
    public ResponseEntity<List<User>> getPendingTeachers() {
        logger.info("Fetching pending teachers");
        List<User> pendingTeachers = userService.getPendingTeachers();
        logger.info("Retrieved {} pending teachers", pendingTeachers.size());
        return ResponseEntity.ok(pendingTeachers);
    }

    // Approve a teacher
    @PostMapping("/approve-teacher/{id}")
    public ResponseEntity<String> approveTeacher(@PathVariable Long id) {
        logger.info("Approving teacher with id: {}", id);
        try {
            userService.approveTeacher(id);
            logger.info("Teacher approved successfully: id={}", id);
            return ResponseEntity.ok("Teacher approved successfully.");
        } catch (IllegalArgumentException e) {
            logger.error("Failed to approve teacher: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (MessagingException e) {
            logger.error("Error sending approval email: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending approval email.");
        } catch (Exception e) {
            logger.error("Unexpected error during teacher approval: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to approve teacher: " + e.getMessage());
        }
    }

    // Reject a teacher
    @PostMapping("/reject-teacher/{id}")
    public ResponseEntity<String> rejectTeacher(@PathVariable Long id) {
        logger.info("Rejecting teacher with id: {}", id);
        try {
            userService.rejectTeacher(id);
            logger.info("Teacher rejected successfully: id={}", id);
            return ResponseEntity.ok("Teacher rejected successfully.");
        } catch (IllegalArgumentException e) {
            logger.error("Failed to reject teacher: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (MessagingException e) {
            logger.error("Error sending rejection email: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending rejection email.");
        } catch (Exception e) {
            logger.error("Unexpected error during teacher rejection: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reject teacher: " + e.getMessage());
        }
    }

    // ========== FEEDBACK MANAGEMENT ENDPOINTS ==========

    // Get all feedbacks
    @GetMapping("/feedbacks")
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        logger.info("Admin fetching all feedbacks");
        List<Feedback> feedbacks = feedbackService.getAllFeedbacks();
        logger.info("Retrieved {} feedbacks", feedbacks.size());
        return ResponseEntity.ok(feedbacks);
    }

    // Get feedbacks by status
    @GetMapping("/feedbacks/status/{status}")
    public ResponseEntity<List<Feedback>> getFeedbacksByStatus(@PathVariable String status) {
        logger.info("Admin fetching feedbacks with status: {}", status);
        try {
            FeedbackStatus feedbackStatus = FeedbackStatus.valueOf(status.toUpperCase());
            List<Feedback> feedbacks = feedbackService.getFeedbacksByStatus(feedbackStatus);
            logger.info("Retrieved {} feedbacks with status {}", feedbacks.size(), status);
            return ResponseEntity.ok(feedbacks);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid feedback status: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }

    // Get feedback by ID
    @GetMapping("/feedbacks/{feedbackId}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long feedbackId) {
        logger.info("Admin fetching feedback: {}", feedbackId);
        Optional<Feedback> feedback = feedbackService.getFeedbackById(feedbackId);
        if (feedback.isPresent()) {
            logger.info("Feedback found: id={}, subject={}", feedbackId, feedback.get().getSubject());
            return ResponseEntity.ok(feedback.get());
        } else {
            logger.warn("Feedback not found: {}", feedbackId);
            return ResponseEntity.notFound().build();
        }
    }

    // Respond to feedback
    @PostMapping("/feedbacks/{feedbackId}/respond")
    public ResponseEntity<?> respondToFeedback(@PathVariable Long feedbackId, @RequestBody Map<String, String> request) {
        logger.info("Admin responding to feedback: {}", feedbackId);
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User admin = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            String response = request.get("response");
            String status = request.get("status");

            if (response == null || response.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Response is required");
            }
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Status is required");
            }

            FeedbackStatus feedbackStatus;
            try {
                feedbackStatus = FeedbackStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status: " + status);
            }

            Feedback updatedFeedback = feedbackService.respondToFeedback(
                    feedbackId,
                    admin.getId(),
                    response.trim(),
                    feedbackStatus
            );

            logger.info("Feedback response saved: id={}, status={}", feedbackId, feedbackStatus);
            return ResponseEntity.ok(updatedFeedback);
            
        } catch (IllegalArgumentException e) {
            logger.error("Failed to respond to feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error responding to feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to respond to feedback: " + e.getMessage());
        }
    }

    // Update feedback status only
    @PutMapping("/feedbacks/{feedbackId}/status")
    public ResponseEntity<?> updateFeedbackStatus(@PathVariable Long feedbackId, @RequestBody Map<String, String> request) {
        logger.info("Admin updating feedback status: {}", feedbackId);
        
        try {
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Status is required");
            }

            FeedbackStatus feedbackStatus;
            try {
                feedbackStatus = FeedbackStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status: " + status);
            }

            Feedback updatedFeedback = feedbackService.updateFeedbackStatus(feedbackId, feedbackStatus);
            logger.info("Feedback status updated: id={}, newStatus={}", feedbackId, feedbackStatus);
            return ResponseEntity.ok(updatedFeedback);
            
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update feedback status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error updating feedback status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update feedback status: " + e.getMessage());
        }
    }

    // Get feedback statistics
    @GetMapping("/feedbacks/stats")
    public ResponseEntity<Map<String, Object>> getFeedbackStats() {
        logger.info("Admin fetching feedback statistics");
        
        long pendingCount = feedbackService.getPendingFeedbacksCount();
        long inProgressCount = feedbackService.getFeedbacksCountByStatus(FeedbackStatus.IN_PROGRESS);
        long resolvedCount = feedbackService.getFeedbacksCountByStatus(FeedbackStatus.RESOLVED);
        long closedCount = feedbackService.getFeedbacksCountByStatus(FeedbackStatus.CLOSED);
        
        Map<String, Object> stats = Map.of(
                "pending", pendingCount,
                "inProgress", inProgressCount,
                "resolved", resolvedCount,
                "closed", closedCount,
                "total", pendingCount + inProgressCount + resolvedCount + closedCount
        );
        
        logger.info("Feedback stats: pending={}, inProgress={}, resolved={}, closed={}", 
                pendingCount, inProgressCount, resolvedCount, closedCount);
        return ResponseEntity.ok(stats);
    }
}