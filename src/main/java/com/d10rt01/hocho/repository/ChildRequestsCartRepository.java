package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.ChildRequestsCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChildRequestsCartRepository extends JpaRepository<ChildRequestsCart, Long> {
    //Tim tre em qua Id -> hiển thị toàn bộ khóa học của trẻ em đó và thông tin liên quan
    List<ChildRequestsCart> findByChildId(Long childId);

    //Kiem tra khoa hoc da ton tai trong gio hang cua tre em chua
    boolean existsByChildIdAndCourseCourseId(Long childId, Long courseId);

    //Xoa khoa hoc khoi gio hang cua tre em
    void deleteByChildIdAndCourseCourseId(Long childId, Long courseId);
} 