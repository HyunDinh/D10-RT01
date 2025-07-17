package d10_rt01.hocho.model.enums;

public enum NotificationType {
    // Child notifications
    CHILD_JOINED_COURSE,
    CHILD_COMPLETED_COURSE,
    VIDEO_TIME_REWARD_LESSON,
    VIDEO_TIME_REWARD_QUIZ,
    
    // Parent notifications
    CHILD_JOINED_COURSE_PARENT,
    PAYMENT_SUCCESS,
    CHILD_COMPLETED_COURSE_PARENT,
    CHILD_COMPLETED_QUIZ_PARENT,
    
    // Teacher notifications
    CHILD_JOINED_COURSE_TEACHER,
    CHILD_COMPLETED_COURSE_TEACHER,
    PAYMENT_RECEIVED_TEACHER,
    
    // Admin notifications
    FEEDBACK_RECEIVED,
    NEW_USER_REGISTERED,
    TEACHER_ADDED_VIDEO,
    TEACHER_ADDED_COURSE,
    
    // User notifications
    FEEDBACK_RESPONDED,
    FEEDBACK_REJECTED,
    
    // Welcome notifications
    WELCOME_MESSAGE
} 