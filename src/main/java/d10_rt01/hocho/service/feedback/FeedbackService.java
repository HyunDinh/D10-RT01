package d10_rt01.hocho.service.feedback;

import d10_rt01.hocho.model.Feedback;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.FeedbackStatus;
import d10_rt01.hocho.repository.FeedbackRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.utils.CustomLogger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(FeedbackService.class), d10_rt01.hocho.config.DebugModeConfig.SERVICE_LAYER);

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Feedback createFeedback(Long userId, String subject, String content, String category, String priority) {
        logger.info("Creating feedback for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setSubject(subject);
        feedback.setContent(content);
        feedback.setCategory(category);
        feedback.setPriority(priority);
        feedback.setStatus(FeedbackStatus.PENDING);

        Feedback savedFeedback = feedbackRepository.save(feedback);
        logger.info("Feedback created successfully: id={}, subject={}", savedFeedback.getFeedbackId(), savedFeedback.getSubject());
        
        return savedFeedback;
    }

    public List<Feedback> getAllFeedbacks() {
        logger.info("Fetching all feedbacks");
        List<Feedback> feedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();
        logger.info("Retrieved {} feedbacks", feedbacks.size());
        return feedbacks;
    }

    public List<Feedback> getFeedbacksByStatus(FeedbackStatus status) {
        logger.info("Fetching feedbacks with status: {}", status);
        List<Feedback> feedbacks = feedbackRepository.findByStatusOrderByCreatedAtDesc(status);
        logger.info("Retrieved {} feedbacks with status {}", feedbacks.size(), status);
        return feedbacks;
    }

    public List<Feedback> getFeedbacksByUser(Long userId) {
        logger.info("Fetching feedbacks for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        List<Feedback> feedbacks = feedbackRepository.findByUserOrderByCreatedAtDesc(user);
        logger.info("Retrieved {} feedbacks for user {}", feedbacks.size(), userId);
        return feedbacks;
    }

    public Optional<Feedback> getFeedbackById(Long feedbackId) {
        logger.info("Fetching feedback with id: {}", feedbackId);
        Optional<Feedback> feedback = feedbackRepository.findById(feedbackId);
        if (feedback.isPresent()) {
            logger.info("Feedback found: id={}, subject={}", feedbackId, feedback.get().getSubject());
        } else {
            logger.warn("Feedback not found with id: {}", feedbackId);
        }
        return feedback;
    }

    @Transactional
    public Feedback respondToFeedback(Long feedbackId, Long adminId, String response, FeedbackStatus newStatus) {
        logger.info("Admin {} responding to feedback: {}", adminId, feedbackId);
        
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found with id: " + feedbackId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with id: " + adminId));

        feedback.setAdminResponse(response);
        feedback.setResponseDate(LocalDateTime.now());
        feedback.setStatus(newStatus);

        Feedback updatedFeedback = feedbackRepository.save(feedback);
        logger.info("Feedback response saved: id={}, status={}", feedbackId, newStatus);
        
        return updatedFeedback;
    }

    @Transactional
    public Feedback updateFeedbackStatus(Long feedbackId, FeedbackStatus newStatus) {
        logger.info("Updating feedback status: {} -> {}", feedbackId, newStatus);
        
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found with id: " + feedbackId));

        feedback.setStatus(newStatus);
        feedback.setUpdatedAt(LocalDateTime.now());

        Feedback updatedFeedback = feedbackRepository.save(feedback);
        logger.info("Feedback status updated: id={}, newStatus={}", feedbackId, newStatus);
        
        return updatedFeedback;
    }

    public long getPendingFeedbacksCount() {
        long count = feedbackRepository.countPendingFeedbacks();
        logger.info("Pending feedbacks count: {}", count);
        return count;
    }

    public long getFeedbacksCountByStatus(FeedbackStatus status) {
        long count = feedbackRepository.countByStatus(status);
        logger.info("Feedbacks count with status {}: {}", status, count);
        return count;
    }

    public List<Feedback> getFeedbacksByCategory(String category) {
        logger.info("Fetching feedbacks with category: {}", category);
        List<Feedback> feedbacks = feedbackRepository.findByCategoryOrderByCreatedAtDesc(category);
        logger.info("Retrieved {} feedbacks with category {}", feedbacks.size(), category);
        return feedbacks;
    }

    public List<Feedback> getFeedbacksByPriority(String priority) {
        logger.info("Fetching feedbacks with priority: {}", priority);
        List<Feedback> feedbacks = feedbackRepository.findByPriorityOrderByCreatedAtDesc(priority);
        logger.info("Retrieved {} feedbacks with priority {}", feedbacks.size(), priority);
        return feedbacks;
    }
} 