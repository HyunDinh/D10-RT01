import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
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
        childId: localStorage.getItem('userId'), // Lấy userId từ localStorage
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId
        }))
      };

      await axios.post(`http://localhost:8080/api/quizzes/${id}/submit`, submission, {
        withCredentials: true
      });

      navigate(`/quizzes/${id}/result`);
    } catch (err) {
      setError('Không thể nộp bài');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="alert alert-info text-center">Đang tải...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!quiz) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{quiz.title}</h4>
            <div className="h4 mb-0">
              Thời gian: {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="card-text">{quiz.description}</p>
          <div className="mb-4">
            <small className="text-muted">
              Tổng điểm: {quiz.totalPoints} điểm | Số câu hỏi: {quiz.questions.length} câu
            </small>
          </div>

          {quiz.questions.map((question, index) => (
            <div key={question.questionId} className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">
                  Câu {index + 1}: {question.questionText}
                </h5>
                {question.questionImageUrl && (
                  <img 
                    src={`http://localhost:8080${question.questionImageUrl}`} 
                    alt="Ảnh minh họa" 
                    className="img-fluid rounded mb-3" 
                    style={{maxHeight: 200}} 
                  />
                )}
                <div className="ms-3">
                  {question.options.map(option => (
                    <div key={option.optionId} className="form-check mb-2">
                      <input
                        type="radio"
                        className="form-check-input"
                        name={`question-${question.questionId}`}
                        value={option.optionKey}
                        checked={answers[question.questionId] === option.optionKey}
                        onChange={() => handleAnswerChange(question.questionId, option.optionKey)}
                      />
                      <label className="form-check-label">
                        {option.optionKey}. {option.optionText}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="text-muted mt-2">
                  Điểm: {question.points} điểm
                </div>
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted">
              Đã trả lời: {Object.keys(answers).length}/{quiz.questions.length} câu
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail; 