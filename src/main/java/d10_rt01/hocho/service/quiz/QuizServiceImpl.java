package d10_rt01.hocho.service.quiz;

import d10_rt01.hocho.dto.quiz.QuizAnswerDto;
import d10_rt01.hocho.model.*;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.repository.quiz.*;
import d10_rt01.hocho.service.NotificationIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import d10_rt01.hocho.model.QuizResult;
import d10_rt01.hocho.service.monitoring.TimeRestrictionService;
import d10_rt01.hocho.repository.TimeRestrictionRepository;
import d10_rt01.hocho.service.NotificationService;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuizServiceImpl implements QuizService {
    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private QuizAnswerRepository quizAnswerRepository;

    @Autowired
    private QuizOptionRepository quizOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationIntegrationService notificationIntegrationService;

    @Autowired
    private d10_rt01.hocho.service.monitoring.TimeRestrictionService timeRestrictionService;
    @Autowired
    private d10_rt01.hocho.repository.TimeRestrictionRepository timeRestrictionRepository;

    @Autowired
    private d10_rt01.hocho.service.NotificationService notificationService;

    @Override
    @Transactional
    public Quiz createQuiz(Quiz quiz) {
        validateQuiz(quiz);

        // 1. Tách các câu hỏi từ Quiz để ngăn chặn cascade sớm.
        List<QuizQuestion> questionsToProcess = new ArrayList<>();
        if (quiz.getQuestions() != null) {
            questionsToProcess.addAll(quiz.getQuestions());
            quiz.getQuestions().clear(); // Xóa các câu hỏi khỏi đối tượng Quiz
        }
        
        // 2. Lưu Quiz để nó có ID.
        Quiz savedQuiz = quizRepository.save(quiz);

        // 3. Xử lý và lưu từng QuizQuestion và các tùy chọn của nó.
        if (!questionsToProcess.isEmpty()) {
            for (QuizQuestion question : questionsToProcess) {
                // Đặt Quiz cha cho mỗi câu hỏi bằng đối tượng Quiz ĐÃ LƯU
                question.setQuiz(savedQuiz);
                
                // Tách các tùy chọn từ câu hỏi
                List<QuizOption> optionsToProcess = new ArrayList<>();
                if (question.getOptions() != null) {
                    optionsToProcess.addAll(question.getOptions());
                    question.getOptions().clear(); // Xóa các tùy chọn khỏi câu hỏi
                }
                
                // Lưu câu hỏi trước
                QuizQuestion savedQuestion = quizQuestionRepository.save(question);
                
                // Xử lý và lưu từng tùy chọn
                if (!optionsToProcess.isEmpty()) {
                    for (QuizOption option : optionsToProcess) {
                        option.setQuestion(savedQuestion);
                        QuizOption savedOption = quizOptionRepository.save(option);
                        savedQuestion.getOptions().add(savedOption);
                    }
                }
                
                // Cập nhật câu hỏi với các tùy chọn đã lưu
                savedQuestion = quizQuestionRepository.save(savedQuestion);
                savedQuiz.getQuestions().add(savedQuestion);
            }
        }

        // 4. Lưu Quiz một lần nữa để cập nhật tập hợp các câu hỏi đã được quản lý.
        return quizRepository.save(savedQuiz);
    }

    @Override
    @Transactional
    public Quiz updateQuiz(Long quizId, Quiz quiz) {
        validateQuiz(quiz);
        Quiz existingQuiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Quiz với ID: " + quizId));
        
        existingQuiz.setTitle(quiz.getTitle());
        existingQuiz.setDescription(quiz.getDescription());
        existingQuiz.setTimeLimit(quiz.getTimeLimit());
        existingQuiz.setTotalPoints(quiz.getTotalPoints());
        existingQuiz.setCourse(quiz.getCourse());

        // Xử lý các câu hỏi: Xác định câu hỏi cần giữ, cập nhật hoặc xóa.
        List<QuizQuestion> questionsToProcess = new ArrayList<>();
        if (quiz.getQuestions() != null) {
            questionsToProcess.addAll(quiz.getQuestions());
        }

        // Xóa các câu hỏi cũ không còn trong danh sách mới
        existingQuiz.getQuestions().removeIf(existingQuestion -> 
            questionsToProcess.stream().noneMatch(newQuestion -> 
                newQuestion.getQuestionId() != null && newQuestion.getQuestionId().equals(existingQuestion.getQuestionId())
            )
        );

        // Cập nhật hoặc thêm mới các câu hỏi
        for (QuizQuestion newQuestionData : questionsToProcess) {
            if (newQuestionData.getQuestionId() != null) {
                // Tìm và cập nhật câu hỏi hiện có
                existingQuiz.getQuestions().stream()
                    .filter(eq -> eq.getQuestionId().equals(newQuestionData.getQuestionId()))
                    .findFirst()
                    .ifPresent(eq -> {
                        eq.setQuestionText(newQuestionData.getQuestionText());
                        eq.setQuestionImageUrl(newQuestionData.getQuestionImageUrl());
                        eq.setPoints(newQuestionData.getPoints());
                        eq.setCorrectOptionId(newQuestionData.getCorrectOptionId());

                        // Xử lý các tùy chọn cho câu hỏi hiện có
                        List<QuizOption> optionsToProcess = new ArrayList<>();
                        if (newQuestionData.getOptions() != null) {
                            optionsToProcess.addAll(newQuestionData.getOptions());
                        }

                        eq.getOptions().removeIf(existingOption -> 
                            optionsToProcess.stream().noneMatch(newOption -> 
                                newOption.getOptionId() != null && newOption.getOptionId().equals(existingOption.getOptionId())
                            )
                        );

                        for (QuizOption newOptionDataInner : optionsToProcess) {
                            if (newOptionDataInner.getOptionId() != null) {
                                eq.getOptions().stream()
                                    .filter(eo -> eo.getOptionId().equals(newOptionDataInner.getOptionId()))
                                    .findFirst()
                                    .ifPresent(eo -> {
                                        eo.setOptionText(newOptionDataInner.getOptionText());
                                        eo.setOptionKey(newOptionDataInner.getOptionKey());
                                    });
                            } else {
                                // Tùy chọn mới cho câu hỏi hiện có
                                newOptionDataInner.setQuestion(eq); 
                                eq.getOptions().add(newOptionDataInner);
                            }
                        }
                    });
            } else {
                // Câu hỏi mới
                existingQuiz.addQuestion(newQuestionData); 
                if (newQuestionData.getOptions() != null) {
                    newQuestionData.getOptions().forEach(option -> option.setQuestion(newQuestionData));
                }
            }
        }

        return quizRepository.save(existingQuiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Quiz với ID: " + quizId));

        // 1. Xóa tất cả quiz_answers liên quan
        List<QuizResult> results = quizResultRepository.findByQuiz(quiz);
        for (QuizResult result : results) {
            quizAnswerRepository.deleteAll(result.getAnswers());
        }

        // 2. Xóa tất cả quiz_results
        quizResultRepository.deleteAll(results);

        // 3. Xóa tất cả quiz_questions và quiz_options
        for (QuizQuestion question : quiz.getQuestions()) {
            quizOptionRepository.deleteAll(question.getOptions());
        }
        quizQuestionRepository.deleteAll(quiz.getQuestions());

        // 4. Cuối cùng mới xóa quiz
        quizRepository.delete(quiz);
    }

    @Override
    public Quiz getQuiz(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Quiz"));
    }

    @Override
    @Transactional
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @Override
    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findQuizzesByCourseId(courseId);
    }

    @Override
    @Transactional
    public QuizQuestion addQuestion(Long quizId, QuizQuestion question) {
        validateQuestion(question);
        Quiz quiz = getQuiz(quizId);
        question.setQuiz(quiz); 
        if (question.getOptions() != null && !question.getOptions().isEmpty()) {
            question.getOptions().forEach(option -> option.setQuestion(question));
        }
        quiz.addQuestion(question);
        quizRepository.save(quiz); 
        return question; 
    }

    @Override
    @Transactional
    public QuizQuestion updateQuestion(Long questionId, QuizQuestion question) {
        validateQuestion(question);
        QuizQuestion existingQuestion = quizQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi với ID: " + questionId));
        
        existingQuestion.setQuestionText(question.getQuestionText());
        existingQuestion.setQuestionImageUrl(question.getQuestionImageUrl());
        existingQuestion.setPoints(question.getPoints());
        existingQuestion.setCorrectOptionId(question.getCorrectOptionId());

        List<QuizOption> optionsToProcess = new ArrayList<>();
        if (question.getOptions() != null) {
            optionsToProcess.addAll(question.getOptions());
        }

        // Xóa các tùy chọn cũ không còn trong danh sách mới
        existingQuestion.getOptions().removeIf(existingOption -> 
            optionsToProcess.stream().noneMatch(newOption -> 
                newOption.getOptionId() != null && newOption.getOptionId().equals(existingOption.getOptionId())
            )
        );

        // Cập nhật hoặc thêm mới các tùy chọn
        for (QuizOption newOptionData : optionsToProcess) {
            if (newOptionData.getOptionId() != null) {
                existingQuestion.getOptions().stream()
                    .filter(eo -> eo.getOptionId().equals(newOptionData.getOptionId()))
                    .findFirst()
                    .ifPresent(eo -> {
                        eo.setOptionText(newOptionData.getOptionText());
                        eo.setOptionKey(newOptionData.getOptionKey());
                    });
            } else {
                newOptionData.setQuestion(existingQuestion);
                existingQuestion.getOptions().add(newOptionData);
            }
        }

        return quizQuestionRepository.save(existingQuestion);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        quizQuestionRepository.deleteById(questionId);
    }

    @Override
    @Transactional
    public QuizResult submitQuiz(Long quizId, Long childId, List<QuizAnswerDto> answers) {
        // ----------- Thưởng video nếu chưa quá 3 lần/ngày -----------
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDateTime startOfDay = today.atStartOfDay();
        java.time.LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
        var quizResults = quizResultRepository.findByChild(userRepository.findById(childId).orElseThrow());
        System.out.println("--- LOG QUIZ SUBMIT ---");
        System.out.println("startOfDay: " + startOfDay + ", endOfDay: " + endOfDay);
        for (var qr : quizResults) {
            System.out.println("QuizResult submittedAt: " + qr.getSubmittedAt());
        }
        int quizCountToday = (int) quizResults.stream()
            .filter(qr -> qr.getSubmittedAt() != null &&
                !qr.getSubmittedAt().isBefore(startOfDay) &&
                qr.getSubmittedAt().isBefore(endOfDay))
            .count();
        boolean shouldReward = quizCountToday < 3;
        System.out.println("Quiz count today for child " + childId + ": " + quizCountToday);
        System.out.println("Should reward: " + shouldReward);
        // -----------------------------------------------------------

        Quiz quiz = getQuiz(quizId);
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));

        // Luôn tạo mới QuizResult mỗi lần nộp quiz
        QuizResult quizResult = new QuizResult();
        quizResult.setQuiz(quiz);
        quizResult.setChild(child);
        quizResult.setScore(0);
        quizResult.setSubmittedAt(java.time.LocalDateTime.now());
        quizResult.setAnswers(new ArrayList<>());

        int totalScore = 0;
        List<QuizAnswer> quizAnswers = new ArrayList<>();
        for (QuizAnswerDto answerDto : answers) {
            Long questionId = answerDto.getQuestionId();
            String selectedOptionKey = answerDto.getSelectedOptionId();
            QuizQuestion question = quizQuestionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy câu hỏi"));
            boolean isCorrect = selectedOptionKey.equals(question.getCorrectOptionId());
            if (isCorrect) {
                totalScore += question.getPoints();
            }
            QuizAnswer quizAnswer = new QuizAnswer();
            quizAnswer.setQuestion(question);
            quizAnswer.setSelectedOptionId(selectedOptionKey);
            quizAnswer.setIsCorrect(isCorrect);
            quizAnswer.setResult(quizResult);
            quizAnswers.add(quizAnswer);
        }
        quizResult.setScore(totalScore);
        quizAnswers.forEach(quizResult.getAnswers()::add);
        QuizResult savedResult = quizResultRepository.save(quizResult);
        notificationIntegrationService.createQuizCompletionNotifications(childId, quiz.getTitle());
        if (shouldReward) {
            Integer rewardSeconds = 600;
            var restrictionOpt = timeRestrictionRepository.findByChild_Id(childId);
            if (restrictionOpt.isPresent() && restrictionOpt.get().getRewardPerQuiz() != null) {
                rewardSeconds = restrictionOpt.get().getRewardPerQuiz();
            }
            timeRestrictionService.addVideoTimeReward(childId, rewardSeconds);
            // Gửi notification cho trẻ em
            String content = "You have just been added " + (rewardSeconds / 60) + " minutes watching video after completing quiz: " + quiz.getTitle();
            notificationService.createVideoTimeRewardQuizNotification(childId, content);
        }
        return savedResult;
    }

    @Override
    public List<QuizResult> getQuizResults(Long quizId) {
        Quiz quiz = getQuiz(quizId);
        return quizResultRepository.findByQuiz(quiz);
    }

    @Override
    public List<QuizResult> getChildResults(Long childId) {
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));
        return quizResultRepository.findByChild(child);
    }

    @Override
    public QuizResult getChildQuizResult(Long quizId, Long childId) {
        Quiz quiz = getQuiz(quizId);
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));
        List<QuizResult> results = quizResultRepository.findByQuizAndChild(quiz, child);
        return results.stream()
            .max(java.util.Comparator.comparing(QuizResult::getSubmittedAt))
            .orElse(null);
    }

    private void validateQuiz(Quiz quiz) {
        if (quiz.getTitle() == null || quiz.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Tiêu đề Quiz là bắt buộc");
        }
        if (quiz.getTimeLimit() == null || quiz.getTimeLimit() <= 0) {
            throw new RuntimeException("Thời gian giới hạn phải lớn hơn 0");
        }
        if (quiz.getTotalPoints() == null || quiz.getTotalPoints() <= 0) {
            throw new RuntimeException("Tổng điểm phải lớn hơn 0");
        }
        if (quiz.getCourse() == null) {
            throw new RuntimeException("Khóa học là bắt buộc");
        }
    }

    private void validateQuestion(QuizQuestion question) {
        if (question.getQuestionText() == null || question.getQuestionText().trim().isEmpty()) {
            throw new RuntimeException("Nội dung câu hỏi là bắt buộc");
        }
        if (question.getPoints() == null || question.getPoints() <= 0) {
            throw new RuntimeException("Điểm phải lớn hơn 0");
        }
        if (question.getOptions() == null || question.getOptions().isEmpty()) {
            throw new RuntimeException("Phải có ít nhất một tùy chọn");
        }
        if (question.getCorrectOptionId() == null || question.getCorrectOptionId().trim().isEmpty()) {
            throw new RuntimeException("Tùy chọn đúng là bắt buộc");
        }
    }
} 