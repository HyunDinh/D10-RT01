package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByParentId(Long parentId);
} 