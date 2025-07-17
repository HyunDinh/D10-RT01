import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/course/CourseLearingPage.module.css';
import ReactPlayer from 'react-player';
import {Document, Page, pdfjs} from 'react-pdf';
import Header from '../../components/Header';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleDown, faAngleUp, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import Footer from "../../components/Footer.jsx";
import { useTranslation } from 'react-i18next';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CourseLearningPage() {
    const { t } = useTranslation();
    const {courseId} = useParams();
    const navigate = useNavigate();
    const pdfContainerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [openLesson, setOpenLesson] = useState(null);
    const [lessonContents, setLessonContents] = useState({});
    const [selectedContent, setSelectedContent] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [pdfPage, setPdfPage] = useState(1); // Note: Duplicate with pageNumber, using pageNumber for consistency
    const [numPages, setNumPages] = useState(null);
    const [lastLoadedContentId, setLastLoadedContentId] = useState(null);
    const [pdfWidth, setPdfWidth] = useState(600);
    const [activeTab, setActiveTab] = useState('lessons');
    const [quizzes, setQuizzes] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizHistory, setQuizHistory] = useState([]);
    const [quizHistoryLoading, setQuizHistoryLoading] = useState(false);
    const [quizHistoryError, setQuizHistoryError] = useState(null);
    const [childId, setChildId] = useState(null);
    const [fileBuffer, setFileBuffer] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [pdfKey, setPdfKey] = useState(0);
    const [completingLesson, setCompletingLesson] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const lessonsRes = await axios.get(`/api/lessons/course/${courseId}`, {withCredentials: true});
                setLessons(lessonsRes.data);
            } catch (err) {
                setError(t('learning_course_error_load'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, t]);

    useEffect(() => {
        function updatePdfWidth() {
            if (pdfContainerRef.current) {
                setPdfWidth(pdfContainerRef.current.offsetWidth);
            }
        }

        updatePdfWidth();
        window.addEventListener('resize', updatePdfWidth);
        return () => window.removeEventListener('resize', updatePdfWidth);
    }, [selectedContent]);

    useEffect(() => {
        if (activeTab === 'quiz') {
            setQuizLoading(true);
            setQuizError(null);
            axios
                .get(`/api/quizzes/course/${courseId}`, {withCredentials: true})
                .then((res) => setQuizzes(res.data))
                .catch(() => setQuizError('Failed to load quizzes.'))
                .finally(() => setQuizLoading(false));
        }
    }, [activeTab, courseId]);

    useEffect(() => {
        axios
            .get('/api/hocho/profile', {withCredentials: true})
            .then((res) => setChildId(res.data.id))
            .catch(() => setChildId(null));
    }, []);

    useEffect(() => {
        if (selectedQuiz && childId) {
            setQuizHistoryLoading(true);
            setQuizHistoryError(null);
            axios
                .get(`/api/quizzes/${selectedQuiz.quizId}/child/${childId}/result`, {withCredentials: true})
                .then((res) => {
                    setQuizHistory(Array.isArray(res.data) ? res.data : [res.data]);
                })
                .catch(() => setQuizHistoryError('Failed to load quiz history.'))
                .finally(() => setQuizHistoryLoading(false));
        } else {
            setQuizHistory([]);
        }
    }, [selectedQuiz, childId]);

    useEffect(() => {
        return () => {
            setFileBuffer(null);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'lessons' && selectedContent && selectedContent.contentType === 'PDF' && selectedContent.contentData) {
            try {
                setPdfLoading(true);
                setPdfError(null);
                const buffer = createFreshArrayBuffer(selectedContent.contentData);
                setFileBuffer(buffer);
                setPageNumber(1);
                setPdfKey((prev) => prev + 1);
            } catch (err) {
                console.error('Error recreating PDF buffer:', err);
                setPdfError(t('learning_course_pdf_error'));
                setFileBuffer(null);
            } finally {
                setPdfLoading(false);
            }
        }
    }, [activeTab, selectedContent, t]);

    const handleToggleLesson = async (lessonId) => {
        setOpenLesson(openLesson === lessonId ? null : lessonId);
        if (!lessonContents[lessonId]) {
            try {
                const res = await axios.get(`/api/lesson-contents/${lessonId}`, {withCredentials: true});
                setLessonContents((prev) => ({...prev, [lessonId]: res.data}));
            } catch (err) {
                setLessonContents((prev) => ({...prev, [lessonId]: []}));
            }
        }
        const lesson = lessons.find((l) => l.lessonId === lessonId);
        setCurrentLesson(openLesson === lessonId ? null : lesson);
    };

    const handleSelectContent = (content) => {
        setSelectedContent(content);
        const lesson = lessons.find((lesson) => lessonContents[lesson.lessonId]?.some((c) => c.contentId === content.contentId));
        setCurrentLesson(lesson);
        if (content.contentType === 'PDF' && content.contentData) {
            try {
                setPdfLoading(true);
                setPdfError(null);
                const buffer = createFreshArrayBuffer(content.contentData);
                setFileBuffer(buffer);
                setPageNumber(1);
                setPdfKey((prev) => prev + 1);
            } catch (err) {
                console.error('Error creating PDF buffer:', err);
                setPdfError(t('learning_course_pdf_error'));
                setFileBuffer(null);
            } finally {
                setPdfLoading(false);
            }
        } else {
            setFileBuffer(null);
            setPdfError(null);
        }
    };

    const handleCompleteLesson = async () => {
        if (!currentLesson || !childId) {
            alert(t('learning_course_complete_error'));
            return;
        }
        setCompletingLesson(true);
        try {
            await axios.post(`/api/parent/learning-progress/child/${childId}/lesson/${currentLesson.lessonId}/complete`, {}, {withCredentials: true});
            alert(t('learning_course_complete_success'));
        } catch (error) {
            console.error('Error completing lesson:', error);
            alert(t('learning_course_complete_error'));
        } finally {
            setCompletingLesson(false);
        }
    };

    const onDocumentLoadSuccess = ({numPages: n}) => {
        setNumPages(n);
        setPdfLoading(false);
        setPdfError(null);
        if (!lastLoadedContentId || (selectedContent && lastLoadedContentId !== selectedContent.contentId)) {
            setPageNumber(1);
            if (selectedContent) setLastLoadedContentId(selectedContent.contentId);
        }
    };

    const onDocumentLoadError = (error) => {
        console.error('PDF load error:', error);
        setPdfError(t('learning_course_pdf_error'));
        setPdfLoading(false);
    };

    const createFreshArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.slice().buffer;
    };

    const getDownloadUrl = (content) => {
        if (!content || !content.contentData) return null;
        const buffer = createFreshArrayBuffer(content.contentData);
        let mime = 'application/octet-stream';
        let ext = '';
        if (content.contentType === 'VIDEO') {
            mime = 'video/mp4';
            ext = '.mp4';
        } else if (content.contentType === 'PDF') {
            mime = 'application/pdf';
            ext = '.pdf';
        }
        const blob = new Blob([buffer], {type: mime});
        return {
            url: URL.createObjectURL(blob), filename: (content.title || 'lesson') + ext,
        };
    };

    if (loading) {
        return (<div className={styles.learningPageContainer}>
            <div className={styles.loading}>{t('learning_course_loading')}</div>
        </div>);
    }
    if (error) {
        return (<div className={styles.learningPageContainer}>
            <div className={styles.error}>{error}</div>
        </div>);
    }

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('learning_course_title')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                    data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">{t('learning_breadcrumb_home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>
                        <a href="/hocho/child/course">{t('learning_course_breadcrumb_my_courses')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('learning_course_breadcrumb_lessons')}</li>
                </ul>
            </div>
        </section>
        <div className={styles.courseLessonsPageContainer}>
            <div className={styles.courseLessonsTabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'lessons' ? styles.activeTab : styles.inactiveTab}`}
                    onClick={() => setActiveTab('lessons')}
                    aria-label={t('learning_course_tab_lessons_aria')}
                >
                    {t('learning_course_tab_lessons')}
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'quiz' ? styles.activeTab : styles.inactiveTab}`}
                    onClick={() => setActiveTab('quiz')}
                    aria-label={t('learning_course_tab_quizzes_aria')}
                >
                    {t('learning_course_tab_quizzes')}
                </button>
            </div>
            <div className={styles.courseLessonsMain}>
                {activeTab === 'lessons' ? (<div className={styles.courseLessonsLeft}>
                    {lessons.map((lesson) => (<div key={lesson.lessonId} className={styles.lessonAccordion}>
                        <button
                            className={styles.lessonAccordionHeader}
                            onClick={() => handleToggleLesson(lesson.lessonId)}
                            aria-expanded={openLesson === lesson.lessonId}
                            aria-controls={`lesson-content-${lesson.lessonId}`}
                        >
                            <span>{lesson.title}</span>
                            <FontAwesomeIcon
                                icon={openLesson === lesson.lessonId ? faAngleUp : faAngleDown}
                                className={styles.lessonAccordionArrow}
                            />
                        </button>
                        {openLesson === lesson.lessonId && (<div id={`lesson-content-${lesson.lessonId}`}
                                                                 className={styles.lessonAccordionContent}>
                            {(lessonContents[lesson.lessonId] || []).map((content) => (<button
                                key={content.contentId}
                                className={`${styles.lessonContentLink} ${selectedContent && selectedContent.contentId === content.contentId ? styles.selectedContent : ''}`}
                                onClick={() => handleSelectContent(content)}
                                aria-label={`View content ${content.title}`}
                            >
                                {content.title} ({content.contentType})
                            </button>))}
                            {lessonContents[lesson.lessonId]?.length === 0 && (
                                <div className={styles.lessonContentEmpty}>{t('learning_course_no_content')}</div>)}
                        </div>)}
                    </div>))}
                </div>) : (<div className={styles.courseLessonsLeft}>
                    {quizLoading ? (<div className={styles.loading}>{t('learning_course_loading_quizzes')}</div>) : quizError ? (
                        <div className={styles.error}>{quizError}</div>) : quizzes.length === 0 ? (
                        <div className={styles.noContent}>{t('learning_course_no_quizzes')}</div>) : (
                        <ul className={styles.quizList}>
                            {quizzes.map((quiz) => (<li
                                key={quiz.quizId}
                                className={`${styles.quizItem} ${selectedQuiz && selectedQuiz.quizId === quiz.quizId ? styles.selectedQuiz : ''}`}
                                onClick={() => setSelectedQuiz(quiz)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedQuiz(quiz);
                                    }
                                }}
                                aria-label={`Select quiz ${quiz.title}`}
                            >
                                {quiz.title}
                            </li>))}
                        </ul>)}
                </div>)}
                <div className={styles.courseLessonsRight} ref={pdfContainerRef}>
                    {activeTab === 'lessons' ? (selectedContent ? (<div className={styles.lessonContentDisplayBox}>
                        <div className={styles.lessonContentTitle}>
                            {selectedContent.title} ({selectedContent.contentType})
                        </div>
                        {currentLesson && (<div className={styles.currentLessonInfo}>
                            <strong>{t('learning_course_lesson')}</strong> {currentLesson.title}
                        </div>)}
                        {selectedContent.contentType === 'VIDEO' && selectedContent.contentData && (
                            <div className={styles.videoContainer}>
                                <ReactPlayer
                                    url={URL.createObjectURL(new Blob([createFreshArrayBuffer(selectedContent.contentData)], {type: 'video/mp4'}))}
                                    controls
                                    width="100%"
                                    height="auto"
                                    className={styles.videoPlayer}
                                />
                            </div>)}
                        {selectedContent.contentType === 'PDF' && (
                          <div className={styles.pdfPresentationContainer}>
                            <div className={styles.pdfSlide}>
                              {pdfLoading ? (
                                <div className={styles.loading}>{t('learning_course_loading_pdf')}</div>
                              ) : pdfError ? (
                                <div className={styles.error}>{pdfError}</div>
                              ) : fileBuffer ? (
                                <Document
                                  key={`pdf-${pdfKey}-${selectedContent.contentId}`}
                                  file={fileBuffer}
                                  onLoadSuccess={onDocumentLoadSuccess}
                                  onLoadError={onDocumentLoadError}
                                  loading={<div className={styles.loading}>{t('learning_course_loading_pdf')}</div>}
                                  error={<div className={styles.error}>{t('learning_course_pdf_error')}</div>}
                                  noData={<div className={styles.error}>{t('learning_course_no_pdf')}</div>}
                                >
                                  <Page
                                    pageNumber={pageNumber}
                                    width={pdfWidth - 64}
                                    loading={<div className={styles.loading}>{t('learning_course_loading_page')}</div>}
                                    error={<div className={styles.error}>{t('learning_course_page_error')}</div>}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                  />
                                </Document>
                              ) : (
                                <div className={styles.error}>{t('learning_course_no_pdf')}</div>
                              )}
                            </div>
                            <div className={styles.pdfNavigation}>
                              <button
                                className={`${styles.navButton} ${pageNumber <= 1 ? styles.btnDisabled : ''}`}
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(pageNumber - 1)}
                                aria-label={t('learning_course_pdf_prev_aria')}
                              >
                                {t('learning_course_pdf_prev')}
                              </button>
                              <span className={styles.pageInfo}>
                                {t('learning_course_pdf_page')} {pageNumber} / {numPages || '?'}
                              </span>
                              <button
                                className={`${styles.navButton} ${pageNumber >= (numPages || 1) ? styles.btnDisabled : ''}`}
                                disabled={pageNumber >= (numPages || 1)}
                                onClick={() => setPageNumber(pageNumber + 1)}
                                aria-label={t('learning_course_pdf_next_aria')}
                              >
                                {t('learning_course_pdf_next')}
                              </button>
                            </div>
                          </div>
                        )}
                        {(selectedContent.contentType === 'VIDEO' || selectedContent.contentType === 'PDF') && ((() => {
                            const download = getDownloadUrl(selectedContent);
                            return download ? (<div className={styles.downloadButtonContainer}>
                                <a href={download.url} download={download.filename}
                                   className={styles.downloadLink}>
                                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                                        {t('learning_course_download', { type: selectedContent.contentType === 'VIDEO' ? t('learning_course_video') : t('learning_course_pdf') })}
                                    </button>
                                </a>
                            </div>) : null;
                        })())}
                        {selectedContent.contentType !== 'VIDEO' && selectedContent.contentType !== 'PDF' && (
                            <div className={styles.noContent}>{t('learning_course_unsupported_content')}</div>)}
                        {currentLesson && (<div className={styles.completeLessonContainer}>
                            <button
                                className={`${styles.btn} ${styles.btnSuccess} ${completingLesson ? styles.btnDisabled : ''}`}
                                onClick={handleCompleteLesson}
                                disabled={completingLesson}
                                aria-label={t('learning_course_complete_lesson_aria', { lesson: currentLesson.title })}
                            >
                                {completingLesson ? t('learning_course_processing') : t('learning_course_complete_lesson_btn')}
                            </button>
                            <p className={styles.completeLessonNote}>
                                {t('learning_course_complete_lesson_note', { lesson: currentLesson.title })}
                            </p>
                        </div>)}
                    </div>) : (<div className={styles.lessonContentDisplayBox}>
                        <div className={styles.noContent}>{t('learning_course_select_lesson')}</div>
                    </div>)) : (selectedQuiz ? (<div className={styles.lessonContentDisplayBox}>
                        <div className={styles.lessonContentTitle}>{selectedQuiz.title}</div>
                        <div className={styles.quizInfo}>
                            <div>
                                <strong>{t('learning_course_max_score')}</strong> {selectedQuiz.totalPoints}
                            </div>
                            <div>
                                <strong>{t('learning_course_time_limit')}</strong> {selectedQuiz.timeLimit} {t('learning_course_minutes')}
                            </div>
                        </div>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => navigate(`/hocho/quizzes/${selectedQuiz.quizId}/do`)}
                            aria-label={t('learning_course_take_quiz_aria', { quiz: selectedQuiz.title })}
                        >
                            {t('learning_course_take_quiz_btn')}
                        </button>
                        <div className={styles.quizHistory}>
                            <h4 className={styles.quizHistoryTitle}>{t('learning_course_quiz_history_title')}</h4>
                            {quizHistoryLoading ? (
                                <div className={styles.loading}>{t('learning_course_loading_history')}</div>) : quizHistoryError ? (<div
                                className={styles.error}>{quizHistoryError}</div>) : quizHistory.length === 0 ? (
                                <div className={styles.noContent}>{t('learning_course_no_attempts')}</div>) : (
                                <ul className={styles.quizHistoryList}>
                                    {quizHistory.map((attempt, idx) => (<li key={attempt.resultId || idx}
                                                                            className={styles.quizHistoryItem}>
                                        <div>
                                            <div>
                                                <strong>{t('learning_course_score')}</strong> {attempt.score}
                                            </div>
                                            <div>
                                                <strong>{t('learning_course_date')}</strong>{' '}
                                                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'}
                                            </div>
                                        </div>
                                        <button className={`${styles.btn} ${styles.btnPrimary}`}
                                                onClick={() => navigate(`/hocho/quizzes/${selectedQuiz.quizId}/review`)}
                                        >{t('learning_course_view_details_btn')}
                                        </button>
                                    </li>))}
                                </ul>)}
                        </div>
                    </div>) : (<div className={styles.lessonContentDisplayBox}>
                        <div className={styles.noContent}>{t('learning_course_select_quiz')}</div>
                    </div>))}
                </div>
            </div>
        </div>
        <Footer/>
    </>);
}