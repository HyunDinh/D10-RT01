package com.d10rt01.hocho.service;

import com.d10rt01.hocho.model.ChatSession;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.repository.ChatSessionRepository;
import com.d10rt01.hocho.repository.UserRepository;
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

    public List<ChatSession> getCurrentUserChatSessions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return chatSessionRepository.findByUser1OrUser2(currentUser, currentUser);
    }

    @Transactional
    public ChatSession createChatSession(Long user1Id, Long user2Id) {
        if (user1Id.equals(user2Id)) {
            throw new RuntimeException("Cannot create chat session with the same user");
        }
        // Kiểm tra đã tồn tại phiên chat giữa hai user này chưa (cả hai chiều)
        boolean exists = chatSessionRepository.existsByUser1_IdAndUser2_Id(user1Id, user2Id)
                || chatSessionRepository.existsByUser1_IdAndUser2_Id(user2Id, user1Id);
        if (exists) {
            throw new RuntimeException("Chat session between these users already exists");
        }
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User 1 not found"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User 2 not found"));

        ChatSession chatSession = new ChatSession();
        chatSession.setUser1(user1);
        chatSession.setUser2(user2);
        return chatSessionRepository.save(chatSession);
    }
}