package d10_rt01.hocho.dto.payment.request;

import lombok.Data;

import java.util.List;

@Data
public class PaymentRequest {
    private Long userId;
    private List<Long> cartItemIds;
    private String description;
} 