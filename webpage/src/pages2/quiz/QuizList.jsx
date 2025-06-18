import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes(); 
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/quizzes', {
        withCredentials: true
      });
      if (Array.isArray(res.data)) {
        setQuizzes(res.data);
      } else {
        console.error('API response for quizzes is not an array:', res.data);
        setError('Dữ liệu danh sách quiz không hợp lệ.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi tải danh sách quiz:', err);
      setError('Không thể tải danh sách quiz');
      setLoading(false);
    }
  };

  if (loading) return <div className="alert alert-info text-center">Đang tải...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Danh sách Quiz</h2>
        <Link to="/quizzes/create" className="btn btn-primary">
          Tạo Quiz mới
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="alert alert-info text-center">Chưa có quiz nào</div>
      ) : (
        <div className="row">
          {quizzes.map(quiz => (
            <div key={quiz.quizId} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{quiz.title}</h5>
                  <p className="card-text text-muted">{quiz.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      Thời gian: {quiz.timeLimit} phút
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Tổng điểm: {quiz.totalPoints} điểm
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Số câu hỏi: {quiz.questions?.length || 0} câu
                    </small>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <div className="d-flex justify-content-between">
                    <Link to={`/quizzes/${quiz.quizId}`} className="btn btn-outline-primary btn-sm">
                      Chi tiết
                    </Link>
                    <Link to={`/quizzes/${quiz.quizId}/edit`} className="btn btn-outline-warning btn-sm">
                      Chỉnh sửa
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList; 