package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.Answer;
import com.d10rt01.hocho.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByQuestion(Question question);
    
    @Modifying
    @Query("DELETE FROM Answer a WHERE a.question = ?1")
    void deleteByQuestion(Question question);
}