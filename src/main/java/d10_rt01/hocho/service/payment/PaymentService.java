package d10_rt01.hocho.service.payment;


import d10_rt01.hocho.dto.TotalRevenueDto;
import d10_rt01.hocho.dto.transaction.TransactionDto;
import d10_rt01.hocho.model.Payment;
import d10_rt01.hocho.model.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {
    Payment createPayment(Long userId, List<Long> cartItemIds, String description);
    Payment getPaymentByOrderCode(Long orderCode);
    Payment getPaymentByOrderCodeAndUserId(Long orderCode, Long userId);
    Payment cancelPayment(Long orderCode);
    List<Payment> getPaymentsByUserId(Long userId);
    void handlePaymentWebhook(String orderCode, String status);
    Payment handlePaymentReturn(Long orderCode);
    
    List<TransactionDto> getTransactionsByUserId(Long userId);
    TotalRevenueDto getTotalRevenueForTeacher(Long teacherId);
} 