package d10_rt01.hocho.service.quiz;


import d10_rt01.hocho.dto.quiz.QuizAnswerDto;
import d10_rt01.hocho.model.Quiz;
import d10_rt01.hocho.model.QuizQuestion;
import d10_rt01.hocho.model.QuizResult;

import java.util.List;

public interface QuizService {
    Quiz createQuiz(Quiz quiz);
    Quiz updateQuiz(Long quizId, Quiz quiz);
    void deleteQuiz(Long quizId);
    Quiz getQuiz(Long quizId);
    List<Quiz> getAllQuizzes();
    List<Quiz> getQuizzesByCourse(Long courseId);
    QuizQuestion addQuestion(Long quizId, QuizQuestion question);
    QuizQuestion updateQuestion(Long questionId, QuizQuestion question);
    void deleteQuestion(Long questionId);
    QuizResult submitQuiz(Long quizId, Long childId, List<QuizAnswerDto> answers);
    List<QuizResult> getQuizResults(Long quizId);
    List<QuizResult> getChildResults(Long childId);
    QuizResult getChildQuizResult(Long quizId, Long childId);
} 