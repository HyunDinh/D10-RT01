package vn.spring.censormanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.spring.censormanagement.entity.Lesson;
import vn.spring.censormanagement.repository.LessonRepository;

import java.util.List;

@Service
public class LessonServicelmpl implements LessonService {

    private final LessonRepository lessonRepository;

    @Autowired
    public LessonServicelmpl(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @Override
    public List<Lesson> getLessonByCourseId(Long courseId) {
        return lessonRepository.findByCourseId(courseId);
    }
}
