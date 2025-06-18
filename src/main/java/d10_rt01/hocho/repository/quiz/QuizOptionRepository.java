package d10_rt01.hocho.repository.quiz;

import d10_rt01.hocho.model.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {
} 