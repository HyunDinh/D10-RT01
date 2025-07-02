import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/quiz/QuizDetail.module.css';
import addLessonStyles from '../../styles/lesson/AddLesson.module.css';

const QuizDetailTeacher = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deletingResults, setDeletingResults] = useState(false);
    const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
    const [showDeleteResultsModal, setShowDeleteResultsModal] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    useEffect(() => {
        fetchQuiz();
        fetchStatistics();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/quizzes/${id}`, {
                withCredentials: true,
            });
            setQuiz(res.data);
            setLoading(false);
            // Select the first question by default if available
            if (res.data.questions.length > 0) {
                setSelectedQuestionId(res.data.questions[0].questionId);
            }
        } catch (err) {
            setError('Không thể tải thông tin quiz');
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/quizzes/${id}/statistics`, {
                withCredentials: true,
            });
            setStatistics(res.data);
        } catch (err) {
            console.error('Không thể tải thống kê:', err);
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
                setError('Không thể xóa quiz này vì đã có học sinh làm bài. Vui lòng xóa kết quả bài làm trước.');
            } else {
                setError('Không thể xóa quiz');
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
            fetchStatistics(); // Refresh statistics after deleting results
            setDeletingResults(false);
        } catch (err) {
            setError('Không thể xóa kết quả bài làm');
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
            return '/images/default-quiz.jpg';
        }
        const fileName = questionImageUrl.split('/').pop();
        return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
    };

    const renderQuestionDetails = () => {
        if (!selectedQuestionId || !quiz) {
            return <div className={styles.noQuestion}>Vui lòng chọn một câu hỏi để xem chi tiết.</div>;
        }
        const question = quiz.questions.find((q) => q.questionId === selectedQuestionId);
        if (!question) {
            return <div className={styles.noQuestion}>Câu hỏi không tồn tại.</div>;
        }
        return (<div className={styles.questionDetail}>
            <div className={styles.quizDetailQuestionTitle}>
                Câu {quiz.questions.findIndex((q) => q.questionId === selectedQuestionId) + 1}: {question.questionText}
            </div>
            <img
                src={getQuizImageUrl(question.questionImageUrl)}
                alt="Ảnh minh họa"
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
                    {option.optionKey === question.correctOptionId && <strong>(Đáp án đúng)</strong>}
                </div>))}
            </div>
            <div style={{marginTop: 8}}>
                <span className={styles.quizDetailBadge}>Điểm: {question.points} điểm</span>
                {statistics && statistics.questionStats[question.questionId] && (
                    <span className={`${styles.quizDetailBadge} ${styles.secondary}`}>
              Tỷ lệ đúng: {statistics.questionStats[question.questionId].correctRate}%
            </span>)}
            </div>
        </div>);
    };

    if (loading) {
        return <div className={styles.quizDetailAlert}>Đang tải...</div>;
    }

    if (error) {
        return <div className={styles.quizDetailAlert}>{error}</div>;
    }

    if (!quiz) {
        return null;
    }

    return (<main className={styles.quizDetailContainer}>
        <div className={styles.quizDetailHeader}>
            <div className={styles.quizDetailTitle}>{quiz.title}</div>
            <div className={styles.quizDetailHeaderActions}>
                <button
                    className={styles.quizDetailBtn}
                    onClick={() => navigate(`/hocho/teacher/quizzes/${id}/edit`)}
                >
                    Chỉnh sửa
                </button>
                {statistics && statistics.totalStudents > 0 && (<button
                    className={`${styles.quizDetailBtn} ${styles.warning}`}
                    onClick={handleDeleteResultsClick}
                    disabled={deletingResults}
                >
                    {deletingResults ? 'Đang xóa...' : 'Xóa kết quả bài làm'}
                </button>)}
                <button
                    className={`${styles.quizDetailBtn} ${styles.danger}`}
                    onClick={handleDeleteQuizClick}
                    disabled={deleting}
                >
                    {deleting ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                    className={styles.quizDetailBtn}
                    onClick={() => navigate(`/hocho/teacher/quizzes?courseId=${courseId}`)}
                >
                    Quay lại
                </button>
            </div>
        </div>
        <div className={styles.quizDetailInfoRow}>
            <div className={styles.quizDetailInfoCol}>
                <div className={styles.quizDetailInfoTitle}>Thông tin cơ bản</div>
                <div className={styles.quizDetailInfoText}><strong>Mô tả:</strong> {quiz.description}</div>
                <div className={styles.quizDetailInfoText}><strong>Thời gian làm bài:</strong> {quiz.timeLimit} phút
                </div>
                <div className={styles.quizDetailInfoText}><strong>Tổng điểm:</strong> {quiz.totalPoints} điểm</div>
                <div className={styles.quizDetailInfoText}><strong>Số câu hỏi:</strong> {quiz.questions.length} câu
                </div>
            </div>
            {statistics && (<div className={styles.quizDetailInfoCol}>
                <div className={styles.quizDetailInfoTitle}>Thống kê</div>
                <div className={styles.quizDetailInfoText}><strong>Số học sinh đã
                    làm:</strong> {statistics.totalStudents}</div>
                <div className={styles.quizDetailInfoText}><strong>Điểm trung
                    bình:</strong> {statistics.averageScore}</div>
                <div className={styles.quizDetailInfoText}><strong>Tỷ lệ đạt:</strong> {statistics.passRate}%
                </div>
            </div>)}
        </div>

        <div className={styles.splitContainer}>
            {/* Left Side: Question List */}
            <div className={styles.questionList}>
                <h3 className={styles.questionListTitle}>Danh sách câu hỏi</h3>
                {quiz.questions.length === 0 ? (<div className={styles.noQuestion}>Không có câu hỏi nào.</div>) : (
                    <ul className={styles.questionItems}>
                        {quiz.questions.map((question, index) => (<li
                            key={question.questionId}
                            className={`${styles.questionItem} ${selectedQuestionId === question.questionId ? styles.questionItemActive : ''}`}
                            onClick={() => handleQuestionClick(question.questionId)}
                        >
                            <div className={styles.quizDetailQuestionTitle}>
                                Câu {index + 1}: {question.questionText}
                            </div>
                        </li>))}
                    </ul>)}
            </div>

            {/* Right Side: Question Details */}
            <div className={styles.questionDetailContainer}>
                <h3 className={styles.questionListTitle}>Chi tiết câu hỏi</h3>
                {renderQuestionDetails()}
            </div>
        </div>

        {showDeleteQuizModal && (<div className={addLessonStyles.modal}>
            <div className={addLessonStyles.modalContent}>
                <div className={addLessonStyles.modalHeader}>
                    <h5>Xác nhận xóa quiz</h5>
                    <button
                        className={addLessonStyles.modalClose}
                        onClick={handleDeleteQuizCancel}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className={addLessonStyles.modalBody}>
                    <p>Bạn có chắc chắn muốn xóa quiz này không?</p>
                </div>
                <div className={addLessonStyles.modalFooter}>
                    <button
                        className={`${addLessonStyles.btn} ${addLessonStyles.btnSecondary}`}
                        onClick={handleDeleteQuizCancel}
                    >
                        Hủy
                    </button>
                    <button
                        className={`${addLessonStyles.btn} ${addLessonStyles.btnSuccess}`}
                        onClick={handleDeleteQuizConfirm}
                        disabled={deleting}
                    >
                        {deleting ? 'Đang xóa...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>)}

        {showDeleteResultsModal && (<div className={addLessonStyles.modal}>
            <div className={addLessonStyles.modalContent}>
                <div className={addLessonStyles.modalHeader}>
                    <h5>Xác nhận xóa kết quả bài làm</h5>
                    <button
                        className={addLessonStyles.modalClose}
                        onClick={handleDeleteResultsCancel}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className={addLessonStyles.modalBody}>
                    <p>Bạn có chắc chắn muốn xóa tất cả kết quả bài làm của quiz này?</p>
                </div>
                <div className={addLessonStyles.modalFooter}>
                    <button
                        className={`${addLessonStyles.btn} ${addLessonStyles.btnSecondary}`}
                        onClick={handleDeleteResultsCancel}
                    >
                        Hủy
                    </button>
                    <button
                        className={`${addLessonStyles.btn} ${addLessonStyles.btnSuccess}`}
                        onClick={handleDeleteResultsConfirm}
                        disabled={deletingResults}
                    >
                        {deletingResults ? 'Đang xóa...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>)}
    </main>);
};

export default QuizDetailTeacher;