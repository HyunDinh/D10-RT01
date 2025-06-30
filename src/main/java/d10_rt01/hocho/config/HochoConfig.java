package d10_rt01.hocho.config;

public class HochoConfig {
    public static final boolean EMAIL_SENDER = false;
    // ------------------------------- PROFILE PICTURE SIZE ------------------------------

    // TODO : update static path here and also in application.properties
    public static final String ABSOLUTE_PATH_PROFILE_UPLOAD_DIR = "D:/res/static/profile/";
    public static final String ABSOLUTE_PATH_TEACHER_VERIFICATION_UPLOAD_DIR = "D:/res/static/teacher-verification/";
    // ------------------------------ PROFILE PICTURE PATH -------------------------------

    public static final long MAX_PROFILE_PICTURE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // ------------------------------- QUESTION & ANSWER IMAGE CONFIG ------------------------------
    public static final String ABSOLUTE_PATH_QUESTION_UPLOAD_DIR = "D:/res/static/question/";
    public static final String ABSOLUTE_PATH_ANSWER_UPLOAD_DIR = "D:/res/static/answer/";
    public static final String ABSOLUTE_PATH_QUIZ_UPLOAD_DIR = "D:/res/static/quiz/";
    public static final long MAX_QUESTION_ANSWER_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    public static final long MAX_QUIZ_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // ------------------------------- COURSE IMAGE CONFIG ------------------------------
    public static final String ABSOLUTE_PATH_COURSE_UPLOAD_DIR = "D:/res/static/course/";
    public static final long MAX_COURSE_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // ------------------------------- LESSON CONTENT CONFIG ------------------------------
    public static final String ABSOLUTE_PATH_LESSON_CONTENT_UPLOAD_DIR = "D:/res/static/lesson-content/";

    public static final String ABSOLUTE_PATH_MESSAGE_UPLOAD_DIR = "D:/res/static/message/";
}
