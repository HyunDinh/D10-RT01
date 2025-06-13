package d10_rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "child_requests_cart")
public class ChildRequestsCart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_cart_id")
    private Long requestCartId;

    @ManyToOne
    @JoinColumn(name = "child_id", nullable = false)
    private User child;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    //Trước khi lưu xuống database sẽ gọi phương thức set thời gian hiện tại này
    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
} 