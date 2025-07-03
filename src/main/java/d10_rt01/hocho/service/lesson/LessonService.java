package d10_rt01.hocho.service.lesson;

import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.model.Lesson;
import d10_rt01.hocho.repository.CourseRepository;
import d10_rt01.hocho.repository.lesson.LessonRepository;
import d10_rt01.hocho.repository.lesson.LessonContentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonService {
    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonContentRepository lessonContentRepository;

    public List<Lesson> getLessonsByCourseId(Long courseId) {
        return lessonRepository.findLessonByCourseCourseId(courseId);
    }

    public Lesson getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));
    }

    @Transactional
    public Lesson addLessonByCourseId(Long courseId, Lesson lesson) {
        if (lesson == null || courseId == null || courseId <= 0) {
            throw new IllegalArgumentException("Lesson and course ID must not be null");
        }
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));

        lesson.setCourse(course);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson editLesson(Long lessonId, Lesson lesson) {
        if (lesson == null || lessonId == null || lessonId <= 0) {
            throw new IllegalArgumentException("Lesson and lesson ID must not be null");
        }
        Lesson existingLesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));

        existingLesson.setTitle(lesson.getTitle());
        existingLesson.setDuration(lesson.getDuration());

        return lessonRepository.save(existingLesson);
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        lessonContentRepository.deleteByLessonLessonId(lessonId);
        lessonRepository.deleteById(lessonId);
    }
}