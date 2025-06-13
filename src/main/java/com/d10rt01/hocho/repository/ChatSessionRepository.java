package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.ChatSession;
import com.d10rt01.hocho.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUser1OrUser2(User user1, User user2);
    boolean existsByUser1_IdAndUser2_Id(Long user1Id, Long user2Id);
}