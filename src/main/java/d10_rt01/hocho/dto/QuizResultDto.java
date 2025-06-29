package d10_rt01.hocho.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QuizResultDto {
    private Long quizId;
    private String quizTitle;
    private double score;
    private double maxScore;
    private double percentage;
    private int completionTime; // minutes
    private LocalDateTime attemptDate;
    private int correctAnswers;
    private int totalQuestions;
} 