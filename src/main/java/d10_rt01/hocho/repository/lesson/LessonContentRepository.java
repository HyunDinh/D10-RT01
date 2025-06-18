package d10_rt01.hocho.repository.lesson;

import d10_rt01.hocho.model.LessonContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonContentRepository extends JpaRepository<LessonContent, Long> {
    List<LessonContent> findByLessonLessonId(Long lessonId);
}