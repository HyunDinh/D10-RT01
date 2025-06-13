import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const QuizDetailTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingResults, setDeletingResults] = useState(false);

  useEffect(() => {
    fetchQuiz();
    fetchStatistics();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/quizzes/${id}`, {
        withCredentials: true
      });
      setQuiz(res.data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin quiz');
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/quizzes/${id}/statistics`, {
        withCredentials: true
      });
      setStatistics(res.data);
    } catch (err) {
      console.error('Không thể tải thống kê:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quiz này?')) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/quizzes/${id}`, {
        withCredentials: true
      });
      navigate('/quizzes');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Không thể xóa quiz này vì đã có học sinh làm bài. Vui lòng xóa kết quả bài làm trước.');
      } else {
        setError('Không thể xóa quiz');
      }
      setDeleting(false);
    }
  };

  const handleDeleteResults = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả kết quả bài làm của quiz này?')) {
      return;
    }

    setDeletingResults(true);
    try {
      await axios.delete(`http://localhost:8080/api/quizzes/${id}/results`, {
        withCredentials: true
      });
      fetchStatistics(); // Refresh statistics after deleting results
      setDeletingResults(false);
    } catch (err) {
      setError('Không thể xóa kết quả bài làm');
      setDeletingResults(false);
    }
  };

  if (loading) return <div className="alert alert-info text-center">Đang tải...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!quiz) return null;

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{quiz.title}</h4>
            <div>
              <button 
                className="btn btn-light me-2"
                onClick={() => navigate(`/quizzes/${id}/edit`)}
              >
                Chỉnh sửa
              </button>
              {statistics && statistics.totalStudents > 0 && (
                <button 
                  className="btn btn-warning me-2"
                  onClick={handleDeleteResults}
                  disabled={deletingResults}
                >
                  {deletingResults ? 'Đang xóa...' : 'Xóa kết quả bài làm'}
                </button>
              )}
              <button 
                className="btn btn-danger me-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
              <button 
                className="btn btn-light"
                onClick={() => navigate('/quizzes')}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Thông tin cơ bản</h5>
              <p><strong>Mô tả:</strong> {quiz.description}</p>
              <p><strong>Thời gian làm bài:</strong> {quiz.timeLimit} phút</p>
              <p><strong>Tổng điểm:</strong> {quiz.totalPoints} điểm</p>
              <p><strong>Số câu hỏi:</strong> {quiz.questions.length} câu</p>
            </div>
            {statistics && (
              <div className="col-md-6">
                <h5>Thống kê</h5>
                <p><strong>Số học sinh đã làm:</strong> {statistics.totalStudents}</p>
                <p><strong>Điểm trung bình:</strong> {statistics.averageScore}</p>
                <p><strong>Tỷ lệ đạt:</strong> {statistics.passRate}%</p>
              </div>
            )}
          </div>

          <h5 className="mb-3">Danh sách câu hỏi</h5>
          {quiz.questions.map((question, index) => (
            <div key={question.questionId} className="card mb-4">
              <div className="card-body">
                <h6 className="card-title">
                  Câu {index + 1}: {question.questionText}
                </h6>
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
                    <div 
                      key={option.optionId} 
                      className={`mb-2 p-2 rounded ${
                        option.optionKey === question.correctOptionId 
                          ? 'bg-success text-white' 
                          : ''
                      }`}
                    >
                      {option.optionKey}. {option.optionText}{' '}
                      {option.optionKey === question.correctOptionId && (
                        <strong>(Đáp án đúng)</strong>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <span className="badge bg-info">
                    Điểm: {question.points} điểm
                  </span>
                  {statistics && statistics.questionStats[question.questionId] && (
                    <span className="ms-2 badge bg-secondary">
                      Tỷ lệ đúng: {statistics.questionStats[question.questionId].correctRate}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizDetailTeacher; 