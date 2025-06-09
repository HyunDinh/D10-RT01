package com.d10rt01.hocho.service.lesson;

import com.d10rt01.hocho.model.Lesson;
import com.d10rt01.hocho.model.LessonContent;
import com.d10rt01.hocho.repository.LessonContentRepository;
import com.d10rt01.hocho.repository.LessonRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonContentService {
    @Autowired
    private LessonContentRepository lessonContentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    public List<LessonContent> getLessonContentsByLessonId(Long lessonId) {
        return lessonContentRepository.findByLessonLessonId(lessonId);
    }

    @Transactional
    public LessonContent addContent(Long lessonId, LessonContent content) {
        if (content == null || lessonId == null || lessonId <= 0) {
            throw new IllegalArgumentException("Content and lesson ID must not be null");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found with ID: " + lessonId));

        content.setLesson(lesson);
        return lessonContentRepository.save(content);
    }

    @Transactional
    public LessonContent updateContent(Long contentId, LessonContent content) {
        if (content == null || contentId == null || contentId <= 0) {
            throw new IllegalArgumentException("Content and content ID must not be null");
        }

        LessonContent existingContent = lessonContentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found with ID: " + contentId));

        existingContent.setContentType(content.getContentType());
        existingContent.setContentUrl(content.getContentUrl());

        return lessonContentRepository.save(existingContent);
    }

    public void deleteContent(Long contentId) {
        lessonContentRepository.deleteById(contentId);
    }
}