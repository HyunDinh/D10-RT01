package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatSession_SessionId(Long sessionId);

    Message findTopByChatSession_SessionIdOrderByCreatedAtDesc(Long sessionId);

    int countByChatSession_SessionIdAndMessageIdGreaterThan(Long sessionId, Long messageId);
}