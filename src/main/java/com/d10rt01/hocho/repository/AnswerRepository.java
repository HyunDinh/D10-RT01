package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.Answer;
import com.d10rt01.hocho.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByQuestion(Question question);
}