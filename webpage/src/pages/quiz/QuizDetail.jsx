import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/quiz/QuizDetail.module.css';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const QuizDetail = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState('');
    const [selectedQuestionId, setSelectedQuestionId] = useState(null); // Added state

    useEffect(() => {
        fetchQuiz();
        axios
            .get('http://localhost:8080/api/hocho/profile', {withCredentials: true})
            .then((res) => setUserId(res.data.id))
            .catch(() => setUserId(''));
    }, [id]);

    useEffect(() => {
        if (timeLeft === null) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchQuiz = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/quizzes/${id}`, {
                withCredentials: true,
            });
            setQuiz(res.data);
            setTimeLeft(res.data.timeLimit * 60); // Convert minutes to seconds
            setSelectedQuestionId(res.data.questions[0]?.questionId || null); // Set first question as default
            setLoading(false);
        } catch (err) {
            setError('Không thể tải thông tin quiz');
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, optionId) => {
        setAnswers((prev) => ({
            ...prev, [questionId]: optionId,
        }));
    };

    const handleQuestionSelect = (questionId) => {
        setSelectedQuestionId(questionId);
    };

    const handleSubmit = async () => {
        if (submitting) return;

        const unanswered = quiz.questions.filter((q) => !answers[q.questionId]);
        if (unanswered.length > 0) {
            if (!window.confirm(`Bạn còn ${unanswered.length} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
                return;
            }
        }

        setSubmitting(true);
        try {
            const submission = {
                childId: userId, answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
                    questionId, selectedOptionId,
                })),
            };

            await axios.post(`http://localhost:8080/api/quizzes/${id}/submit`, submission, {
                withCredentials: true,
            });

            navigate(`/hocho/quizzes/${id}/result`);
        } catch (err) {
            setError('Không thể nộp bài');
            setSubmitting(false);
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

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className={styles.quizDetailAlert}>Đang tải...</div>;
    if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
    if (!quiz) return null;

    const selectedQuestion = quiz.questions.find((q) => q.questionId === selectedQuestionId);

    return (<>
        <Header/>

        <div className={styles.quizDetailContainer}>
            <div className={styles.quizDetailHeader}>
                <h1 className={styles.quizDetailTitle}>{quiz.title}</h1>
                <div className={styles.quizDetailHeaderActions}>
                    <span className={styles.timer}>Thời gian: {formatTime(timeLeft)}</span>
                </div>
            </div>
            <div className={styles.quizDetailBody}>
                <p className={styles.quizDetailInfoText}>{quiz.description}</p>
                <p className={styles.quizDetailInfoText}>
                    Tổng điểm: {quiz.totalPoints} điểm | Số câu hỏi: {quiz.questions.length} câu
                </p>

                <div className={styles.quizContent}>
                    {/* Left Column: Question List */}
                    <div className={styles.questionList}>
                        {quiz.questions.map((question, index) => (<button
                            key={question.questionId}
                            className={`${styles.questionItem} ${selectedQuestionId === question.questionId ? styles.questionItemActive : ''} ${answers[question.questionId] ? styles.questionItemAnswered : ''}`}
                            onClick={() => handleQuestionSelect(question.questionId)}
                            aria-label={`Chọn câu hỏi ${index + 1}`}
                        >
                            Câu {index + 1}
                        </button>))}
                    </div>

                    {/* Right Column: Question Details */}
                    <div className={styles.questionDetails}>
                        {selectedQuestion ? (<div className={styles.quizDetailQuestionCard}>
                            <h2 className={styles.quizDetailQuestionTitle}>
                                Câu {quiz.questions.findIndex((q) => q.questionId === selectedQuestionId) + 1}:{' '}
                                {selectedQuestion.questionText}
                            </h2>
                            {selectedQuestion.questionImageUrl && selectedQuestion.questionImageUrl !== 'none' && (<img
                                src={getQuizImageUrl(selectedQuestion.questionImageUrl)}
                                alt={`Ảnh minh họa cho câu hỏi ${quiz.questions.findIndex((q) => q.questionId === selectedQuestionId) + 1}`}
                                className={styles.quizDetailQuestionImage}
                                onError={(e) => (e.target.src = '/avaBack.jpg')}
                            />)}
                            <div className={styles.quizDetailOptions}>
                                {selectedQuestion.options.map((option) => (
                                    <label key={option.optionId} className={styles.quizDetailOption}>
                                        <input
                                            type="radio"
                                            name={`question-${selectedQuestion.questionId}`}
                                            value={option.optionKey}
                                            checked={answers[selectedQuestion.questionId] === option.optionKey}
                                            onChange={() => handleAnswerChange(selectedQuestion.questionId, option.optionKey)}
                                            className={styles.quizDetailRadio}
                                            aria-label={`Chọn đáp án ${option.optionKey} cho câu hỏi ${quiz.questions.findIndex((q) => q.questionId === selectedQuestionId) + 1}`}
                                        />
                                        <span>
                        {option.optionKey}. {option.optionText}
                      </span>
                                    </label>))}
                            </div>
                            <span className={styles.quizDetailBadge}>Điểm: {selectedQuestion.points} điểm</span>
                        </div>) : (<p className={styles.quizDetailInfoText}>Vui lòng chọn một câu hỏi để xem chi
                            tiết.</p>)}
                    </div>
                </div>

                <div className={styles.quizDetailFooter}>
          <span className={styles.quizDetailInfoText}>
            Đã trả lời: {Object.keys(answers).length}/{quiz.questions.length} câu
          </span>
                    <button
                        className={styles.quizDetailBtn}
                        onClick={handleSubmit}
                        disabled={submitting}
                        aria-label="Nộp bài kiểm tra"
                    >
                        {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
                    </button>
                </div>
            </div>
        </div>
        <Footer/>
    </>);
};

export default QuizDetail;