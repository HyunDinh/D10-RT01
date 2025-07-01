package d10_rt01.hocho.repository.order;

import d10_rt01.hocho.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder_OrderId(Long orderId);

    @Query("SELECT SUM(oi.price * oi.quantity) FROM OrderItem oi " +
            "JOIN oi.order o " +
            "JOIN o.payment p " +
            "WHERE p.status = 'COMPLETED' AND oi.course.courseId IN (SELECT c.courseId FROM Course c WHERE c.teacher.id = :teacherId)")
    double calculateRevenueForTeacher(Long teacherId);

    @Query("SELECT COUNT(DISTINCT oi.child.id) FROM OrderItem oi " +
            "JOIN oi.order o " +
            "JOIN o.payment p " +
            "WHERE p.status = 'COMPLETED' AND o.orderDate >= CURRENT_DATE " +
            "AND oi.course.courseId IN (SELECT c.courseId FROM Course c WHERE c.teacher.id = :teacherId)")
    int calculateTotalStudentsToday(Long teacherId);
} 