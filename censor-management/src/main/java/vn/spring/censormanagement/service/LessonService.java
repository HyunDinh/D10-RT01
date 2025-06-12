package vn.spring.censormanagement.service;

import vn.spring.censormanagement.entity.Lesson;

import java.util.List;

public interface LessonService {
    List<Lesson> getLessonByCourseId(Long courseId);
}
