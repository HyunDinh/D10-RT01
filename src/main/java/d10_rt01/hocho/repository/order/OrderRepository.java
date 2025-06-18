package d10_rt01.hocho.repository.order;

import d10_rt01.hocho.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByParentId(Long parentId);
} 