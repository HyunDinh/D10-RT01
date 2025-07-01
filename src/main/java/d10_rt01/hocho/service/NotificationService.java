package d10_rt01.hocho.service;

import d10_rt01.hocho.dto.NotificationDto;
import d10_rt01.hocho.model.enums.NotificationType;
import d10_rt01.hocho.model.enums.UserRole;

import java.util.List;

public interface NotificationService {
    
    // Lấy tất cả notification theo userId và role
    List<NotificationDto> getNotificationsByUserIdAndRole(Long userId, UserRole role);
    
    // Lấy notification chưa đọc theo userId và role
    List<NotificationDto> getUnreadNotificationsByUserIdAndRole(Long userId, UserRole role);
    
    // Đánh dấu notification đã đọc
    void markAsRead(Long notificationId);
    
    // Đánh dấu tất cả notification đã đọc theo userId và role
    void markAllAsRead(Long userId, UserRole role);
    
    // Đếm số notification chưa đọc
    Long countUnreadNotifications(Long userId, UserRole role);
    
    // Tạo notification cho Child
    void createChildJoinedCourseNotification(Long childId, String courseName);
    void createChildCompletedCourseNotification(Long childId, String courseName);
    
    // Tạo notification cho Parent
    void createChildJoinedCourseParentNotification(Long parentId, String childName, String courseName);
    void createPaymentSuccessNotification(Long parentId, String amount, String courseName);
    void createChildCompletedCourseParentNotification(Long parentId, String childName, String courseName);
    void createChildCompletedQuizParentNotification(Long parentId, String childName, String quizName);
    
    // Tạo notification cho Teacher
    void createChildJoinedCourseTeacherNotification(Long teacherId, String childName, String courseName);
    void createChildCompletedCourseTeacherNotification(Long teacherId, String childName, String courseName);
    void createPaymentReceivedTeacherNotification(Long teacherId, String amount, String childName, String courseName);
    
    // Tạo notification cho Admin
    void createFeedbackReceivedNotification(Long adminId, String senderName, String feedbackType);
    
    // Tạo notification cho Admin khi có user mới đăng ký
    void createNewUserRegisteredNotification(Long adminId, String username, String role);
    
    // Tạo notification chào mừng cho user mới
    void createWelcomeNotification(Long userId, String fullName);
    
    // Tạo notification cho admin khi teacher thêm video/course
    void createTeacherAddedVideoNotification(Long adminId, String teacherName, String videoTitle);
    void createTeacherAddedCourseNotification(Long adminId, String teacherName, String courseTitle);
    
    // Tạo notification cho user khi feedback được phản hồi/từ chối
    void createFeedbackRespondedNotification(Long userId, String feedbackSubject);
    void createFeedbackRejectedNotification(Long userId, String feedbackSubject);
} 