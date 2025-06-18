package d10_rt01.hocho.dto.quiz;

import lombok.Data;

import java.util.List;

@Data
public class QuizSubmissionDto {
    private Long childId;
    private List<QuizAnswerDto> answers;
} 