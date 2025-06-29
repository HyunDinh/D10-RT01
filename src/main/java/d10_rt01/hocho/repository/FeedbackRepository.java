package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.Feedback;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findAllByOrderByCreatedAtDesc();
    
    List<Feedback> findByUserOrderByCreatedAtDesc(User user);
    
    List<Feedback> findByStatusOrderByCreatedAtDesc(FeedbackStatus status);
    
    List<Feedback> findByCategoryOrderByCreatedAtDesc(String category);

    List<Feedback> findByPriorityOrderByCreatedAtDesc(String priority);

    @Query("SELECT f FROM Feedback f WHERE f.status = :status AND f.priority = :priority ORDER BY f.createdAt DESC")
    List<Feedback> findByStatusAndPriorityOrderByCreatedAtDesc(@Param("status") FeedbackStatus status, @Param("priority") String priority);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.status = :status")
    long countByStatus(@Param("status") FeedbackStatus status);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.status = 'PENDING'")
    long countPendingFeedbacks();
} 