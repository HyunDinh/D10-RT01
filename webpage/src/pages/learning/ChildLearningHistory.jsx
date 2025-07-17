import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/ChildLearningHistory.module.css';
import { useTranslation } from 'react-i18next';

export default function ChildLearningHistory() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [learningHistory, setLearningHistory] = useState(null);
    const [childId, setChildId] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        // Get current child info
        const fetchChildInfo = async () => {
            try {
                const response = await axios.get('/api/hocho/profile', { withCredentials: true });
                setChildId(response.data.id);
            } catch (err) {
                setError(t('learning_childhistory_error_user'));
                setLoading(false);
            }
        };
        fetchChildInfo();
    }, []);

    useEffect(() => {
        fetchLearningHistory();
    }, []);

    const fetchLearningHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/child/learning-history`, { withCredentials: true });
            setLearningHistory(response.data);
        } catch (err) {
            setError(t('learning_childhistory_error_load'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US');
    };

    const formatStudyTime = (minutes) => {
        if (!minutes) return '0 min';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins} min`;
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>{t('learning_childhistory_loading')}</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className={styles.errorContainer}>
                    <p>{t('learning_childhistory_error_prefix', { error })} {error}</p>
                    <button className={styles.retryButton} onClick={fetchLearningHistory}>
                        {t('learning_childhistory_retry_btn')}
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>📚 {t('learning_childhistory_title')}</h1>
                </div>

                {/* Overview stats */}
                <div className={styles.statsContainer}>
                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <div className={styles.statNumber}>{learningHistory?.totalCourses || 0}</div>
                            <div className={styles.statLabel}>{t('learning_childhistory_stat_enrolled')}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <div className={styles.statNumber}>{learningHistory?.completedCourses || 0}</div>
                            <div className={styles.statLabel}>{t('learning_childhistory_stat_completed')}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <div className={styles.statNumber}>{Math.round(learningHistory?.overallProgress || 0)}%</div>
                            <div className={styles.statLabel}>{t('learning_childhistory_stat_progress')}</div>
                        </div>
                    </div>
                </div>

                {/* Courses list */}
                <div className={styles.section}>
                    <h2>🎓 {t('learning_childhistory_courses_title', { count: learningHistory?.courses?.length || 0 })}</h2>
                    {learningHistory?.courses && learningHistory.courses.length > 0 ? (
                        <div className={styles.courseList}>
                            {learningHistory.courses.map((course) => (
                                <div
                                    key={course.courseId}
                                    className={styles.courseCard}
                                    style={{ cursor: 'pointer', border: selectedCourse && selectedCourse.courseId === course.courseId ? '2px solid #1967d2' : undefined }}
                                    onClick={() => setSelectedCourse(course)}
                                >
                                    <div className={styles.courseHeader}>
                                        <h3>{course.courseTitle}</h3>
                                        <div className={styles.courseProgress}>
                                            <div 
                                                className={styles.progressBar}
                                                style={{ width: `${course.progressPercentage}%` }}
                                            ></div>
                                            <span>{Math.round(course.progressPercentage)}%</span>
                                        </div>
                                    </div>
                                    <div className={styles.courseDetails}>
                                        <div className={styles.courseInfo}>
                                            <span>📖 {course.completedLessons}/{course.totalLessons} lessons</span>
                                        </div>
                                        <div className={styles.courseDate}>
                                            Last studied: {formatDateTime(course.lastStudyDate)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noData}>
                            <p>{t('learning_childhistory_no_courses')}</p>
                        </div>
                    )}
                </div>

                {/* Lessons completed & Quizzes taken chỉ hiển thị khi đã chọn course */}
                {selectedCourse && (
                    <>
                        {/* Lessons */}
                        <div className={styles.section}>
                            <h2>📖 {t('learning_childhistory_lessons_title')}</h2>
                            {selectedCourse.lessonProgresses && selectedCourse.lessonProgresses.length > 0 ? (
                                <div className={styles.lessonList}>
                                    {selectedCourse.lessonProgresses.map((lesson, index) => (
                                        <div
                                            key={`${lesson.lessonId}-${index}`}
                                            className={`${styles.lessonCard} ${lesson.status === 'COMPLETED' ? styles.completed : styles.notCompleted}`}
                                        >
                                            <div className={styles.lessonInfo}>
                                                <h4>{lesson.lessonTitle}</h4>
                                                <span className={styles.lessonDate}>
                                                    {lesson.status === 'COMPLETED'
                                                        ? `${t('learning_childhistory_lesson_completed')}: ${formatDateTime(lesson.completionDate)}`
                                                        : `${t('learning_childhistory_lesson_last_studied')}: ${formatDateTime(lesson.lastStudyDate)}`}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noData}>
                                    <p>{t('learning_childhistory_no_lessons')}</p>
                                </div>
                            )}
                        </div>

                        {/* Quizzes */}
                        <div className={styles.section}>
                            <h2>🧠 {t('learning_childhistory_quizzes_title')}</h2>
                            {selectedCourse.quizResults && selectedCourse.quizResults.length > 0 ? (
                                <div className={styles.quizList}>
                                    {selectedCourse.quizResults.map((quiz, index) => (
                                        <div
                                            key={`${quiz.quizId}-${index}`}
                                            className={`${styles.quizCard} ${styles.completed}`}
                                        >
                                            <div className={styles.quizInfo}>
                                                <h4>{quiz.quizTitle}</h4>
                                                <span className={styles.quizDate}>
                                                    {t('learning_childhistory_quiz_taken')}: {formatDateTime(quiz.attemptDate)}
                                                </span>
                                            </div>
                                            <div className={styles.quizScore}>
                                                <span className={styles.score}>{quiz.score}/{quiz.maxScore}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noData}>
                                    <p>{t('learning_childhistory_no_quizzes')}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
}