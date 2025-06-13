package com.d10rt01.hocho.service;

import com.d10rt01.hocho.model.Answer;
import com.d10rt01.hocho.model.Question;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.repository.AnswerRepository;
import com.d10rt01.hocho.repository.QuestionRepository;
import com.d10rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AnswerService {
    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Answer createAnswer(Long questionId, Long userId, String content, String imageUrl) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Answer answer = new Answer();
        answer.setQuestion(question);
        answer.setUser(user);
        answer.setContent(content);
        answer.setImageUrl(imageUrl);
        return answerRepository.save(answer);
    }

    public List<Answer> getAnswers(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        return answerRepository.findByQuestion(question);
    }

    @Transactional
    public Answer updateAnswer(Long answerId, Long userId, String content, String imageUrl) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        // Kiểm tra quyền sở hữu
        if (!answer.getUser().getId().equals(userId)) {
            throw new RuntimeException("User is not authorized to update this answer");
        }
        // Cập nhật chỉ các trường được cung cấp
        if (content != null) {
            answer.setContent(content);
        }
        if (imageUrl != null) {
            answer.setImageUrl(imageUrl);
        }
        return answerRepository.save(answer);
    }

    @Transactional
    public void deleteAnswer(Long answerId, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));
        // Kiểm tra quyền sở hữu
        if (!answer.getUser().getId().equals(userId)) {
            throw new RuntimeException("User is not authorized to delete this answer");
        }
        answerRepository.delete(answer);
    }
} 