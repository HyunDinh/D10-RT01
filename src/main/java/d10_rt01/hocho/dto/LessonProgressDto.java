package d10_rt01.hocho.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LessonProgressDto {
    private Long lessonId;
    private String lessonTitle;
    private String status; // COMPLETED, IN_PROGRESS, NOT_STARTED
    private LocalDateTime startDate;
    private LocalDateTime completionDate;
    private int studyTime; // minutes
    private int watchProgress; // 0-100%
} 