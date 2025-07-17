package d10_rt01.hocho.repository.quiz;

import d10_rt01.hocho.model.Quiz;
import d10_rt01.hocho.model.QuizResult;
import d10_rt01.hocho.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByQuiz(Quiz quiz);
    List<QuizResult> findByChild(User child);
    List<QuizResult> findByQuizAndChild(Quiz quiz, User child);
}