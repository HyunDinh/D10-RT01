package com.d10rt01.hocho.dto.payment.request;

import lombok.Data;

import java.util.List;

@Data
public class PaymentRequest {
    private Long userId;
    private List<Long> cartItemIds;
} 