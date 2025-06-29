package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.LearningHistory;
import d10_rt01.hocho.model.Lesson;
import d10_rt01.hocho.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningHistoryRepository extends JpaRepository<LearningHistory, Long> {
    List<LearningHistory> findByChild_IdAndLesson_LessonId(Long childId, Long lessonId);
    List<LearningHistory> findByChildId(Long childId);
    List<LearningHistory> findByChildAndLesson(User child, Lesson lesson);
} 