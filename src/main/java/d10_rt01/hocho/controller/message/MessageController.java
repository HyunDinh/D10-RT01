package d10_rt01.hocho.controller.message;

import d10_rt01.hocho.model.ChatSession;
import d10_rt01.hocho.model.Message;
import d10_rt01.hocho.service.message.ChatSessionService;
import d10_rt01.hocho.service.message.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private ChatSessionService chatSessionService;

    // Tạo phiên chat mới
    @PostMapping("/sessions")
    public ResponseEntity<ChatSession> createChatSession(@RequestParam Long user1Id, @RequestParam Long user2Id) {
        return ResponseEntity.ok(chatSessionService.createChatSession(user1Id, user2Id));
    }

    // Lấy danh sách các cuộc trò chuyện của người dùng (đã đăng nhập)
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getUserChatSessions() {
        return ResponseEntity.ok(chatSessionService.getCurrentUserChatSessions());
    }

    // Lấy tin nhắn của một cuộc trò chuyện
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<List<Message>> getSessionMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(messageService.getSessionMessages(sessionId));
    }

    // Gửi tin nhắn mới
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.sendMessage(message));
    }

    // Đánh dấu tin nhắn đã đọc
    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }
}