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
            return '/images/default-quiz.jpg';
        }
        // Extract filename from questionImageUrl (e.g., "/quiz/filename.jpg" -> "filename.jpg")
        const fileName = questionImageUrl.split('/').pop();
        return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
    };

    if (loading) return <div className={styles.quizDetailAlert}>Loading...</div>;
    if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
    if (!result) return null;

    return (
        <div className={styles.quizDetailContainer}>
            <div className={styles.quizDetailHeader}>
                <div className={styles.quizDetailTitle}>Review Submission</div>
            </div>
            <div className={styles.quizDetailBody}>
                <div className={styles.quizDetailInfoRow}>
                    <div className={styles.quizDetailInfoCol}>
                        <div className={styles.quizDetailInfoTitle}>Submission Info</div>
                        <div className={styles.quizDetailInfoText}><strong>Title:</strong> {result.quiz.title}</div>
                        <div className={styles.quizDetailInfoText}><strong>Score:</strong> {result.score}/{result.quiz.totalPoints}</div>
                        <div className={styles.quizDetailInfoText}><strong>Submitted at:</strong> {new Date(result.submittedAt).toLocaleString()}</div>
                    </div>
                    <div className={styles.quizDetailInfoCol}>
                        <div className={styles.quizDetailInfoTitle}>Completion Rate</div>
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

                <div className={styles.quizDetailQuestionListTitle}>Submission Details</div>
                {result.answers.map((answer, index) => (
                    <div key={answer.answerId} className={styles.quizDetailQuestionCard}>
                        <div className={styles.quizDetailQuestionTitle}>
                            Question {index + 1}: {answer.question.questionText}
                        </div>
                        <img
                            src={getQuizImageUrl(answer.question.questionImageUrl)}
                            alt="Illustration image"
                            className={styles.quizDetailQuestionImage}
                            onError={e => (e.target.src = '/images/default-quiz.jpg')}
                            style={{ display: answer.question.questionImageUrl ? 'block' : 'none' }}
                        />
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
                                {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            <span className={styles.quizDetailInfoText} style={{marginLeft: 12}}>
                                Score: {answer.isCorrect ? answer.question.points : 0}/{answer.question.points}
                            </span>
                        </div>
                        {!answer.isCorrect && (
                            <div style={{marginTop: 8, color: '#e53e3e', fontSize: '0.98rem'}}>
                                <small>Correct answer: {answer.question.correctOptionId}</small>
                            </div>
                        )}
                    </div>
                ))}

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 32}}>
                    <button
                        className={styles.quizDetailBtn}
                        onClick={() => navigate(`/hocho/quizzes/${id}/do`)}
                    >
                        Retake Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizReview; 