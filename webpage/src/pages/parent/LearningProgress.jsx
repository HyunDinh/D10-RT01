import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/LearningProgress.module.css';
import TimeRestrictionPage from './TimeRestrictionPage';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

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
            <p>Loading data...</p>
        </div>);
    }

    if (error) {
        return (<div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={fetchLearningProgress} className={styles.retryButton}>
                Retry
            </button>
        </div>);
    }

    if (!progressData) {
        return (<div className={styles.noDataContainer}>
            <h2>No data</h2>
            <p>No learning progress information for this child yet.</p>
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
                    Learning Progress
                </div>
                <div
                    className={`${styles.tabItem} ${activeTab === 'timeRestriction' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('timeRestriction')}
                >
                    Time Restriction
                </div>
            </div>
            <div className={styles.tabContent}>
                {activeTab === 'progress' && (<>
                    <div className={styles.header}>
                        <h1>Learning progress of {progressData.childName}</h1>
                        <div className={styles.overview}>
                            <div className={styles.overviewCard}>
                                <h3>Overview</h3>
                                <div className={styles.overviewStats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{progressData.totalCourses}</span>
                                        <span className={styles.statLabel}>Courses</span>
                                    </div>
                                    <div className={styles.stat}>
                                                <span
                                                    className={styles.statValue}>{progressData.completedCourses}</span>
                                        <span className={styles.statLabel}>Completed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.coursesSection}>
                            <h2>Course list</h2>
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
                                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                                        </div>
                                    </div>
                                </div>))}
                            </div>
                        </div>

                        {selectedCourse && (<div className={styles.courseDetail}>
                            <h2>Details: {selectedCourse.courseTitle}</h2>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailCard}>
                                    <h3>Lesson progress</h3>
                                    <div className={styles.lessonsList}>
                                        {selectedCourse.lessonProgresses.map((lesson) => (
                                            <div key={lesson.lessonId} className={styles.lessonItem}>
                                                <div className={styles.lessonInfo}>
                                                    <h4>{lesson.lessonTitle}</h4>
                                                    <span
                                                        className={`${styles.status} ${styles[lesson.status.toLowerCase()]}`}>
                                                                {lesson.status === 'COMPLETED' ? 'Completed' : lesson.status === 'IN_PROGRESS' ? 'In progress' : 'Not started'}
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
                                    <h3>Quiz results</h3>
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
                                                                    {quiz.correctAnswers}/{quiz.totalQuestions} correct answers
                                                                </span>
                                                    <span className={styles.score}
                                                          style={{marginLeft: 12}}>
                                                                    {quiz.score}/{quiz.maxScore} points
                                                                </span>
                                                </div>
                                            </div>))) : (<p>No quiz results yet</p>)}
                                    </div>
                                </div>
                            </div>
                        </div>)}
                    </div>
                </>)}
                {activeTab === 'timeRestriction' && (<TimeRestrictionPage childId={childId}/>)}
            </div>
        </div>
        <Footer/>
    </>);
};

export default LearningProgress; 