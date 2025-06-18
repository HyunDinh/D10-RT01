package d10_rt01.hocho.dto.transaction;

import d10_rt01.hocho.model.enums.TransactionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDto {
    private Long transactionId;
    private String payosTransactionId;
    private Long orderCode; // Thêm trường orderCode
    private BigDecimal amount;
    private TransactionStatus status;
    private LocalDateTime transactionDate;

    // Constructor để dễ dàng map từ entity Transaction
    public TransactionDto(Long transactionId, String payosTransactionId, Long orderCode, BigDecimal amount, TransactionStatus status, LocalDateTime transactionDate) {
        this.transactionId = transactionId;
        this.payosTransactionId = payosTransactionId;
        this.orderCode = orderCode;
        this.amount = amount;
        this.status = status;
        this.transactionDate = transactionDate;
    }
} 