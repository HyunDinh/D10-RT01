package d10_rt01.hocho.dto;

import d10_rt01.hocho.model.User;
import lombok.Data;

@Data
public class ChatSessionDto {
    private Long sessionId;
    private User user1;
    private User user2;
    private String lastMessageContent;
    private java.time.LocalDateTime lastMessageAt;
    private int unreadCount;
    private Long lastMessageSenderId;
    private String lastMessageFileType;
    private String lastMessageFileUrl;
} 