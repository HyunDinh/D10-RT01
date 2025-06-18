package d10_rt01.hocho.model;

import d10_rt01.hocho.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @OneToOne(mappedBy = "order")
    @lombok.ToString.Exclude
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Payment payment;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.ToString.Exclude
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<OrderItem> orderItems;

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
    }
} 