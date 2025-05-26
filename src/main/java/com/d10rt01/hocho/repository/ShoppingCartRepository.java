package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {

    //Hiển thị các khóa học trong giỏ hàng của Parent
    List<ShoppingCart> findByParentUserId(Long parentId);

    //Kiểm tra khóa học đã tồn tại trong giỏ hàng chưa (đã khớp với ChildId -- CourseId chưa)
    boolean existsByParentUserIdAndChildUserIdAndCourseCourseId(Long parentId, Long childId, Long courseId);
}