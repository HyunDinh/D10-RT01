package d10_rt01.hocho.controller.message;

import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.model.Answer;
import d10_rt01.hocho.model.Question;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.question.AnswerService;
import d10_rt01.hocho.service.question.QuestionService;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    @Autowired
    private QuestionService questionService;
    @Autowired
    private AnswerService answerService;
    @Autowired
    private UserRepository userRepository;

    // Đăng câu hỏi
    @PostMapping
    public ResponseEntity<Question> createQuestion(
            @RequestParam("userId") Long userId,
            @RequestParam("content") String content,
            @RequestParam("subject") String subject,
            @RequestParam("grade") Integer grade,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        // Kiểm tra role của user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getRole().equalsIgnoreCase("CHILD")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null);
        }

        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveQuestionImage(imageFile);
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
            imageUrl = saveQuestionImage(imageFile);
        }
        return Map.of("imageUrl", imageUrl);
    }

    private String saveAnswerImage(MultipartFile file) {
        try {
            String uploadDir = HochoConfig.ABSOLUTE_PATH_ANSWER_UPLOAD_DIR;
            System.out.println("[LOG] Bắt đầu lưu file ảnh câu trả lời...");
            
            // Xử lý và nén ảnh
            byte[] processedFileBytes = processImageFile(file);
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, processedFileBytes);
            
            String imageUrl = "/answer/" + fileName;
            System.out.println("[LOG] Đã lưu file câu trả lời thành công: " + imageUrl);
            
            return imageUrl;
        } catch (IOException e) {
            System.out.println("[LOG] Lỗi khi lưu file câu trả lời: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi lưu file ảnh câu trả lời", e);
        }
    }

    private String saveQuestionImage(MultipartFile file) {
        try {
            String uploadDir = HochoConfig.ABSOLUTE_PATH_QUESTION_UPLOAD_DIR;
            System.out.println("[LOG] Bắt đầu lưu file ảnh câu hỏi...");
            
            // Xử lý và nén ảnh
            byte[] processedFileBytes = processImageFile(file);
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, processedFileBytes);
            
            String imageUrl = "/question/" + fileName;
            System.out.println("[LOG] Đã lưu file câu hỏi thành công: " + imageUrl);
            
            return imageUrl;
        } catch (IOException e) {
            System.out.println("[LOG] Lỗi khi lưu file câu hỏi: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi lưu file ảnh câu hỏi", e);
        }
    }

    private byte[] processImageFile(MultipartFile file) throws IOException {
        byte[] fileBytes = file.getBytes();
        long fileSize = fileBytes.length;

        // Kiểm tra loại file
        String contentType = file.getContentType();
        if (!"image/png".equals(contentType) && !"image/jpeg".equals(contentType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận file PNG hoặc JPG");
        }

        // Nếu file nhỏ hơn giới hạn, không cần scale
        if (fileSize <= HochoConfig.MAX_QUESTION_ANSWER_IMAGE_SIZE) {
            return fileBytes;
        }

        // Scale file để giảm kích thước
        double quality = 0.8; // Chất lượng ban đầu (0.0 - 1.0)
        double scale = 1.0;   // Tỷ lệ resize ban đầu
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while (fileSize > HochoConfig.MAX_QUESTION_ANSWER_IMAGE_SIZE && quality > 0.1 && scale > 0.1) {
            outputStream.reset(); // Reset stream để ghi lại từ đầu
            Thumbnails.of(new ByteArrayInputStream(fileBytes))
                    .scale(scale) // Resize kích thước ảnh
                    .outputQuality(quality) // Giảm chất lượng ảnh
                    .toOutputStream(outputStream);

            fileBytes = outputStream.toByteArray();
            fileSize = fileBytes.length;

            // Giảm scale hoặc quality nếu vẫn vượt giới hạn
            if (fileSize > HochoConfig.MAX_QUESTION_ANSWER_IMAGE_SIZE) {
                if (scale > 0.1) {
                    scale -= 0.1; // Giảm kích thước ảnh 10%
                } else {
                    quality -= 0.1; // Giảm chất lượng 10%
                    scale = 1.0; // Reset scale nếu đã giảm quality
                }
            }
        }

        // Nếu vẫn không đạt yêu cầu sau khi scale tối đa, throw exception
        if (fileSize > HochoConfig.MAX_QUESTION_ANSWER_IMAGE_SIZE) {
            throw new IllegalArgumentException("Không thể giảm kích thước file xuống dưới 10MB. Vui lòng chọn file nhỏ hơn.");
        }

        return fileBytes;
    }
} 