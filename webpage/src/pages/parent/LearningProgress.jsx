import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/LearningProgress.module.css';
import TimeRestrictionPage from './TimeRestrictionPage';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { useTranslation } from 'react-i18next';

// Helper to format seconds to hh:mm:ss
function formatSecondsToHMS(seconds) {
    seconds = Number(seconds) || 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
        .map(unit => unit.toString().padStart(2, '0'))
        .join(':');
}

// Helper to parse hh:mm:ss, mm:ss, or ss to seconds
function parseHMSToSeconds(str) {
    if (!str) return 0;
    const parts = str.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        return parts[0];
    }
    return 0;
}

const LearningProgress = () => {
    const { t } = useTranslation();
    const {childId} = useParams();
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('progress'); // 'progress' or 'timeRestriction'


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
            setError('Failed to load learning progress data');
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
        return (<div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>{t('learning_loading')}</p>
        </div>);
    }

    if (error) {
        return (<div className={styles.errorContainer}>
            <h2>{t('learning_error')}</h2>
            <p>{t('learning_error_load')}</p>
            <button onClick={fetchLearningProgress} className={styles.retryButton}>
                {t('learning_retry')}
            </button>
        </div>);
    }

    if (!progressData) {
        return (<div className={styles.noDataContainer}>
            <h2>{t('learning_no_data')}</h2>
            <p>{t('learning_no_data_hint')}</p>
        </div>);
    }

    return (<>
        <Header/>

        <div className={styles.container}>
            <div className={styles.sidebarTabs}>
                <div
                    className={`${styles.tabItem} ${activeTab === 'progress' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('progress')}
                >
                    {t('learning_tab_progress')}
                </div>
                <div
                    className={`${styles.tabItem} ${activeTab === 'timeRestriction' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('timeRestriction')}
                >
                    {t('learning_tab_time_restriction')}
                </div>
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'progress' && (<>
                    <div className={styles.header}>
                        <h1>{t('learning_header', {name: progressData.childName})}</h1>
                        <div className={styles.overview}>
                            <div className={styles.overviewCard}>
                                <h3>{t('learning_overview')}</h3>
                                <div className={styles.overviewStats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{progressData.totalCourses}</span>
                                        <span className={styles.statLabel}>{t('learning_courses')}</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{progressData.completedCourses}</span>
                                        <span className={styles.statLabel}>{t('learning_completed')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.coursesSection}>
                            <h2>{t('learning_course_list')}</h2>
                            <div className={styles.coursesGrid}>
                                {progressData.courses.map((course) => (<div
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
                                            <span>{course.completedLessons}/{course.totalLessons} {t('learning_lessons')}</span>
                                        </div>
                                    </div>
                                </div>))}
                            </div>
                        </div>

                        {selectedCourse && (<div className={styles.courseDetail}>
                            <h2>{t('learning_details', {title: selectedCourse.courseTitle})}</h2>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailCard}>
                                    <h3>{t('learning_lesson_progress')}</h3>
                                    <div className={styles.lessonsList}>
                                        {selectedCourse.lessonProgresses.map((lesson) => (
                                            <div key={lesson.lessonId} className={styles.lessonItem}>
                                                <div className={styles.lessonInfo}>
                                                    <h4>{lesson.lessonTitle}</h4>
                                                    <span
                                                        className={`${styles.status} ${styles[lesson.status.toLowerCase()]}`}>
                                                        {lesson.status === 'COMPLETED' ? t('learning_status_completed') : lesson.status === 'IN_PROGRESS' ? t('learning_status_in_progress') : t('learning_status_not_started')}
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
                                            </div>))}
                                    </div>
                                </div>

                                <div className={styles.detailCard}>
                                    <h3>{t('learning_quiz_results')}</h3>
                                    <div className={styles.quizList}>
                                        {selectedCourse.quizResults.length > 0 ? (selectedCourse.quizResults.map((quiz) => (
                                            <div key={quiz.quizId} className={styles.quizItem}>
                                                <div className={styles.quizInfo}>
                                                    <h4>{quiz.quizTitle}</h4>
                                                    <span className={styles.quizDate}>
                                                        {new Date(quiz.attemptDate).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div className={styles.quizScore}>
                                                    <span className={styles.score}>
                                                        {quiz.correctAnswers}/{quiz.totalQuestions} {t('learning_correct_answers')}
                                                    </span>
                                                    <span className={styles.score} style={{marginLeft: 12}}>
                                                        {quiz.score}/{quiz.maxScore} {t('learning_points')}
                                                    </span>
                                                </div>
                                            </div>))) : (<p>{t('learning_no_quiz_results')}</p>)}
                                    </div>
                                </div>
                            </div>
                        </div>)}
                    </div>
                </>)}
                {activeTab === 'timeRestriction' && (<TimeRestrictionPage childId={childId}/>) }
            </div>
        </div>
        <Footer/>
    </>);
};

export default LearningProgress;