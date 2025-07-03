package d10_rt01.hocho.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CourseProgressDto {
    private Long courseId;
    private String courseTitle;
    private String courseImageUrl;
    private double progressPercentage;
    private int totalLessons;
    private int completedLessons;
    private double averageQuizScore;
    private List<LessonProgressDto> lessonProgresses;
    private List<QuizResultDto> quizResults;
    private LocalDateTime lastStudyDate;
    private int totalStudyTime; // minutes
} 