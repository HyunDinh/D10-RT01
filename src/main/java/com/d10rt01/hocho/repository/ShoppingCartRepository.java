package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    List<ShoppingCart> findByParentUserId(Long parentId);
    boolean existsByParentUserIdAndChildUserIdAndCourseCourseId(Long parentId, Long childId, Long courseId);
}