package com.d10rt01.hocho.service.lesson;

import com.d10rt01.hocho.model.LessonContent;
import com.d10rt01.hocho.model.ContentType;
import com.d10rt01.hocho.repository.LessonContentRepository;
import com.d10rt01.hocho.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class LessonContentService {

    @Autowired
    private LessonContentRepository lessonContentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Transactional
    public LessonContent addContent(Long lessonId, MultipartFile file, String title) throws IOException {
        LessonContent content = new LessonContent();
        content.setLesson(lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found")));
        content.setTitle(title);
        
        // Xác định ContentType dựa vào MIME type của file
        String mimeType = file.getContentType();
        if (mimeType.startsWith("video/")) {
            content.setContentType(ContentType.VIDEO);
        } else if (mimeType.equals("application/pdf")) {
            content.setContentType(ContentType.PDF);
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + mimeType);
        }
        
        content.setContentData(file.getBytes());
        return lessonContentRepository.save(content);
    }

    public List<LessonContent> getLessonContentsByLessonId(Long lessonId) {
        return lessonContentRepository.findByLessonLessonId(lessonId);
    }

    @Transactional
    public LessonContent updateContent(Long contentId, MultipartFile file, String title) throws IOException {
        LessonContent content = lessonContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        content.setTitle(title);
        if (file != null) {
            // Xác định ContentType dựa vào MIME type của file
            String mimeType = file.getContentType();
            if (mimeType.startsWith("video/")) {
                content.setContentType(ContentType.VIDEO);
            } else if (mimeType.equals("application/pdf")) {
                content.setContentType(ContentType.PDF);
            } else {
                throw new IllegalArgumentException("Unsupported file type: " + mimeType);
            }
            content.setContentData(file.getBytes());
        }
        return lessonContentRepository.save(content);
    }

    @Transactional
    public void deleteContent(Long contentId) {
        lessonContentRepository.deleteById(contentId);
    }

    public LessonContent getContentById(Long contentId) {
        return lessonContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
    }
}