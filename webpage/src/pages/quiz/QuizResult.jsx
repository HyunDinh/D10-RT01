import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/quiz/QuizResult.module.css';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const QuizResult = () => {
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
                console.error('Error fetching user profile in QuizResult:', err);
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
    }, [id, userId]);

    const fetchResult = async () => {
        if (!userId) {
            setError('Student ID not found. Please log in.');
            setLoading(false);
            return;
        }

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
            return '/avaBack.jpg';
        }
        const fileName = questionImageUrl.split('/').pop();
        return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
    };

    if (loading) return <div className={styles.quizDetailAlert}>Loading...</div>;
    if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
    if (!result) return null;

    return (<><Header/>
        <div className={styles.quizResultContainer}>
            <div className={styles.quizResultHeader}>
                <h1 className={styles.quizResultTitle}>Quiz Result</h1>
            </div>
            <div className={styles.quizResultBody}>
                <div className={styles.quizResultInfoRow}>
                    <div className={styles.quizResultInfoCol}>
                        <h2 className={styles.quizResultInfoTitle}>Submission Info</h2>
                        <p className={styles.quizResultInfoText}>
                            <strong>Title:</strong> {result.quiz.title}
                        </p>
                        <p className={styles.quizResultInfoText}>
                            <strong>Score:</strong> {result.score}/{result.quiz.totalPoints}
                        </p>
                        <p className={styles.quizResultInfoText}>
                            <strong>Submitted at:</strong> {new Date(result.submittedAt).toLocaleString()}
                        </p>
                    </div>
                    <div className={styles.quizResultInfoCol}>
                        <h2 className={styles.quizResultInfoTitle}>Completion Rate</h2>
                        <div className={styles.progressBarContainer}>
                            <div
                                className={styles.progressBar}
                                style={{width: `${(result.score / result.quiz.totalPoints) * 100}%`}}
                            >
                                {Math.round((result.score / result.quiz.totalPoints) * 100)}%
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className={styles.quizResultQuestionListTitle}>Submission Details</h2>
                {result.answers.map((answer, index) => (
                    <div key={answer.answerId} className={styles.quizResultQuestionCard}>
                        <h3 className={styles.quizResultQuestionTitle}>
                            Question {index + 1}: {answer.question.questionText}
                        </h3>
                        {answer.question.questionImageUrl && answer.question.questionImageUrl !== 'none' && (<img
                            src={getQuizImageUrl(answer.question.questionImageUrl)}
                            alt={`Image for question ${index + 1}`}
                            className={styles.quizResultQuestionImage}
                            onError={(e) => (e.target.src = '/images/default-quiz.jpg')}
                        />)}
                        <div className={styles.quizResultOptions}>
                            {answer.question.options.map((option) => {
                                const isSelected = option.optionId === answer.selectedOptionId;
                                const isCorrect = option.optionId === answer.question.correctOptionId;
                                const optionClass = `${styles.quizResultOption} ${isSelected ? (isCorrect ? styles.correct : styles.incorrect) : isCorrect ? styles.correct : ''}`;
                                return (<div key={option.optionId} className={optionClass}>
                                    {option.optionKey}. {option.optionText}
                                </div>);
                            })}
                        </div>
                        <span
                            className={`${styles.quizResultBadge} ${answer.isCorrect ? '' : styles.secondary}`}
                            aria-label={answer.isCorrect ? 'Correct answer' : 'Incorrect answer'}
                        >
              {answer.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
                    </div>))}

                <div className={styles.quizResultFooter}>
                    <button
                        className={styles.quizResultBtn}
                        onClick={() => navigate(`/hocho/quizzes/${id}/do`)}
                        aria-label="Retake quiz"
                    >
                        Retake Quiz
                    </button>
                </div>
            </div>
        </div>
        <Footer/>
    </>);
};

export default QuizResult; 