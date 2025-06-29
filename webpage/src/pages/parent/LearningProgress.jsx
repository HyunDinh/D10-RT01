import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/LearningProgress.module.css';

const LearningProgress = () => {
    const { childId } = useParams();
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchLearningProgress();
    }, [childId]);

    const fetchLearningProgress = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/parent/learning-progress/child/${childId}`);
            setProgressData(response.data);
            setError(null);
        } catch (err) {
            setError('Không thể tải dữ liệu tiến độ học tập');
            console.error('Error fetching learning progress:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return '#4CAF50';
        if (percentage >= 60) return '#FF9800';
        return '#F44336';
    };

    const getCourseImageUrl = (courseImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!courseImageUrl || courseImageUrl === 'none') {
            return '/avaBack.jpg';
        }
        const fileName = courseImageUrl.split('/').pop();
        return `${baseUrl}/api/courses/image/${fileName}?t=${new Date().getTime()}`;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Lỗi</h2>
                <p>{error}</p>
                <button onClick={fetchLearningProgress} className={styles.retryButton}>
                    Thử lại
                </button>
            </div>
        );
    }

    if (!progressData) {
        return (
            <div className={styles.noDataContainer}>
                <h2>Không có dữ liệu</h2>
                <p>Chưa có thông tin tiến độ học tập cho trẻ này.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Tiến độ học tập của {progressData.childName}</h1>
                <div className={styles.overview}>
                    <div className={styles.overviewCard}>
                        <h3>Tổng quan</h3>
                        <div className={styles.overviewStats}>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{progressData.totalCourses}</span>
                                <span className={styles.statLabel}>Khóa học</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{progressData.completedCourses}</span>
                                <span className={styles.statLabel}>Đã hoàn thành</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.coursesSection}>
                    <h2>Danh sách khóa học</h2>
                    <div className={styles.coursesGrid}>
                        {progressData.courses.map((course) => (
                            <div 
                                key={course.courseId} 
                                className={`${styles.courseCard} ${selectedCourse?.courseId === course.courseId ? styles.selected : ''}`}
                                onClick={() => handleCourseClick(course)}
                            >
                                <div className={styles.courseImage}>
                                    <img
                                        src={getCourseImageUrl(course.courseImageUrl)}
                                        alt={course.courseTitle}
                                        onError={e => (e.target.src = '/avaBack.jpg')}
                                    />
                                </div>
                                <div className={styles.courseInfo}>
                                    <h3>{course.courseTitle}</h3>
                                    <div className={styles.courseProgress}>
                                        <div className={styles.progressBar}>
                                            <div 
                                                className={styles.progressFill}
                                                style={{ 
                                                    width: `${course.progressPercentage}%`,
                                                    backgroundColor: getProgressColor(course.progressPercentage)
                                                }}
                                            ></div>
                                        </div>
                                        <span>{course.progressPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className={styles.courseStats}>
                                        <span>{course.completedLessons}/{course.totalLessons} bài học</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedCourse && (
                    <div className={styles.courseDetail}>
                        <h2>Chi tiết: {selectedCourse.courseTitle}</h2>
                        <div className={styles.detailGrid}>
                            <div className={styles.detailCard}>
                                <h3>Tiến độ bài học</h3>
                                <div className={styles.lessonsList}>
                                    {selectedCourse.lessonProgresses.map((lesson) => (
                                        <div key={lesson.lessonId} className={styles.lessonItem}>
                                            <div className={styles.lessonInfo}>
                                                <h4>{lesson.lessonTitle}</h4>
                                                <span className={`${styles.status} ${styles[lesson.status.toLowerCase()]}`}>
                                                    {lesson.status === 'COMPLETED' ? 'Hoàn thành' :
                                                     lesson.status === 'IN_PROGRESS' ? 'Đang học' : 'Chưa học'}
                                                </span>
                                            </div>
                                            <div className={styles.lessonProgress}>
                                                <div className={styles.progressBar}>
                                                    <div 
                                                        className={styles.progressFill}
                                                        style={{ 
                                                            width: `${lesson.watchProgress}%`,
                                                            backgroundColor: getProgressColor(lesson.watchProgress)
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.detailCard}>
                                <h3>Kết quả Quiz</h3>
                                <div className={styles.quizList}>
                                    {selectedCourse.quizResults.length > 0 ? (
                                        selectedCourse.quizResults.map((quiz) => (
                                            <div key={quiz.quizId} className={styles.quizItem}>
                                                <div className={styles.quizInfo}>
                                                    <h4>{quiz.quizTitle}</h4>
                                                    <span className={styles.quizDate}>
                                                        {new Date(quiz.attemptDate).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div className={styles.quizScore}>
                                                    <span className={styles.score}>
                                                        {quiz.correctAnswers}/{quiz.totalQuestions} câu đúng
                                                    </span>
                                                    <span className={styles.score} style={{marginLeft: 12}}>
                                                        {quiz.score}/{quiz.maxScore} điểm
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Chưa có kết quả quiz nào</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningProgress; 