package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Có thể thêm các phương thức tìm kiếm tùy chỉnh tại đây nếu cần
    // Ví dụ: Transaction findByPayosTransactionId(String payosTransactionId);
    // List<Transaction> findByOrderId(Long orderId);
} 