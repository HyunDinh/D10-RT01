import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/quiz/QuizReview.module.css';

const QuizReview = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const profileResponse = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
                setUserId(profileResponse.data.id);
            } catch (err) {
                setError('Cannot get user information. Please log in.');
                setLoading(false);
            }
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchResult();
        }
        // eslint-disable-next-line
    }, [id, userId]);

    const fetchResult = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/quizzes/${id}/child/${userId}/result`, {
                withCredentials: true
            });
            setResult(res.data);
            setLoading(false);
        } catch (err) {
            setError('Cannot load quiz result');
            setLoading(false);
        }
    };

    const getQuizImageUrl = (questionImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!questionImageUrl || questionImageUrl === 'none') {
            return '/default.jpg';
        }
        // Extract filename from questionImageUrl (e.g., "/quiz/filename.jpg" -> "filename.jpg")
        const fileName = questionImageUrl.split('/').pop();
        return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
    };

    if (loading) return <div className={styles.quizDetailAlert}>Loading...</div>;
    if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
    if (!result) return null;

    return (<div className={styles.reviewSubmissionContainer}>
        <div className={styles.reviewSubmissionHeader}>
            <h1 className={styles.reviewSubmissionTitle}>Xem lại bài nộp</h1>
        </div>
        <div className={styles.reviewSubmissionBody}>
            <div className={styles.reviewSubmissionInfoRow}>
                <div className={styles.reviewSubmissionInfoCol}>
                    <h2 className={styles.reviewSubmissionInfoTitle}>Thông tin bài nộp</h2>
                    <p className={styles.reviewSubmissionInfoText}>
                        <strong>Tiêu đề:</strong> {result.quiz.title}
                    </p>
                    <p className={styles.reviewSubmissionInfoText}>
                        <strong>Điểm số:</strong> {result.score}/{result.quiz.totalPoints}
                    </p>
                    <p className={styles.reviewSubmissionInfoText}>
                        <strong>Thời gian nộp:</strong> {new Date(result.submittedAt).toLocaleString()}
                    </p>
                </div>
                <div className={styles.reviewSubmissionInfoCol}>
                    <h2 className={styles.reviewSubmissionInfoTitle}>Tỷ lệ hoàn thành</h2>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={`${styles.progressBar} ${result.score < result.quiz.totalPoints * 0.6 ? styles.progressBarLow : ''}`}
                            style={{width: `${(result.score / result.quiz.totalPoints) * 100}%`}}
                        >
                            {Math.round((result.score / result.quiz.totalPoints) * 100)}%
                        </div>
                    </div>
                </div>
            </div>

            <h2 className={styles.reviewSubmissionQuestionListTitle}>Chi tiết bài nộp</h2>
            {result.answers.map((answer, index) => (
                <div key={answer.answerId} className={styles.reviewSubmissionQuestionCard}>
                    <h3 className={styles.reviewSubmissionQuestionTitle}>
                        Câu {index + 1}: {answer.question.questionText}
                    </h3>
                    {answer.question.questionImageUrl && answer.question.questionImageUrl !== 'none' && (<img
                        src={getQuizImageUrl(answer.question.questionImageUrl)}
                        alt={`Ảnh minh họa cho câu hỏi ${index + 1}`}
                        className={styles.reviewSubmissionQuestionImage}
                        onError={(e) => (e.target.src = '/default.jpg')}
                    />)}
                    <div className={styles.reviewSubmissionOptions}>
                        {answer.question.options.map((option) => {
                            const isSelected = option.optionId === answer.selectedOptionId;
                            const isCorrect = option.optionId === answer.question.correctOptionId;
                            const optionClass = `${styles.reviewSubmissionOption} ${isSelected ? (isCorrect ? styles.correct : styles.incorrect) : isCorrect ? styles.correct : ''}`;
                            return (<div key={option.optionId} className={optionClass}>
                                {option.optionKey}. {option.optionText}
                            </div>);
                        })}
                    </div>
                    <div className={styles.reviewSubmissionQuestionFooter}>
              <span
                  className={`${styles.reviewSubmissionBadge} ${answer.isCorrect ? '' : styles.secondary}`}
                  aria-label={answer.isCorrect ? 'Đáp án đúng' : 'Đáp án sai'}
              >
                {answer.isCorrect ? 'Đúng' : 'Sai'}
              </span>
                        <span className={styles.reviewSubmissionInfoText}>
                Điểm: {answer.isCorrect ? answer.question.points : 0}/{answer.question.points}
              </span>
                        {!answer.isCorrect && (<small className={styles.correctAnswerText}>
                            Đáp án
                            đúng: {answer.question.options.find((opt) => opt.optionId === answer.question.correctOptionId)?.optionKey}
                        </small>)}
                    </div>
                </div>))}

            <div className={styles.reviewSubmissionFooter}>
                <button
                    className={styles.reviewSubmissionBtn}
                    onClick={() => navigate(`/hocho/quizzes/${id}/do`)}
                    aria-label="Thử lại bài kiểm tra"
                >
                    Thử lại Quiz
                </button>
            </div>
        </div>
    </div>);
};

export default QuizReview; 