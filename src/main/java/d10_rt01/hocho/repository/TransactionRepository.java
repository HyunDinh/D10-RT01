package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Có thể thêm các phương thức tìm kiếm tùy chỉnh tại đây nếu cần
    // Ví dụ: Transaction findByPayosTransactionId(String payosTransactionId);
    // List<Transaction> findByOrderId(Long orderId);
    List<Transaction> findByOrder_Parent_Id(Long userId);

    @Query("SELECT t FROM Transaction t JOIN FETCH t.order o JOIN FETCH o.orderItems WHERE o.parent.id = :userId")
    List<Transaction> findByOrder_Parent_IdWithOrderItems(@Param("userId") Long userId);

    boolean existsByPayosTransactionId(String payosTransactionId);
} 