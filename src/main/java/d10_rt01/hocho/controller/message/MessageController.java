package d10_rt01.hocho.controller.message;

import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.model.ChatSession;
import d10_rt01.hocho.model.Message;
import d10_rt01.hocho.dto.ChatSessionDto;
import d10_rt01.hocho.service.message.ChatSessionService;
import d10_rt01.hocho.service.message.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.concurrent.ExecutorService;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private ChatSessionService chatSessionService;

    @Autowired
    private ExecutorService executorService;

    // Create a new chat session
    @PostMapping("/sessions")
    public ResponseEntity<ChatSession> createChatSession(@RequestParam Long user1Id) {
        return ResponseEntity.ok(chatSessionService.createChatSession(user1Id, user1Id));
    }

    // Get user's chat sessions
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionDto>> getUserChatSessions() {
        List<ChatSessionDto> cs = chatSessionService.getCurrentUserChatSessionsWithLastMessage();
        return ResponseEntity.ok(cs);
    }

    // Get messages for a chat session
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<List<Message>> getSessionMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(messageService.getSessionMessages(sessionId));
    }

    // Send message via REST (for backward compatibility)
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.sendMessage(message));
    }

    // Send message via WebSocket
    @MessageMapping("/sendMessage")
    public void sendWebSocketMessage(@Payload Message message) {
        messageService.sendMessage(message);
    }

    // Mark message as read
    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    // Mark session as read
    @PostMapping("/sessions/{sessionId}/read")
    public ResponseEntity<Void> markSessionAsRead(
            @PathVariable Long sessionId,
            @RequestParam Long userId,
            @RequestParam Long lastReadMessageId) {
        chatSessionService.markAsRead(sessionId, userId, lastReadMessageId);
        return ResponseEntity.ok().build();
    }

    // Upload file for message
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String uploadDir = HochoConfig.ABSOLUTE_PATH_MESSAGE_UPLOAD_DIR;
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok("/message/" + fileName);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
        }
    }

    // Get a message file (image)
    @GetMapping("/image/{fileName:.+}")
    public ResponseEntity<Resource> getMessageImage(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_MESSAGE_UPLOAD_DIR, fileName);
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);
        } else {
            throw new FileNotFoundException("File not found: " + fileName);
        }
    }

    // Download the message file
    @GetMapping("/file/{fileName:.+}")
    public ResponseEntity<Resource> downloadMessageFile(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_MESSAGE_UPLOAD_DIR, fileName);
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);
        } else {
            throw new FileNotFoundException("File not found: " + fileName);
        }
    }
}