package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.Payment;
import d10_rt01.hocho.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrderCode(Long orderCode);
    Payment findByOrderCodeAndUserId(Long orderCode, Long userId);
    List<Payment> findByUserId(Long userId);


    List<Payment> findByStatus(PaymentStatus status);
}