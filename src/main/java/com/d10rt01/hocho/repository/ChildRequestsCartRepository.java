package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.ChildRequestsCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChildRequestsCartRepository extends JpaRepository<ChildRequestsCart, Long> {
    List<ChildRequestsCart> findByChildUserId(Long childId);
    boolean existsByChildUserIdAndCourseCourseId(Long childId, Long courseId);
    void deleteByChildUserIdAndCourseCourseId(Long childId, Long courseId);
} 