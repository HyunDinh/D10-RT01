import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const QuizResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const childId = localStorage.getItem('userId'); // Lấy childId từ localStorage
      
      if (!childId) {
        setError('Không tìm thấy ID học sinh. Vui lòng đăng nhập.');
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:8080/api/quizzes/${id}/child/${childId}/result`, {
        withCredentials: true
      });
      setResult(res.data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải kết quả bài làm');
      setLoading(false);
    }
  };

  if (loading) return <div className="alert alert-info text-center">Đang tải...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!result) return null;

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Kết quả bài làm</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Thông tin bài làm</h5>
              <p><strong>Tiêu đề:</strong> {result.quiz.title}</p>
              <p><strong>Điểm số:</strong> {result.score}/{result.quiz.totalPoints}</p>
              <p><strong>Thời gian nộp:</strong> {new Date(result.submittedAt).toLocaleString()}</p>
            </div>
            <div className="col-md-6">
              <div className="progress" style={{height: '30px'}}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{
                    width: `${(result.score / result.quiz.totalPoints) * 100}%`,
                    backgroundColor: result.score >= result.quiz.totalPoints * 0.6 ? '#28a745' : '#dc3545'
                  }}
                >
                  {Math.round((result.score / result.quiz.totalPoints) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <h5 className="mb-3">Chi tiết bài làm</h5>
          {result.answers.map((answer, index) => (
            <div key={answer.answerId} className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">
                  Câu {index + 1}: {answer.question.questionText}
                </h6>
                {answer.question.questionImageUrl && (
                  <img 
                    src={`http://localhost:8080${answer.question.questionImageUrl}`} 
                    alt="Ảnh minh họa" 
                    className="img-fluid rounded mb-3" 
                    style={{maxHeight: 200}} 
                  />
                )}
                <div className="ms-3">
                  {answer.question.options.map(option => (
                    <div 
                      key={option.optionId} 
                      className={`mb-2 p-2 rounded ${
                        option.optionId === answer.selectedOptionId 
                          ? option.optionId === answer.question.correctOptionId
                            ? 'bg-success text-white'
                            : 'bg-danger text-white'
                          : option.optionId === answer.question.correctOptionId
                            ? 'bg-success text-white'
                            : ''
                      }`}
                    >
                      {option.optionKey}. {option.optionText}
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <span className={`badge ${answer.isCorrect ? 'bg-success' : 'bg-danger'}`}>
                    {answer.isCorrect ? 'Đúng' : 'Sai'}
                  </span>
                  <span className="ms-2 text-muted">
                    Điểm: {answer.isCorrect ? answer.question.points : 0}/{answer.question.points}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-between mt-4">
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/quizzes')}
            >
              Quay lại danh sách
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(`/quizzes/${id}/do`)}
            >
              Làm lại bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult; 