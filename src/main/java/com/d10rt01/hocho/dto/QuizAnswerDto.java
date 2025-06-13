package com.d10rt01.hocho.dto;

import lombok.Data;

@Data
public class QuizAnswerDto {
    private Long questionId;
    private String selectedOptionId;
} 