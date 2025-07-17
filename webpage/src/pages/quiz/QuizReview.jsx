import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/quiz/QuizReview.module.css';
import { askGemini } from '../../api/gemini';

const QuizReview = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    // Thêm state lưu giải thích AI cho từng câu
    const [aiExplanations, setAiExplanations] = useState({});
    const [aiLoading, setAiLoading] = useState({});
    const [aiError, setAiError] = useState({});

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

    // Hàm hỏi AI giải thích cho 1 câu hỏi
    const handleAskAI = async (answer, index) => {
        const q = answer.question;
        // Gửi cả nội dung câu hỏi và các đáp án lên AI, yêu cầu KHÔNG dùng markdown, ký tự đặc biệt
        let prompt = `Hãy giải thích và trả lời cho câu hỏi sau bằng tiếng Việt, trình bày ngắn gọn, rõ ràng, KHÔNG sử dụng định dạng markdown, không dùng ký tự đặc biệt như *, #, hoặc các ký hiệu đầu dòng. Chỉ trả về văn bản thuần túy.\nCâu hỏi: ${q.questionText}\nCác lựa chọn:\n`;
        q.options.forEach(opt => {
            prompt += `${opt.optionKey}. ${opt.optionText}\n`;
        });
        if (q.correctOptionId) {
            const correct = q.options.find(opt => opt.optionKey === q.correctOptionId);
            if (correct) prompt += `\nĐáp án đúng: ${correct.optionKey}. ${correct.optionText}`;
        }
        setAiLoading(prev => ({ ...prev, [index]: true }));
        setAiError(prev => ({ ...prev, [index]: '' }));
        setAiExplanations(prev => ({ ...prev, [index]: '' }));
        try {
            const res = await askGemini(prompt);
            let text = '';
            try {
                const obj = JSON.parse(res);
                if (obj.candidates && obj.candidates[0] && obj.candidates[0].content && obj.candidates[0].content.parts && obj.candidates[0].content.parts[0].text) {
                    text = obj.candidates[0].content.parts[0].text;
                } else {
                    text = '[Không tìm thấy giải thích phù hợp từ AI]';
                }
            } catch (e) {
                text = '[Không thể phân tích kết quả từ AI]';
            }
            setAiExplanations(prev => ({ ...prev, [index]: text }));
        } catch (e) {
            setAiError(prev => ({ ...prev, [index]: e.message }));
        } finally {
            setAiLoading(prev => ({ ...prev, [index]: false }));
        }
    };

    if (loading) return <div className={styles.quizDetailAlert}>Loading...</div>;
    if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
    if (!result) return null;

    return (<div className={styles.reviewSubmissionContainer}>
        <div className={styles.reviewSubmissionHeader}>
            <button
                className={styles.reviewSubmissionBtn}
                style={{marginBottom: 16, background: '#f3f4f6', color: '#1e293b'}}
                onClick={() => navigate(`/hocho/child/course/${result.quiz.course.courseId}/learning`)}
            >
                ← Quay lại khóa học
            </button>
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
                            const isSelected = option.optionKey === answer.selectedOptionId;
                            let optionClass = styles.reviewSubmissionOption;
                            if (isSelected) {
                              optionClass += ` ${styles.selectedOption}`;
                            }
                            return (
                                <div key={option.optionId} className={optionClass}>
                                    {option.optionKey}. {option.optionText}
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles.reviewSubmissionQuestionFooter}>
                        <span className={styles.reviewSubmissionInfoText}>
                Điểm: {answer.isCorrect ? answer.question.points : 0}/{answer.question.points}
              </span>
                        {!answer.isCorrect && (
                            <small className={styles.correctAnswerText}>
                                Đáp án đúng: {
                                    (() => {
                                        const correct = answer.question.options.find(opt => opt.optionKey === answer.question.correctOptionId);
                                        return correct ? `${correct.optionKey}. ${correct.optionText}` : '';
                                    })()
                                }
                            </small>
                        )}
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <button
                            onClick={() => handleAskAI(answer, index)}
                            disabled={aiLoading[index]}
                            style={{
                                padding: '6px 18px',
                                borderRadius: 20,
                                background: aiLoading[index] ? '#a5b4fc' : '#2563eb',
                                color: '#fff',
                                border: 'none',
                                cursor: aiLoading[index] ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                                transition: 'background 0.2s',
                            }}
                            onMouseOver={e => { if (!aiLoading[index]) e.currentTarget.style.background = '#1d4ed8'; }}
                            onMouseOut={e => { if (!aiLoading[index]) e.currentTarget.style.background = '#2563eb'; }}
                        >
                            <span style={{ fontSize: 20 }}>🤖</span>
                            {aiLoading[index] ? 'Đang hỏi AI...' : 'Hỏi AI giải thích'}
                        </button>
                        {aiError[index] && <div style={{ color: 'red', marginTop: 4 }}>{aiError[index]}</div>}
                        {aiExplanations[index] && (
                            <div style={{ background: '#f7f7f7', marginTop: 8, padding: 12, borderRadius: 4, whiteSpace: 'pre-wrap' }}>
                                <b>AI giải thích:</b><br />{aiExplanations[index]}
                            </div>
                        )}
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