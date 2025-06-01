import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchCurrentUser();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/questions', { withCredentials: true });
      setQuestions(res.data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách câu hỏi');
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
      setCurrentUser(res.data);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    setDeletingId(questionId);
    try {
      await axios.delete(`http://localhost:8080/api/questions/${questionId}`, {
        data: { userId: currentUser.id },
        withCredentials: true
      });
      setQuestions(questions.filter(q => q.questionId !== questionId));
    } catch (err) {
      setError('Không thể xóa câu hỏi');
    }
    setDeletingId(null);
  };

  const handleEdit = (questionId) => {
    navigate(`/hocho/questions/${questionId}/edit`);
  };

  if (loading) return <div className="alert alert-info text-center">Đang tải danh sách câu hỏi...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4 text-center">Danh sách câu hỏi</h2>
      <div className="row g-4">
        {questions.length === 0 && <div className="text-center">Chưa có câu hỏi nào.</div>}
        {questions.map(q => {
          const isOwner = currentUser && q.user && currentUser.id === q.user.id;
          return (
            <div key={q.questionId} className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{q.content}</h5>
                  <p className="card-text mb-1"><b>Môn:</b> {q.subject} &nbsp; <b>Lớp:</b> {q.grade}</p>
                  <p className="card-text mb-1"><b>Người hỏi:</b> {q.user?.fullName || 'Ẩn danh'}</p>
                  <p className="card-text mb-1"><b>Thời gian:</b> {q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}</p>
                  {q.imageUrl && <img src={q.imageUrl} alt="Ảnh minh họa" className="img-fluid rounded mb-2" style={{maxHeight:150}} />}
                  <div className="d-flex gap-2 flex-wrap mt-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/hocho/questions/${q.questionId}/answer`)}>
                      Đặt câu trả lời
                    </button>
                    {isOwner && (
                      <>
                        <button className="btn btn-outline-warning btn-sm" onClick={() => handleEdit(q.questionId)} disabled={deletingId === q.questionId}>
                          Sửa
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(q.questionId)} disabled={deletingId === q.questionId}>
                          {deletingId === q.questionId ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionList; 