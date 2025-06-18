package d10_rt01.hocho.dto.quiz;

import lombok.Data;

@Data
public class QuizAnswerDto {
    private Long questionId;
    private String selectedOptionId;
} 