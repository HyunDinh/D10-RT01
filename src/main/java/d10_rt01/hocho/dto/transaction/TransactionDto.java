package d10_rt01.hocho.dto.transaction;

import d10_rt01.hocho.model.enums.TransactionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TransactionDto {
    private Long transactionId;
    private String payosTransactionId;
    private Long orderId;
    private BigDecimal amount;
    private TransactionStatus status;
    private LocalDateTime transactionDate;
    private List<OrderItemDto> items;

    // Constructor để dễ dàng map từ entity Transaction
    public TransactionDto(Long transactionId, String payosTransactionId, Long orderId, BigDecimal amount, TransactionStatus status, LocalDateTime transactionDate, List<OrderItemDto> items) {
        this.transactionId = transactionId;
        this.payosTransactionId = payosTransactionId;
        this.orderId = orderId;
        this.amount = amount;
        this.status = status;
        this.transactionDate = transactionDate;
        this.items = items;
    }
} 