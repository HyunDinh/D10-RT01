package d10_rt01.hocho.repository;


import d10_rt01.hocho.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findBySubjectAndGrade(String subject, Integer grade);
} 