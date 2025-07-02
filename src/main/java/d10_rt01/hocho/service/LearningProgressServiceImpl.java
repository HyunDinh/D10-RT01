package d10_rt01.hocho.service;

import d10_rt01.hocho.dto.*;
import d10_rt01.hocho.model.*;
import d10_rt01.hocho.repository.*;
import d10_rt01.hocho.repository.lesson.LessonRepository;
import d10_rt01.hocho.repository.quiz.QuizResultRepository;
import d10_rt01.hocho.service.NotificationIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import d10_rt01.hocho.model.enums.ActivityType;

@Service
public class LearningProgressServiceImpl implements LearningProgressService {

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private QuizResultRepository quizResultRepository;
    
    @Autowired
    private LearningHistoryRepository learningHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationIntegrationService notificationIntegrationService;

    @Override
    public LearningProgressDto getChildLearningProgress(Long childId) {
        LearningProgressDto progressDto = new LearningProgressDto();
        progressDto.setChildId(childId);
        
        // Lấy thông tin child
        User child = userRepository.findById(childId)
            .orElseThrow(() -> new RuntimeException("Child not found"));
        progressDto.setChildName(child.getFullName());
        
        // Lấy tất cả khóa học đã đăng ký
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByChildId(childId);
        progressDto.setTotalCourses(enrollments.size());
        
        // Tính toán progress cho từng khóa học
        List<CourseProgressDto> courseProgresses = enrollments.stream()
            .map(enrollment -> getCourseProgress(childId, enrollment.getCourse().getCourseId()))
            .collect(Collectors.toList());
        
        progressDto.setCourses(courseProgresses);
        
        // Tính tổng quan
        double overallProgress = calculateOverallProgress(childId);
        progressDto.setOverallProgress(overallProgress);
        
        int completedCourses = (int) courseProgresses.stream()
            .filter(course -> course.getProgressPercentage() >= 100.0)
            .count();
        progressDto.setCompletedCourses(completedCourses);
        
        // Tính điểm trung bình
        double averageScore = courseProgresses.stream()
            .mapToDouble(CourseProgressDto::getAverageQuizScore)
            .average()
            .orElse(0.0);
        progressDto.setAverageScore(averageScore);
        
        // Tính tổng thời gian học
        int totalStudyTime = courseProgresses.stream()
            .mapToInt(CourseProgressDto::getTotalStudyTime)
            .sum();
        progressDto.setTotalStudyTime(totalStudyTime);
        
        return progressDto;
    }

