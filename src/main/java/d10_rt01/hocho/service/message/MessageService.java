package d10_rt01.hocho.service.message;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.controller.admin.AdminController;
import d10_rt01.hocho.model.ChatSession;
import d10_rt01.hocho.model.Message;
import d10_rt01.hocho.repository.ChatSessionRepository;
import d10_rt01.hocho.repository.MessageRepository;
import d10_rt01.hocho.utils.CustomLogger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import com.microsoft.sqlserver.jdbc.SQLServerException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(MessageService.class), DebugModeConfig.SERVICE_LAYER);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Retryable(
            value = { SQLServerException.class },
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2.0)
    )
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Message sendMessage(Message message) {
        // Khóa ChatSession trước
        ChatSession chatSession = chatSessionRepository.findById(message.getChatSession().getSessionId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy session chat"));

        // Validate sender and receiver
        if (!chatSession.getUser1().getId().equals(message.getSender().getId()) &&
                !chatSession.getUser2().getId().equals(message.getSender().getId())) {
            throw new RuntimeException("Người gửi không thuộc session chat này");
        }
        if (!chatSession.getUser1().getId().equals(message.getReceiver().getId()) &&
                !chatSession.getUser2().getId().equals(message.getReceiver().getId())) {
            throw new RuntimeException("Người nhận không thuộc session chat này");
        }

        // Set message properties
        message.setCreatedAt(LocalDateTime.now());
        message.setIsDelivered(true);

        // Lưu Message
        Message savedMessage = messageRepository.save(message);

        // Cập nhật ChatSession
        chatSession.setLastMessageAt(savedMessage.getCreatedAt());
        chatSessionRepository.save(chatSession);

        // Gửi qua WebSocket
        messagingTemplate.convertAndSend("/user/" + message.getReceiver().getId() + "/queue/messages", savedMessage);
        messagingTemplate.convertAndSend("/user/" + message.getSender().getId() + "/queue/messages", savedMessage);

        logger.info("Send message : " + message.getContent());
        logger.info("Saved message with sessionId: {}", savedMessage.getChatSession().getSessionId());

        return savedMessage;
    }

    public List<Message> getSessionMessages(Long sessionId) {
        return messageRepository.findByChatSession_SessionId(sessionId);
    }

    @Retryable(
            value = { SQLServerException.class },
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2.0)
    )
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void markMessageAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));
        message.setIsRead(true);
        messageRepository.save(message);

        // Notify sender via WebSocket that message was read
        System.out.println("Gửi thông báo đã đọc đến: /user/" + message.getSender().getId() + "/queue/messages/read");
        messagingTemplate.convertAndSend("/user/" + message.getSender().getId() + "/queue/messages/read", messageId);
    }
}