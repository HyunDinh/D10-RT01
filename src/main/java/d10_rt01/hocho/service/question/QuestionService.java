package d10_rt01.hocho.service.question;

import d10_rt01.hocho.model.Question;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.AnswerRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.repository.question.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Transactional
    public Question createQuestion(Long userId, String content, String imageUrl, String subject, Integer grade) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Question question = new Question();
        question.setUser(user);
        question.setContent(content);
        question.setImageUrl(imageUrl);
        question.setSubject(subject);
        question.setGrade(grade);
        return questionRepository.save(question);
    }

    public List<Question> getQuestions(String subject, Integer grade) {
        if (subject != null && grade != null) {
            return questionRepository.findBySubjectAndGrade(subject, grade);
        } else {
            return questionRepository.findAll();
        }
    }

    public Question getQuestion(Long questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    @Transactional
    public Question updateQuestion(Long questionId, Long userId, String content, String imageUrl, String subject, Integer grade) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        // Kiểm tra quyền sở hữu
        if (!question.getUser().getId().equals(userId)) {
            throw new RuntimeException("User is not authorized to update this question");
        }
        // Cập nhật chỉ các trường được cung cấp
        if (content != null) {
            question.setContent(content);
        }
        if (imageUrl != null) {
            question.setImageUrl(imageUrl);
        }
        if (subject != null) {
            question.setSubject(subject);
        }
        if (grade != null) {
            question.setGrade(grade);
        }
        return questionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        // Kiểm tra quyền sở hữu
        if (!question.getUser().getId().equals(userId)) {
            throw new RuntimeException("User is not authorized to delete this question");
        }
        
        // Xóa tất cả câu trả lời liên quan trước
        answerRepository.deleteByQuestion(question);
        
        // Sau đó mới xóa câu hỏi
        questionRepository.delete(question);
    }
} 