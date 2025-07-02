package d10_rt01.hocho.service;

import d10_rt01.hocho.model.*;
import d10_rt01.hocho.model.enums.UserRole;
import d10_rt01.hocho.repository.CourseEnrollmentRepository;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationIntegrationService {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final ParentChildMappingRepository parentChildMappingRepository;

    /**
     * Tạo notification khi child tham gia khóa học (sau khi thanh toán thành công)
     */
    public void createEnrollmentNotifications(CourseEnrollment enrollment) {
        String courseName = enrollment.getCourse().getTitle();
        String childName = enrollment.getChild().getFullName();
        String parentName = enrollment.getParent().getFullName();
        Long teacherId = enrollment.getCourse().getTeacher().getId();

        // Notification cho Child
        notificationService.createChildJoinedCourseNotification(
            enrollment.getChild().getId(), 
            courseName
        );

        // Notification cho Parent
        notificationService.createChildJoinedCourseParentNotification(
            enrollment.getParent().getId(), 
            childName, 
            courseName
        );

        // Notification cho Teacher
        notificationService.createChildJoinedCourseTeacherNotification(
            teacherId, 
            childName, 
            courseName
        );
    }

    /**
     * Tạo notification khi thanh toán thành công
     */
    public void createPaymentSuccessNotifications(Order order) {
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            BigDecimal totalAmount = order.getOrderItems().stream()
                .map(OrderItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            String amountStr = totalAmount.toString() + " VND";
            
            // Notification cho Parent
            notificationService.createPaymentSuccessNotification(
                order.getParent().getId(), 
                amountStr, 
                "khóa học đã mua"
            );

            // Notification cho Teacher (mỗi khóa học)
            for (OrderItem item : order.getOrderItems()) {
                Long teacherId = item.getCourse().getTeacher().getId();
                String childName = item.getChild().getFullName();
                String courseName = item.getCourse().getTitle();
                String itemAmount = item.getPrice().toString() + " VND";
                
                notificationService.createPaymentReceivedTeacherNotification(
                    teacherId, 
                    itemAmount, 
                    childName, 
                    courseName
                );
            }
        }
    }

    /**
     * Tạo notification khi child hoàn thành khóa học
     */
    public void createCourseCompletionNotifications(Long childId, Long courseId, String courseName) {
        // Tìm parent của child
        User child = userRepository.findById(childId)
            .orElseThrow(() -> new RuntimeException("Child not found"));
        
        String childName = child.getFullName();
        
        // Notification cho Child
        notificationService.createChildCompletedCourseNotification(childId, courseName);
        
        // Tìm parent từ CourseEnrollment
        CourseEnrollment enrollment = courseEnrollmentRepository.findByChildId(childId).stream()
            .filter(e -> e.getCourse().getCourseId().equals(courseId))
            .findFirst()
            .orElse(null);
        
        if (enrollment != null) {
            // Notification cho Parent
            notificationService.createChildCompletedCourseParentNotification(
                enrollment.getParent().getId(), 
                childName, 
                courseName
            );
            
            // Notification cho Teacher
            notificationService.createChildCompletedCourseTeacherNotification(
                enrollment.getCourse().getTeacher().getId(), 
                childName, 
                courseName
            );
        }
    }

    /**
     * Tạo notification khi child hoàn thành quiz
     */
    public void createQuizCompletionNotifications(Long childId, String quizName) {
        // Tìm parent của child
        User child = userRepository.findById(childId)
            .orElseThrow(() -> new RuntimeException("Child not found"));
        
        String childName = child.getFullName();
        
        // Tìm parent từ ParentChildMapping
        ParentChildMapping mapping = parentChildMappingRepository.findByChildId(childId);
        Long parentId = mapping != null ? mapping.getParent().getId() : null;
        
        if (parentId != null) {
            notificationService.createChildCompletedQuizParentNotification(parentId, childName, quizName);
        }
    }

    /**
     * Tạo notification khi có feedback mới
     */
    public void createFeedbackNotifications(String senderName, String feedbackType) {
        // Tìm tất cả admin để gửi notification
        List<User> admins = userRepository.findByRole(UserRole.ADMIN.toString());
        
        System.out.println("Found " + admins.size() + " admin users for feedback notification");
        
        for (User admin : admins) {
            try {
                notificationService.createFeedbackReceivedNotification(
                    admin.getId(), 
                    senderName, 
                    feedbackType
                );
                System.out.println("Created feedback notification for admin: " + admin.getId());
            } catch (Exception e) {
                System.err.println("Failed to create feedback notification for admin: " + admin.getId() + ", Error: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    /**
     * Tạo notification khi có user mới đăng ký
     */
    public void createNewUserRegistrationNotifications(String username, String role) {
        // Tìm tất cả admin để gửi notification
        List<User> admins = userRepository.findByRole(UserRole.ADMIN.toString());
        
        for (User admin : admins) {
            notificationService.createNewUserRegisteredNotification(
                admin.getId(), 
                username, 
                role
            );
        }
    }

    /**
     * Tạo notification chào mừng cho user mới
     */
    public void createWelcomeNotification(Long userId, String fullName) {
        notificationService.createWelcomeNotification(userId, fullName);
    }

    /**
     * Tạo notification cho admin khi teacher thêm video mới
     */
    public void createTeacherAddedVideoNotifications(String teacherName, String videoTitle) {
        // Tìm tất cả admin để gửi notification
        List<User> admins = userRepository.findByRole(UserRole.ADMIN.toString());
        
        for (User admin : admins) {
            notificationService.createTeacherAddedVideoNotification(
                admin.getId(), 
                teacherName, 
                videoTitle
            );
        }
    }

    /**
     * Tạo notification cho admin khi có teacher thêm course mới
     */
    public void createTeacherAddedCourseNotifications(String teacherName, String courseTitle) {
        // Tìm tất cả admin để gửi notification
        List<User> admins = userRepository.findByRole(UserRole.ADMIN.toString());
        
        for (User admin : admins) {
            notificationService.createTeacherAddedCourseNotification(
                admin.getId(), 
                teacherName, 
                courseTitle
            );
        }
    }

    /**
     * Tạo notification cho user khi feedback được phản hồi
     */
    public void createFeedbackRespondedNotification(Long userId, String feedbackSubject) {
        notificationService.createFeedbackRespondedNotification(userId, feedbackSubject);
    }

    /**
     * Tạo notification cho user khi feedback bị từ chối
     */
    public void createFeedbackRejectedNotification(Long userId, String feedbackSubject) {
        notificationService.createFeedbackRejectedNotification(userId, feedbackSubject);
    }
} 