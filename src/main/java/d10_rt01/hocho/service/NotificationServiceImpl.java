package d10_rt01.hocho.service;

import d10_rt01.hocho.dto.NotificationDto;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.UserNotification;
import d10_rt01.hocho.model.enums.NotificationType;
import d10_rt01.hocho.model.enums.UserRole;
import d10_rt01.hocho.repository.UserNotificationRepository;
import d10_rt01.hocho.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final UserNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<NotificationDto> getNotificationsByUserIdAndRole(Long userId, UserRole role) {
        List<UserNotification> notifications = notificationRepository.findByUserIdAndRole(userId, role);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDto> getUnreadNotificationsByUserIdAndRole(Long userId, UserRole role) {
        List<UserNotification> notifications = notificationRepository.findUnreadByUserIdAndRole(userId, role);
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        UserNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId, UserRole role) {
        List<UserNotification> unreadNotifications = notificationRepository.findUnreadByUserIdAndRole(userId, role);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public Long countUnreadNotifications(Long userId, UserRole role) {
        return notificationRepository.countUnreadByUserIdAndRole(userId, role);
    }

    // Child notifications
    @Override
    public void createChildJoinedCourseNotification(Long childId, String courseName) {
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(child);
        notification.setUserRole(UserRole.CHILD);
        notification.setNotificationType(NotificationType.CHILD_JOINED_COURSE);
        notification.setContent("Bạn đã tham gia khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createChildCompletedCourseNotification(Long childId, String courseName) {
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(child);
        notification.setUserRole(UserRole.CHILD);
        notification.setNotificationType(NotificationType.CHILD_COMPLETED_COURSE);
        notification.setContent("Chúc mừng! Bạn đã hoàn thành khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    // Parent notifications
    @Override
    public void createChildJoinedCourseParentNotification(Long parentId, String childName, String courseName) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(parent);
        notification.setUserRole(UserRole.PARENT);
        notification.setNotificationType(NotificationType.CHILD_JOINED_COURSE_PARENT);
        notification.setContent(childName + " đã tham gia khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createPaymentSuccessNotification(Long parentId, String amount, String courseName) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(parent);
        notification.setUserRole(UserRole.PARENT);
        notification.setNotificationType(NotificationType.PAYMENT_SUCCESS);
        notification.setContent("Thanh toán thành công " + amount + " cho khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createChildCompletedCourseParentNotification(Long parentId, String childName, String courseName) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(parent);
        notification.setUserRole(UserRole.PARENT);
        notification.setNotificationType(NotificationType.CHILD_COMPLETED_COURSE_PARENT);
        notification.setContent(childName + " đã hoàn thành khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createChildCompletedQuizParentNotification(Long parentId, String childName, String quizName) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(parent);
        notification.setUserRole(UserRole.PARENT);
        notification.setNotificationType(NotificationType.CHILD_COMPLETED_QUIZ_PARENT);
        notification.setContent(childName + " đã hoàn thành quiz: " + quizName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    // Teacher notifications
    @Override
    public void createChildJoinedCourseTeacherNotification(Long teacherId, String childName, String courseName) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(teacher);
        notification.setUserRole(UserRole.TEACHER);
        notification.setNotificationType(NotificationType.CHILD_JOINED_COURSE_TEACHER);
        notification.setContent(childName + " đã tham gia khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createChildCompletedCourseTeacherNotification(Long teacherId, String childName, String courseName) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(teacher);
        notification.setUserRole(UserRole.TEACHER);
        notification.setNotificationType(NotificationType.CHILD_COMPLETED_COURSE_TEACHER);
        notification.setContent(childName + " đã hoàn thành khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createPaymentReceivedTeacherNotification(Long teacherId, String amount, String childName, String courseName) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(teacher);
        notification.setUserRole(UserRole.TEACHER);
        notification.setNotificationType(NotificationType.PAYMENT_RECEIVED_TEACHER);
        notification.setContent("Bạn đã nhận " + amount + " từ " + childName + " cho khóa học: " + courseName);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    // Admin notifications
    @Override
    public void createFeedbackReceivedNotification(Long adminId, String senderName, String feedbackType) {
        try {
            User admin = userRepository.findById(adminId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            UserNotification notification = new UserNotification();
            notification.setUser(admin);
            notification.setUserRole(UserRole.ADMIN);
            notification.setNotificationType(NotificationType.FEEDBACK_RECEIVED);
            notification.setContent("Nhận feedback từ " + senderName + " (" + feedbackType + ")");
            notification.setIsRead(false);
            
            UserNotification savedNotification = notificationRepository.save(notification);
            System.out.println("Saved feedback notification with ID: " + savedNotification.getNotificationId());
        } catch (Exception e) {
            System.err.println("Failed to create feedback notification: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public void createNewUserRegisteredNotification(Long adminId, String username, String role) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(admin);
        notification.setUserRole(UserRole.ADMIN);
        notification.setNotificationType(NotificationType.NEW_USER_REGISTERED);
        notification.setContent("Có người dùng mới đăng ký: " + username + " (Role: " + role + ")");
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createWelcomeNotification(Long userId, String fullName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setUserRole(UserRole.valueOf(user.getRole().toUpperCase()));
        notification.setNotificationType(NotificationType.WELCOME_MESSAGE);
        notification.setContent("Welcome to Hocho! " + fullName + ". The e-learning and entertainment platform for children.");
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createFeedbackRespondedNotification(Long userId, String feedbackSubject) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setUserRole(UserRole.valueOf(user.getRole().toUpperCase()));
        notification.setNotificationType(NotificationType.FEEDBACK_RESPONDED);
        notification.setContent("Feedback của bạn '" + feedbackSubject + "' đã được phản hồi bởi admin.");
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createFeedbackRejectedNotification(Long userId, String feedbackSubject) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setUserRole(UserRole.valueOf(user.getRole().toUpperCase()));
        notification.setNotificationType(NotificationType.FEEDBACK_REJECTED);
        notification.setContent("Feedback của bạn '" + feedbackSubject + "' đã bị từ chối bởi admin.");
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createTeacherAddedVideoNotification(Long adminId, String teacherName, String videoTitle) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(admin);
        notification.setUserRole(UserRole.ADMIN);
        notification.setNotificationType(NotificationType.TEACHER_ADDED_VIDEO);
        notification.setContent("Teacher " + teacherName + " đã thêm video mới: " + videoTitle);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void createTeacherAddedCourseNotification(Long adminId, String teacherName, String courseTitle) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        UserNotification notification = new UserNotification();
        notification.setUser(admin);
        notification.setUserRole(UserRole.ADMIN);
        notification.setNotificationType(NotificationType.TEACHER_ADDED_COURSE);
        notification.setContent("Teacher " + teacherName + " đã thêm khóa học mới: " + courseTitle);
        notification.setIsRead(false);
        
        notificationRepository.save(notification);
    }

    @Override
    public void deleteAllNotifications(Long userId, UserRole role) {
        notificationRepository.deleteByUserIdAndUserRole(userId, role);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Helper method to convert entity to DTO
    private NotificationDto convertToDto(UserNotification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setNotificationId(notification.getNotificationId());
        dto.setUserId(notification.getUser().getId());
        dto.setUserRole(notification.getUserRole());
        dto.setNotificationType(notification.getNotificationType());
        dto.setContent(notification.getContent());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setIsRead(notification.getIsRead());
        dto.setRelatedEntityId(notification.getRelatedEntityId());
        
        if (notification.getSender() != null) {
            dto.setSenderName(notification.getSender().getFullName());
        }
        
        return dto;
    }
} 