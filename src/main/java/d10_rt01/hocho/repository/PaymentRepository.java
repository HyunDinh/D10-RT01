package d10_rt01.hocho.repository;

import d10_rt01.hocho.dto.DailyRevenueDto;
import d10_rt01.hocho.model.Payment;
import d10_rt01.hocho.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrderCode(Long orderCode);
    Payment findByOrderCodeAndUserId(Long orderCode, Long userId);
    List<Payment> findByUserId(Long userId);


    List<Payment> findByStatus(PaymentStatus status);

    @Query("SELECT NEW d10_rt01.hocho.dto.DailyRevenueDto(CAST(p.createdAt AS date), SUM(p.amount)) " +
            "FROM Payment p " +
            "WHERE p.status = 'COMPLETED' " +
            "AND p.createdAt BETWEEN :startDate AND :endDate " +
            "AND EXISTS ( " +
            "  SELECT 1 FROM OrderItem oi " +
            "  JOIN oi.course c " +
            "  WHERE oi.order = p.order AND c.teacher.id = :teacherId " +
            ") " +
            "GROUP BY CAST(p.createdAt AS date) " +
            "ORDER BY CAST(p.createdAt AS date) ASC")
    List<DailyRevenueDto> getDailyRevenueByTeacherId(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);












}