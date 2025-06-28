package d10_rt01.hocho.service;

import d10_rt01.hocho.dto.LearningProgressDto;
import d10_rt01.hocho.dto.CourseProgressDto;

public interface LearningProgressService {
    LearningProgressDto getChildLearningProgress(Long childId);
    CourseProgressDto getCourseProgress(Long childId, Long courseId);
    double calculateOverallProgress(Long childId);
    double calculateCourseProgress(Long childId, Long courseId);
    
    // Thêm method mới để lưu tiến độ hoàn thành bài học
    void markLessonAsCompleted(Long childId, Long lessonId);
} 