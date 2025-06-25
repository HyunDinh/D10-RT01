import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/quiz/QuizDetail.module.css';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchQuiz();
    axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true })
        .then(res => setUserId(res.data.id))
        .catch(() => setUserId(''));
  }, [id]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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
        withCredentials: true
      });
      setQuiz(res.data);
      setTimeLeft(res.data.timeLimit * 60); // Chuyển phút thành giây
      setLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin quiz');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Kiểm tra đã trả lời hết chưa
    const unanswered = quiz.questions.filter(q => !answers[q.questionId]);
    if (unanswered.length > 0) {
      if (!window.confirm(`Bạn còn ${unanswered.length} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const submission = {
        childId: userId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId
        }))
      };

      await axios.post(`http://localhost:8080/api/quizzes/${id}/submit`, submission, {
        withCredentials: true
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
      return '/images/default-quiz.jpg';
    }
    // Extract filename from questionImageUrl (e.g., "/quiz/filename.jpg" -> "filename.jpg")
    const fileName = questionImageUrl.split('/').pop();
    return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
  };

  if (loading) return <div className={styles.quizDetailAlert}>Đang tải...</div>;
  if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
  if (!quiz) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
      <div className={styles.quizDetailContainer}>
        <div className={styles.quizDetailHeader}>
          <div className={styles.quizDetailTitle}>{quiz.title}</div>
          <div className={styles.quizDetailHeaderActions}>
            <div style={{fontWeight: 600, fontSize: '1.1rem'}}>Thời gian: {formatTime(timeLeft)}</div>
          </div>
        </div>
        <div className={styles.quizDetailBody}>
          <div className={styles.quizDetailInfoText}>{quiz.description}</div>
          <div className={styles.quizDetailInfoText} style={{marginBottom: 18}}>
            Tổng điểm: {quiz.totalPoints} điểm | Số câu hỏi: {quiz.questions.length} câu
          </div>

          {quiz.questions.map((question, index) => (
              <div key={question.questionId} className={styles.quizDetailQuestionCard}>
                <div className={styles.quizDetailQuestionTitle}>
                  Câu {index + 1}: {question.questionText}
                </div>
                <img
                    src={getQuizImageUrl(question.questionImageUrl)}
                    alt="Ảnh minh họa"
                    className={styles.quizDetailQuestionImage}
                    onError={e => (e.target.src = '/images/default-quiz.jpg')}
                    style={{ display: question.questionImageUrl ? 'block' : 'none' }}
                />
                <div>
                  {question.options.map(option => (
                      <label key={option.optionId} className={styles.quizDetailOption} style={{display: 'block', cursor: 'pointer'}}>
                        <input
                            type="radio"
                            style={{marginRight: 8}}
                            name={`question-${question.questionId}`}
                            value={option.optionKey}
                            checked={answers[question.questionId] === option.optionKey}
                            onChange={() => handleAnswerChange(question.questionId, option.optionKey)}
                        />
                        {option.optionKey}. {option.optionText}
                      </label>
                  ))}
                </div>
                <div className={styles.quizDetailBadge}>
                  Điểm: {question.points} điểm
                </div>
              </div>
          ))}

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24}}>
            <div className={styles.quizDetailInfoText}>
              Đã trả lời: {Object.keys(answers).length}/{quiz.questions.length} câu
            </div>
            <button
                className={styles.quizDetailBtn}
                onClick={handleSubmit}
                disabled={submitting}
            >
              {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default QuizDetail; 