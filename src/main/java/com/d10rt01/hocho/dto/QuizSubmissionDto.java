package com.d10rt01.hocho.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizSubmissionDto {
    private Long childId;
    private List<QuizAnswerDto> answers;
} 