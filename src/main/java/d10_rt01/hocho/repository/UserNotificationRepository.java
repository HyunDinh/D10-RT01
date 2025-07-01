package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.UserNotification;
import d10_rt01.hocho.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    
    @Query("SELECT n FROM UserNotification n WHERE n.user.id = :userId AND n.userRole = :role ORDER BY n.createdAt DESC")
    List<UserNotification> findByUserIdAndRole(@Param("userId") Long userId, @Param("role") UserRole role);
    
    @Query("SELECT n FROM UserNotification n WHERE n.user.id = :userId AND n.userRole = :role AND n.isRead = false ORDER BY n.createdAt DESC")
    List<UserNotification> findUnreadByUserIdAndRole(@Param("userId") Long userId, @Param("role") UserRole role);
    
    @Query("SELECT COUNT(n) FROM UserNotification n WHERE n.user.id = :userId AND n.userRole = :role AND n.isRead = false")
    Long countUnreadByUserIdAndRole(@Param("userId") Long userId, @Param("role") UserRole role);
    
    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
} 