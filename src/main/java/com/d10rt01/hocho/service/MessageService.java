package com.d10rt01.hocho.service;

import com.d10rt01.hocho.entity.Message;
import com.d10rt01.hocho.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Transactional
    public Message sendMessage(Message message) {
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