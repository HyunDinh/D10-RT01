package com.d10rt01.hocho.controller.message;

import com.d10rt01.hocho.model.Answer;
import com.d10rt01.hocho.model.Question;
import com.d10rt01.hocho.service.AnswerService;
import com.d10rt01.hocho.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    @Autowired
    private QuestionService questionService;
    @Autowired
    private AnswerService answerService;

    // Đăng câu hỏi
    @PostMapping
    public ResponseEntity<Question> createQuestion(
            @RequestParam("userId") Long userId,
            @RequestParam("content") String content,
            @RequestParam("subject") String subject,
            @RequestParam("grade") Integer grade,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveAnswerImage(imageFile);
        }
        Question question = questionService.createQuestion(userId, content, imageUrl, subject, grade);
        return ResponseEntity.ok(question);
    }

    // Lấy danh sách câu hỏi (có lọc)
    @GetMapping
    public ResponseEntity<List<Question>> getQuestions(@RequestParam(required = false) String subject,
                                                      @RequestParam(required = false) Integer grade) {
        return ResponseEntity.ok(questionService.getQuestions(subject, grade));
    }

    // Lấy chi tiết câu hỏi
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestion(id));
    }

    // Trả lời câu hỏi
    @PostMapping("/{id}/answers")
    public ResponseEntity<Answer> createAnswer(
        @PathVariable Long id,
        @RequestParam("userId") Long userId,
        @RequestParam("content") String content,
        @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveAnswerImage(imageFile);
        }
        Answer answer = answerService.createAnswer(id, userId, content, imageUrl);
        return ResponseEntity.ok(answer);
    }

    // Lấy danh sách câu trả lời cho câu hỏi
    @GetMapping("/{id}/answers")
    public ResponseEntity<List<Answer>> getAnswers(@PathVariable Long id) {
        return ResponseEntity.ok(answerService.getAnswers(id));
    }

    // Chỉnh sửa câu hỏi
    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        // Kiểm tra trường bắt buộc userId
        if (!req.containsKey("userId") || req.get("userId") == null) {
            return ResponseEntity.badRequest().body(null); // Hoặc trả về một đối tượng lỗi cụ thể hơn
        }
        Long userId = Long.valueOf(req.get("userId").toString());
        // Lấy các trường cần cập nhật (có thể null)
        String content = req.containsKey("content") && req.get("content") != null ? req.get("content").toString() : null;
        String imageUrl = req.containsKey("imageUrl") && req.get("imageUrl") != null ? req.get("imageUrl").toString() : null;
        String subject = req.containsKey("subject") && req.get("subject") != null ? req.get("subject").toString() : null;
        Integer grade = req.containsKey("grade") && req.get("grade") != null ? Integer.valueOf(req.get("grade").toString()) : null;
        Question updatedQuestion = questionService.updateQuestion(id, userId, content, imageUrl, subject, grade);
        return ResponseEntity.ok(updatedQuestion);
    }

    // Xóa câu hỏi
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        // Kiểm tra trường bắt buộc userId
        if (!req.containsKey("userId") || req.get("userId") == null) {
             return ResponseEntity.badRequest().build(); // Hoặc trả về một đối tượng lỗi cụ thể hơn
        }
        Long userId = Long.valueOf(req.get("userId").toString());
        questionService.deleteQuestion(id, userId);
        return ResponseEntity.ok().build();
    }

    // Chỉnh sửa câu trả lời
    @PutMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<Answer> updateAnswer(
        @PathVariable Long questionId,
        @PathVariable Long answerId,
        @RequestParam("userId") Long userId,
        @RequestParam("content") String content,
        @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveAnswerImage(imageFile);
        }
        Answer updatedAnswer = answerService.updateAnswer(answerId, userId, content, imageUrl);
        return ResponseEntity.ok(updatedAnswer);
    }

    // Xóa câu trả lời
    @DeleteMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long questionId, @PathVariable Long answerId, @RequestBody Map<String, Object> req) {
         // Kiểm tra trường bắt buộc userId
        if (!req.containsKey("userId") || req.get("userId") == null) {
             return ResponseEntity.badRequest().build(); // Hoặc trả về một đối tượng lỗi cụ thể hơn
        }
        Long userId = Long.valueOf(req.get("userId").toString());
        answerService.deleteAnswer(answerId, userId);
        return ResponseEntity.ok().build();
    }

    // Upload ảnh tạm cho chỉnh sửa câu hỏi
    @PostMapping("/upload-image")
    public Map<String, String> uploadQuestionImage(@RequestParam("imageFile") MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveAnswerImage(imageFile);
        }
        return Map.of("imageUrl", imageUrl);
    }

    private String saveAnswerImage(MultipartFile file) {
        try {
            String uploadDir = "D:/res/static/answer/";
            System.out.println("[LOG] Bắt đầu lưu file ảnh...");
            System.out.println("[LOG] Đường dẫn thư mục: " + uploadDir);
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            System.out.println("[LOG] Tên file sẽ lưu: " + fileName);
            
            Path uploadPath = Paths.get(uploadDir);
            System.out.println("[LOG] Kiểm tra thư mục tồn tại: " + uploadPath.toAbsolutePath());
            
            if (!Files.exists(uploadPath)) {
                System.out.println("[LOG] Thư mục chưa tồn tại, đang tạo mới...");
                Files.createDirectories(uploadPath);
                System.out.println("[LOG] Đã tạo thư mục thành công: " + uploadPath.toAbsolutePath());
            } else {
                System.out.println("[LOG] Thư mục đã tồn tại");
            }
            
            Path filePath = uploadPath.resolve(fileName);
            System.out.println("[LOG] Đường dẫn file đầy đủ: " + filePath.toAbsolutePath());
            
            file.transferTo(filePath.toFile());
            System.out.println("[LOG] Đã lưu file thành công");
            
            String imageUrl = "/answer/" + fileName;
            System.out.println("[LOG] URL trả về cho frontend: " + imageUrl);
            
            return imageUrl;
        } catch (IOException e) {
            System.out.println("[LOG] Lỗi khi lưu file: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi lưu file ảnh", e);
        }
    }
} 