package d10_rt01.hocho.service.message;

import d10_rt01.hocho.model.ChatSession;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.ChatSessionRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.dto.ChatSessionDto;
import d10_rt01.hocho.model.Message;
import d10_rt01.hocho.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatSessionService {

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    public List<ChatSession> getCurrentUserChatSessions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName()).get();
        return chatSessionRepository.findByUser1OrUser2(currentUser, currentUser);
    }

    @Transactional
    public ChatSession createChatSession(Long otherUserId, Long user2Id) {
        // Lấy user hiện tại từ security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName()).get();
        
        if (currentUser.getId().equals(otherUserId)) {
            throw new RuntimeException("Cannot create chat session with yourself");
        }
        
        // Kiểm tra đã tồn tại phiên chat giữa hai user này chưa (cả hai chiều)
        boolean exists = chatSessionRepository.existsByUser1_IdAndUser2_Id(currentUser.getId(), otherUserId)
                || chatSessionRepository.existsByUser1_IdAndUser2_Id(otherUserId, currentUser.getId());
        if (exists) {
            throw new RuntimeException("Chat session between these users already exists");
        }
        
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatSession chatSession = new ChatSession();
        chatSession.setUser1(currentUser);
        chatSession.setUser2(otherUser);
        return chatSessionRepository.save(chatSession);
    }

    public List<ChatSessionDto> getCurrentUserChatSessionsWithLastMessage() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName()).get();
        List<ChatSession> sessions = chatSessionRepository.findByUser1OrUser2(currentUser, currentUser);
        List<ChatSessionDto> result = new java.util.ArrayList<>();
        for (ChatSession session : sessions) {
            ChatSessionDto dto = new ChatSessionDto();
            dto.setSessionId(session.getSessionId());
            dto.setUser1(session.getUser1());
            dto.setUser2(session.getUser2());
            dto.setLastMessageAt(session.getLastMessageAt());
            // Lấy message mới nhất
            Message lastMsg = messageRepository.findTopByChatSession_SessionIdOrderByCreatedAtDesc(session.getSessionId());
            if (lastMsg != null) {
                dto.setLastMessageContent(lastMsg.getContent());
                dto.setLastMessageSenderId(lastMsg.getSender().getId());
                dto.setLastMessageFileType(lastMsg.getFileType());
                dto.setLastMessageFileUrl(lastMsg.getFileUrl());
            } else {
                dto.setLastMessageContent(null);
                dto.setLastMessageSenderId(null);
                dto.setLastMessageFileType(null);
                dto.setLastMessageFileUrl(null);
            }
            // Tính số tin nhắn chưa đọc
            Long lastReadId = currentUser.getId().equals(session.getUser1().getId())
                ? session.getLastReadMessageIdUser1()
                : session.getLastReadMessageIdUser2();
            if (lastReadId == null) lastReadId = 0L;
            int unreadCount = messageRepository.countByChatSession_SessionIdAndMessageIdGreaterThan(session.getSessionId(), lastReadId);
            dto.setUnreadCount(unreadCount);
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public void markAsRead(Long sessionId, Long userId, Long lastReadMessageId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        if (session.getUser1().getId().equals(userId)) {
            session.setLastReadMessageIdUser1(lastReadMessageId);
        } else if (session.getUser2().getId().equals(userId)) {
            session.setLastReadMessageIdUser2(lastReadMessageId);
        }
        chatSessionRepository.save(session);
    }
}