    @Override
    public CourseProgressDto getCourseProgress(Long childId, Long courseId) {
        CourseProgressDto courseProgress = new CourseProgressDto();
        courseProgress.setCourseId(courseId);
        
        // Lấy thông tin khóa học
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByChildId(childId);
        CourseEnrollment enrollment = enrollments.stream()
            .filter(e -> e.getCourse().getCourseId().equals(courseId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Course enrollment not found"));
        
        Course course = enrollment.getCourse();
        courseProgress.setCourseTitle(course.getTitle());
        courseProgress.setCourseImageUrl(course.getCourseImageUrl());
        
        // Lấy tất cả bài học của khóa học
        List<Lesson> lessons = lessonRepository.findLessonByCourseCourseId(courseId);
        courseProgress.setTotalLessons(lessons.size());
        
        // Tính progress cho từng bài học
        List<LessonProgressDto> lessonProgresses = lessons.stream()
            .map(lesson -> calculateLessonProgress(childId, lesson))
            .collect(Collectors.toList());
        
        courseProgress.setLessonProgresses(lessonProgresses);
        
        // Tính số bài học đã hoàn thành
        int completedLessons = (int) lessonProgresses.stream()
            .filter(lesson -> "COMPLETED".equals(lesson.getStatus()))
            .count();
        courseProgress.setCompletedLessons(completedLessons);
        
        // Tính phần trăm hoàn thành
        double progressPercentage = lessons.isEmpty() ? 0.0 : 
            (double) completedLessons / lessons.size() * 100.0;
        courseProgress.setProgressPercentage(progressPercentage);
        
        // Lấy kết quả quiz
        User child = userRepository.findById(childId)
            .orElseThrow(() -> new RuntimeException("Child not found"));
        List<QuizResult> quizResults = quizResultRepository.findByChild(child);
        List<QuizResultDto> quizResultDtos = quizResults.stream()
            .filter(result -> result.getQuiz().getCourse().getCourseId().equals(courseId))
            .map(this::convertToQuizResultDto)
            .collect(Collectors.toList());
        
        courseProgress.setQuizResults(quizResultDtos);
        
        // Tính điểm trung bình quiz
        double averageQuizScore = quizResults.stream()
            .filter(result -> result.getQuiz().getCourse().getCourseId().equals(courseId))
            .mapToDouble(result -> (result.getScore() / result.getQuiz().getTotalPoints()) * 100.0)
            .average()
            .orElse(0.0);
        courseProgress.setAverageQuizScore(averageQuizScore);
        
        // Tính tổng thời gian học
        int totalStudyTime = lessonProgresses.stream()
            .mapToInt(LessonProgressDto::getStudyTime)
            .sum();
        courseProgress.setTotalStudyTime(totalStudyTime);
        
        // Lấy ngày học cuối cùng
        LocalDateTime lastStudyDate = lessonProgresses.stream()
            .map(LessonProgressDto::getCompletionDate)
            .filter(date -> date != null)
            .max(LocalDateTime::compareTo)
            .orElse(null);
        courseProgress.setLastStudyDate(lastStudyDate);
        
        return courseProgress;
    }

    @Override
    public double calculateOverallProgress(Long childId) {
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByChildId(childId);
        
        if (enrollments.isEmpty()) {
            return 0.0;
        }
        
        double totalProgress = enrollments.stream()
            .mapToDouble(enrollment -> calculateCourseProgress(childId, enrollment.getCourse().getCourseId()))
            .sum();
        
        return totalProgress / enrollments.size();
    }

    @Override
    public double calculateCourseProgress(Long childId, Long courseId) {
        List<Lesson> lessons = lessonRepository.findLessonByCourseCourseId(courseId);
        
        if (lessons.isEmpty()) {
            return 0.0;
        }
        
        int completedLessons = 0;
        for (Lesson lesson : lessons) {
            LessonProgressDto progress = calculateLessonProgress(childId, lesson);
            if ("COMPLETED".equals(progress.getStatus())) {
                completedLessons++;
            }
        }
        
        return (double) completedLessons / lessons.size() * 100.0;
    }

    private LessonProgressDto calculateLessonProgress(Long childId, Lesson lesson) {
        LessonProgressDto progress = new LessonProgressDto();
        progress.setLessonId(lesson.getLessonId());
        progress.setLessonTitle(lesson.getTitle());
        
        // Kiểm tra learning history
        List<LearningHistory> histories = learningHistoryRepository.findByChild_IdAndLesson_LessonId(childId, lesson.getLessonId());
        
        if (histories.isEmpty()) {
            progress.setStatus("NOT_STARTED");
            progress.setWatchProgress(0);
            progress.setStudyTime(0);
        } else {
            LearningHistory latestHistory = histories.stream()
                .max((h1, h2) -> h1.getStartTime().compareTo(h2.getStartTime()))
                .orElse(null);
            
            if (latestHistory != null) {
                progress.setStartDate(latestHistory.getStartTime());
                progress.setWatchProgress(100); // Đánh dấu hoàn thành luôn
                progress.setStudyTime(calculateStudyTime(latestHistory));
                progress.setStatus("COMPLETED");
                progress.setCompletionDate(latestHistory.getEndTime() != null ? 
                    latestHistory.getEndTime() : latestHistory.getStartTime());
            }
        }
        
        return progress;
    }

    private QuizResultDto convertToQuizResultDto(QuizResult quizResult) {
        QuizResultDto dto = new QuizResultDto();
        dto.setQuizId(quizResult.getQuiz().getQuizId());
        dto.setQuizTitle(quizResult.getQuiz().getTitle());
        dto.setScore(quizResult.getScore());
        dto.setMaxScore(quizResult.getQuiz().getTotalPoints());
        dto.setPercentage((quizResult.getScore() / quizResult.getQuiz().getTotalPoints()) * 100.0);
        dto.setCompletionTime(0); // Cần thêm field này vào QuizResult
        dto.setAttemptDate(quizResult.getSubmittedAt());
        dto.setCorrectAnswers((int) quizResult.getAnswers().stream().filter(answer -> answer.getIsCorrect()).count());
        dto.setTotalQuestions(quizResult.getAnswers().size());
        return dto;
    }

    private int calculateWatchProgress(LearningHistory history) {
        // Tính toán dựa trên thời gian học và duration của lesson
        if (history.getEndTime() != null && history.getStartTime() != null) {
            long durationInSeconds = java.time.Duration.between(history.getStartTime(), history.getEndTime()).getSeconds();
            // Giả sử mỗi lesson có duration 10 phút (600 giây)
            return Math.min((int) (durationInSeconds / 600.0 * 100), 100);
        }
        return 0;
    }

    private int calculateStudyTime(LearningHistory history) {
        if (history.getEndTime() != null && history.getStartTime() != null) {
            return (int) java.time.Duration.between(history.getStartTime(), history.getEndTime()).toMinutes();
        }
        return 0;
    }

    @Override
    @Transactional
    public void markLessonAsCompleted(Long childId, Long lessonId) {
        // Lấy thông tin child và lesson
        User child = userRepository.findById(childId)
            .orElseThrow(() -> new RuntimeException("Child not found"));
        
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        // Kiểm tra xem đã có learning history cho lesson này chưa
        List<LearningHistory> existingHistories = learningHistoryRepository.findByChild_IdAndLesson_LessonId(childId, lessonId);
        
        LearningHistory history;
        if (existingHistories.isEmpty()) {
            // Tạo mới learning history
            history = new LearningHistory();
            history.setChild(child);
            history.setLesson(lesson);
            history.setActivityType(ActivityType.LESSON);
            history.setStartTime(LocalDateTime.now());
            history.setEndTime(LocalDateTime.now());
        } else {
            // Cập nhật learning history hiện tại
            history = existingHistories.stream()
                .max((h1, h2) -> h1.getStartTime().compareTo(h2.getStartTime()))
                .orElse(existingHistories.get(0));
            history.setEndTime(LocalDateTime.now());
        }
        
        // Lưu vào database
        learningHistoryRepository.save(history);
        
        // Kiểm tra xem khóa học có được hoàn thành không
        checkAndNotifyCourseCompletion(childId, lesson.getCourse().getCourseId());
    }
    
    /**
     * Kiểm tra và thông báo khi khóa học được hoàn thành
     */
    private void checkAndNotifyCourseCompletion(Long childId, Long courseId) {
        // Tính progress của khóa học
        double progress = calculateCourseProgress(childId, courseId);
        
        // Nếu progress = 100%, khóa học đã hoàn thành
        if (progress >= 100.0) {
            // Lấy tên khóa học
            Course course = lessonRepository.findLessonByCourseCourseId(courseId).stream()
                .findFirst()
                .map(Lesson::getCourse)
                .orElse(null);
            
            if (course != null) {
                notificationIntegrationService.createCourseCompletionNotifications(
                    childId, 
                    courseId, 
                    course.getTitle()
                );
            }
        }
    }
} 