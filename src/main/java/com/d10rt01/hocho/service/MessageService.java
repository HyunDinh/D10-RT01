package com.d10rt01.hocho.service;

import com.d10rt01.hocho.model.ChatSession;
import com.d10rt01.hocho.model.Message;
import com.d10rt01.hocho.repository.ChatSessionRepository;
import com.d10rt01.hocho.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Transactional
    public Message sendMessage(Message message) {
        // Kiểm tra sender và receiver không được trùng nhau
        if (message.getSender().getId().equals(message.getReceiver().getId())) {
            throw new RuntimeException("Sender and receiver cannot be the same user");
        }
        // Kiểm tra phiên chat có tồn tại không
        ChatSession chatSession = chatSessionRepository.findById(message.getChatSession().getSessionId())
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        // Kiểm tra người gửi và người nhận có thuộc phiên chat này không
        if (!chatSession.getUser1().getId().equals(message.getSender().getId()) &&
            !chatSession.getUser2().getId().equals(message.getSender().getId())) {
            throw new RuntimeException("Sender is not part of this chat session");
        }

        if (!chatSession.getUser1().getId().equals(message.getReceiver().getId()) &&
            !chatSession.getUser2().getId().equals(message.getReceiver().getId())) {
            throw new RuntimeException("Receiver is not part of this chat session");
        }

        // Cập nhật thời gian tin nhắn cuối cùng của phiên chat
        chatSession.setLastMessageAt(LocalDateTime.now());
        chatSessionRepository.save(chatSession);

        return messageRepository.save(message);
    }

    public List<Message> getSessionMessages(Long sessionId) {
        return messageRepository.findByChatSession_SessionId(sessionId);
    }

    @Transactional
    public void markMessageAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        messageRepository.save(message);
    }
}