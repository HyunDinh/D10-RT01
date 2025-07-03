package d10_rt01.hocho.controller.message;

import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.model.ChatSession;
import d10_rt01.hocho.model.Message;
import d10_rt01.hocho.dto.ChatSessionDto;
import d10_rt01.hocho.service.message.ChatSessionService;
import d10_rt01.hocho.service.message.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

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
    public ResponseEntity<ChatSession> createChatSession(@RequestParam Long user1Id) {
        return ResponseEntity.ok(chatSessionService.createChatSession(user1Id, user1Id));
    }

    // Lấy danh sách các cuộc trò chuyện của người dùng (đã đăng nhập)
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionDto>> getUserChatSessions() {
        return ResponseEntity.ok(chatSessionService.getCurrentUserChatSessionsWithLastMessage());
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

    // Đánh dấu đã đọc cho cả session
    @PostMapping("/sessions/{sessionId}/read")
    public ResponseEntity<?> markSessionAsRead(
            @PathVariable Long sessionId,
            @RequestParam Long userId,
            @RequestParam Long lastReadMessageId) {
        chatSessionService.markAsRead(sessionId, userId, lastReadMessageId);
        return ResponseEntity.ok().build();
    }

    // Upload file cho tin nhắn
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String uploadDir = HochoConfig.ABSOLUTE_PATH_MESSAGE_UPLOAD_DIR;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về đường dẫn file giống question/answer
            return ResponseEntity.ok("/message/" + fileName);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }
    }

    // Lấy file gửi kèm tin nhắn
    @GetMapping("/image/{fileName:.+}")
    public ResponseEntity<Resource> getMessageImage(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_MESSAGE_UPLOAD_DIR, fileName);
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() || resource.isReadable()) {
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
        } else {
            throw new FileNotFoundException("File not found " + fileName);
        }
    }

    @GetMapping("/file/{fileName:.+}")
    public ResponseEntity<Resource> downloadMessageFile(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_MESSAGE_UPLOAD_DIR, fileName);
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() || resource.isReadable()) {
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
        } else {
            throw new FileNotFoundException("File not found " + fileName);
        }
    }
}