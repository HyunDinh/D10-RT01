import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/quiz/QuizDetailTeacher.module.css';
import addLessonStyles from '../../styles/lesson/AddLesson.module.css';
import Footer from "../../components/Footer.jsx";
import Header from "../../components/Header.jsx";

const QuizDetailTeacher = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deletingResults, setDeletingResults] = useState(false);
    const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
    const [showDeleteResultsModal, setShowDeleteResultsModal] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/quizzes/${id}`, {
                withCredentials: true,
            });
            setQuiz({
                ...res.data, questions: res.data.questions || [], results: res.data.results || [],
            });
            setLoading(false);
            // Select the first question by default if available
            if (res.data.questions.length > 0) {
                setSelectedQuestionId(res.data.questions[0].questionId);
            }
        } catch (err) {
            setError('Unable to load quiz information');
            setLoading(false);
        }
    };

    const handleDeleteQuizClick = () => {
        setShowDeleteQuizModal(true);
    };

    const handleDeleteQuizCancel = () => {
        const modal = document.querySelector(`.${addLessonStyles.modal}`);
        const modalContent = document.querySelector(`.${addLessonStyles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowDeleteQuizModal(false);
            }, 300);
        } else {
            setShowDeleteQuizModal(false);
        }
    };

    const handleDeleteQuizConfirm = async () => {
        setDeleting(true);
        try {
            await axios.delete(`http://localhost:8080/api/quizzes/${id}`, {
                withCredentials: true,
            });
            setShowDeleteQuizModal(false);
            navigate(`/hocho/teacher/quizzes?courseId=${courseId}`);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Cannot delete this quiz because students have already taken it. Please delete the quiz results first.');
            } else {
                setError('Unable to delete quiz');
            }
            setShowDeleteQuizModal(false);
            setDeleting(false);
        }
    };

    const handleDeleteResultsClick = () => {
        setShowDeleteResultsModal(true);
    };

    const handleDeleteResultsCancel = () => {
        const modal = document.querySelector(`.${addLessonStyles.modal}`);
        const modalContent = document.querySelector(`.${addLessonStyles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowDeleteResultsModal(false);
            }, 300);
        } else {
            setShowDeleteResultsModal(false);
        }
    };

    const handleDeleteResultsConfirm = async () => {
        setDeletingResults(true);
        try {
            await axios.delete(`http://localhost:8080/api/quizzes/${id}/results`, {
                withCredentials: true,
            });
            setShowDeleteResultsModal(false);
            setDeletingResults(false);
        } catch (err) {
            setError('Unable to delete quiz results');
            setShowDeleteResultsModal(false);
            setDeletingResults(false);
        }
    };

    const handleQuestionClick = (questionId) => {
        setSelectedQuestionId(questionId);
    };

    const courseId = quiz?.course?.courseId || quiz?.courseId;

    const getQuizImageUrl = (questionImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!questionImageUrl || questionImageUrl === 'none') {
            return '/default.jpg';
        }
        const fileName = questionImageUrl.split('/').pop();
        return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
    };

    const renderQuestionDetails = () => {
        if (!selectedQuestionId || !quiz) {
            return <div className={styles.noQuestion}>Please select a question to view details.</div>;
        }
        const question = quiz.questions.find((q) => q.questionId === selectedQuestionId);
        if (!question) {
            return <div className={styles.noQuestion}>Question does not exist.</div>;
        }
        return (<div className={styles.questionDetail}>
            <div className={styles.quizDetailQuestionTitle}>
                Question {quiz.questions.findIndex((q) => q.questionId === selectedQuestionId) + 1}: {question.questionText}
            </div>
            <img
                src={getQuizImageUrl(question.questionImageUrl)}
                alt="Illustration image"
                className={styles.quizDetailQuestionImage}
                onError={(e) => (e.target.src = '/images/default-quiz.jpg')}
                style={{display: question.questionImageUrl && question.questionImageUrl !== 'none' ? 'block' : 'none'}}
            />
            <div>
                {question.options.map((option) => (<div
                    key={option.optionId}
                    className={option.optionKey === question.correctOptionId ? `${styles.quizDetailOption} ${styles.correct}` : styles.quizDetailOption}
                >
                    {option.optionKey}. {option.optionText}{' '}
                    {option.optionKey === question.correctOptionId && <strong>(Correct answer)</strong>}
                </div>))}
            </div>
            <div style={{marginTop: 8}}>
                <span className={styles.quizDetailBadge}>Points: {question.points}</span>
            </div>
        </div>);
    };

    if (loading) {
        return <div className={styles.quizDetailAlert}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.quizDetailAlert}>{error}</div>;
    }

    if (!quiz) {
        return null;
    }

    return (<>
        <Header/>

        <main className={styles.quizDetailContainer}>
            <div className={styles.quizDetailHeader}>
                <div className={styles.quizDetailTitle}>{quiz.title}</div>
                <div className={styles.quizDetailHeaderActions}>
                    <button
                        className={styles.quizDetailBtn}
                        onClick={() => navigate(`/hocho/teacher/quizzes/${id}/edit`)}
                    >
                        Edit
                    </button>
                    {(quiz.results?.length || 0) > 0 && (<button
                        className={`${styles.quizDetailBtn} ${styles.warning}`}
                        onClick={handleDeleteResultsClick}
                        disabled={deletingResults}
                    >
                        {deletingResults ? 'Deleting...' : 'Delete quiz results'}
                    </button>)}
                    <button
                        className={`${styles.quizDetailBtn} ${styles.danger}`}
                        onClick={handleDeleteQuizClick}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        className={styles.quizDetailBtn}
                        onClick={() => navigate(`/hocho/teacher/quizzes?courseId=${courseId}`)}
                    >
                        Back
                    </button>
                </div>
            </div>
            <div className={styles.quizDetailInfoRow}>
                <div className={styles.quizDetailInfoCol}>
                    <div className={styles.quizDetailInfoTitle}>Basic Information</div>
                    <div className={styles.quizDetailInfoText}><strong>Description:</strong> {quiz.description}
                    </div>
                    <div className={styles.quizDetailInfoText}><strong>Time limit:</strong> {quiz.timeLimit} minutes
                    </div>
                    <div className={styles.quizDetailInfoText}><strong>Total points:</strong> {quiz.totalPoints}
                    </div>
                    <div className={styles.quizDetailInfoText}><strong>Number of
                        questions:</strong> {(quiz.questions?.length || 0)}</div>
                </div>
            </div>

            <div className={styles.splitContainer}>
                {/* Left Side: Question List */}
                <div className={styles.questionList}>
                    <h3 className={styles.questionListTitle}>Question list</h3>
                    {quiz.questions.length === 0 ? (<div className={styles.noQuestion}>No questions.</div>) : (
                        <ul className={styles.questionItems}>
                            {quiz.questions.map((question, index) => (<li
                                key={question.questionId}
                                className={`${styles.questionItem} ${selectedQuestionId === question.questionId ? styles.questionItemActive : ''}`}
                                onClick={() => handleQuestionClick(question.questionId)}
                            >
                                <div className={styles.quizDetailQuestionTitle}>
                                    Question {index + 1}: {question.questionText}
                                </div>
                            </li>))}
                        </ul>)}
                </div>

                {/* Right Side: Question Details */}
                <div className={styles.questionDetailContainer}>
                    <h3 className={styles.questionListTitle}>Question details</h3>
                    {renderQuestionDetails()}
                </div>
            </div>

            {showDeleteQuizModal && (<div className={addLessonStyles.modal}>
                <div className={addLessonStyles.modalContent}>
                    <div className={addLessonStyles.modalHeader}>
                        <h5>Confirm delete quiz</h5>
                        <button
                            className={addLessonStyles.modalClose}
                            onClick={handleDeleteQuizCancel}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                    <div className={addLessonStyles.modalBody}>
                        <p>Are you sure you want to delete this quiz?</p>
                    </div>
                    <div className={addLessonStyles.modalFooter}>
                        <button
                            className={`${addLessonStyles.btn} ${addLessonStyles.btnSecondary}`}
                            onClick={handleDeleteQuizCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className={`${addLessonStyles.btn} ${addLessonStyles.btnSuccess}`}
                            onClick={handleDeleteQuizConfirm}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>)}

            {showDeleteResultsModal && (<div className={addLessonStyles.modal}>
                <div className={addLessonStyles.modalContent}>
                    <div className={addLessonStyles.modalHeader}>
                        <h5>Confirm delete quiz results</h5>
                        <button
                            className={addLessonStyles.modalClose}
                            onClick={handleDeleteResultsCancel}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                    <div className={addLessonStyles.modalBody}>
                        <p>Are you sure you want to delete all quiz results for this quiz?</p>
                    </div>
                    <div className={addLessonStyles.modalFooter}>
                        <button
                            className={`${addLessonStyles.btn} ${addLessonStyles.btnSecondary}`}
                            onClick={handleDeleteResultsCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className={`${addLessonStyles.btn} ${addLessonStyles.btnSuccess}`}
                            onClick={handleDeleteResultsConfirm}
                            disabled={deletingResults}
                        >
                            {deletingResults ? 'Deleting...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>)}
        </main>
        <Footer/>
    </>);
};

export default QuizDetailTeacher;