package d10_rt01.hocho.controller.quiz;


import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.controller.auth.AuthController;
import d10_rt01.hocho.dto.quiz.QuizAnswerDto;
import d10_rt01.hocho.dto.quiz.QuizSubmissionDto;
import d10_rt01.hocho.model.Quiz;
import d10_rt01.hocho.model.QuizQuestion;
import d10_rt01.hocho.model.QuizResult;
import d10_rt01.hocho.service.quiz.QuizService;
import d10_rt01.hocho.utils.CustomLogger;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
@RequestMapping("/api/quizzes")
@Transactional
public class QuizController {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(QuizController.class), DebugModeConfig.CONTROLLER_LAYER);

    @Autowired
    private QuizService quizService;

    // Tạo quiz mới
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizService.createQuiz(quiz));
    }

    // Lấy danh sách quiz
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    // Lấy danh sách quiz theo khóa học
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    // Lấy chi tiết quiz
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuiz(id));
    }

    // Cập nhật quiz
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizService.updateQuiz(id, quiz));
    }

    // Xóa quiz
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok().build();
    }

    // Thêm câu hỏi vào quiz
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<QuizQuestion> addQuestion(
        @PathVariable Long quizId,
        @RequestBody QuizQuestion question
    ) {
        return ResponseEntity.ok(quizService.addQuestion(quizId, question));
    }

    // Cập nhật câu hỏi
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuizQuestion> updateQuestion(
        @PathVariable Long questionId,
        @RequestBody QuizQuestion question
    ) {
        return ResponseEntity.ok(quizService.updateQuestion(questionId, question));
    }

    // Xóa câu hỏi
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        quizService.deleteQuestion(questionId);
        return ResponseEntity.ok().build();
    }

    // Nộp bài quiz
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizResult> submitQuiz(
        @PathVariable Long quizId,
        @RequestBody QuizSubmissionDto submissionDto
    ) {
        Long childId = submissionDto.getChildId();
        List<QuizAnswerDto> answers = submissionDto.getAnswers();
        return ResponseEntity.ok(quizService.submitQuiz(quizId, childId, answers));
    }

    // Lấy kết quả của một quiz
    @GetMapping("/{quizId}/results")
    public ResponseEntity<List<QuizResult>> getQuizResults(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizResults(quizId));
    }

    // Lấy kết quả của một học sinh
    @GetMapping("/child/{childId}/results")
    public ResponseEntity<List<QuizResult>> getChildResults(@PathVariable Long childId) {
        return ResponseEntity.ok(quizService.getChildResults(childId));
    }

    // Lấy kết quả của một học sinh cho một quiz cụ thể
    @GetMapping("/{quizId}/child/{childId}/result")
    public ResponseEntity<QuizResult> getChildQuizResult(
        @PathVariable Long quizId,
        @PathVariable Long childId
    ) {
        return ResponseEntity.ok(quizService.getChildQuizResult(quizId, childId));
    }

    // Upload ảnh cho câu hỏi quiz
    @PostMapping("/upload-image")
    public Map<String, String> uploadQuizImage(@RequestParam("imageFile") MultipartFile imageFile) {
        String imageUrl = null;
        logger.info(imageFile.getOriginalFilename() + " - " + imageFile.getContentType() + " - " + imageFile.getSize() + " bytes");
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveQuizImage(imageFile);
        }
        return Map.of("imageUrl", imageUrl);
    }

    private String saveQuizImage(MultipartFile file) {
        try {
            String uploadDir = HochoConfig.ABSOLUTE_PATH_QUIZ_UPLOAD_DIR;
            System.out.println("[LOG] Bắt đầu lưu file ảnh quiz...");
            
            // Xử lý và nén ảnh
            byte[] processedFileBytes = processImageFile(file);
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, processedFileBytes);
            
            String imageUrl = "/quiz/" + fileName;
            System.out.println("[LOG] Đã lưu file quiz thành công: " + imageUrl);
            
            return imageUrl;
        } catch (IOException e) {
            System.out.println("[LOG] Lỗi khi lưu file quiz: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi lưu file ảnh quiz", e);
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
        if (fileSize <= HochoConfig.MAX_QUIZ_IMAGE_SIZE) {
            return fileBytes;
        }

        // Scale file để giảm kích thước
        double quality = 0.8;
        double scale = 1.0;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while (fileSize > HochoConfig.MAX_QUIZ_IMAGE_SIZE && quality > 0.1 && scale > 0.1) {
            outputStream.reset();
            Thumbnails.of(new ByteArrayInputStream(fileBytes))
                    .scale(scale)
                    .outputQuality(quality)
                    .toOutputStream(outputStream);

            fileBytes = outputStream.toByteArray();
            fileSize = fileBytes.length;

            if (fileSize > HochoConfig.MAX_QUIZ_IMAGE_SIZE) {
                if (scale > 0.1) {
                    scale -= 0.1;
                } else {
                    quality -= 0.1;
                    scale = 1.0;
                }
            }
        }

        return fileBytes;
    }
}