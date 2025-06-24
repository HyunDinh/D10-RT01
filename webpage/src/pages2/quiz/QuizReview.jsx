import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useParams, useNavigate} from 'react-router-dom';
import styles from '../../styles/quiz/QuizDetail.module.css';

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
                setError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập.');
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
            setError('Không thể tải kết quả bài làm');
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.quizDetailAlert}>Đang tải...</div>;
    if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
    if (!result) return null;

    return (
        <div className={styles.quizDetailContainer}>
            <div className={styles.quizDetailHeader}>
                <div className={styles.quizDetailTitle}>Xem lại bài làm</div>
            </div>
            <div className={styles.quizDetailBody}>
                <div className={styles.quizDetailInfoRow}>
                    <div className={styles.quizDetailInfoCol}>
                        <div className={styles.quizDetailInfoTitle}>Thông tin bài làm</div>
                        <div className={styles.quizDetailInfoText}><strong>Tiêu đề:</strong> {result.quiz.title}</div>
                        <div className={styles.quizDetailInfoText}><strong>Điểm số:</strong> {result.score}/{result.quiz.totalPoints}</div>
                        <div className={styles.quizDetailInfoText}><strong>Thời gian nộp:</strong> {new Date(result.submittedAt).toLocaleString()}</div>
                    </div>
                    <div className={styles.quizDetailInfoCol}>
                        <div className={styles.quizDetailInfoTitle}>Tỷ lệ hoàn thành</div>
                        <div style={{marginTop: 12}}>
                            <div style={{background: '#e3e9f7', borderRadius: 8, height: 30, width: '100%', overflow: 'hidden'}}>
                                <div style={{
                                    width: `${(result.score / result.quiz.totalPoints) * 100}%`,
                                    background: result.score >= result.quiz.totalPoints * 0.6 ? '#38a169' : '#e53e3e',
                                    height: '100%',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    borderRadius: 8,
                                    transition: 'width 0.4s'
                                }}>
                                    {Math.round((result.score / result.quiz.totalPoints) * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.quizDetailQuestionListTitle}>Chi tiết bài làm</div>
                {result.answers.map((answer, index) => (
                    <div key={answer.answerId} className={styles.quizDetailQuestionCard}>
                        <div className={styles.quizDetailQuestionTitle}>
                            Câu {index + 1}: {answer.question.questionText}
                        </div>
                        {answer.question.questionImageUrl && (
                            <img
                                src={`http://localhost:8080${answer.question.questionImageUrl}`}
                                alt="Ảnh minh họa"
                                className={styles.quizDetailQuestionImage}
                            />
                        )}
                        <div>
                            {answer.question.options.map(option => {
                                let optionClass = styles.quizDetailOption;
                                if (option.optionId === answer.selectedOptionId) {
                                    optionClass += ' ' + (option.optionId === answer.question.correctOptionId ? styles.correct : styles.incorrect);
                                } else if (option.optionId === answer.question.correctOptionId) {
                                    optionClass += ' ' + styles.correct;
                                }
                                return (
                                    <div key={option.optionId} className={optionClass}>
                                        {option.optionKey}. {option.optionText}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{marginTop: 8}}>
                            <span className={answer.isCorrect ? styles.quizDetailBadge : styles.quizDetailBadge + ' ' + styles.secondary}>
                                {answer.isCorrect ? 'Đúng' : 'Sai'}
                            </span>
                            <span className={styles.quizDetailInfoText} style={{marginLeft: 12}}>
                                Điểm: {answer.isCorrect ? answer.question.points : 0}/{answer.question.points}
                            </span>
                        </div>
                        {!answer.isCorrect && (
                            <div style={{marginTop: 8, color: '#e53e3e', fontSize: '0.98rem'}}>
                                <small>Đáp án đúng: {answer.question.correctOptionId}</small>
                            </div>
                        )}
                    </div>
                ))}

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 32}}>
                    <button
                        className={styles.quizDetailBtn}
                        onClick={() => navigate(`/hocho/quizzes/${id}/do`)}
                    >
                        Làm lại bài
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizReview; 