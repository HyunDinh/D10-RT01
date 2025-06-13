import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuiz();
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

  const handleChange = (e) => {
    setQuiz(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuiz(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options[optionIndex] = {
      ...newQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuiz(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleImageUpload = async (questionIndex, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('imageFile', file);

    try {
      const res = await axios.post(
        'http://localhost:8080/api/quizzes/upload-image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      handleQuestionChange(questionIndex, 'questionImageUrl', res.data.imageUrl);
    } catch (err) {
      setError('Upload ảnh thất bại!');
    }
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          points: 10,
          options: [
            { optionText: '', optionKey: 'A' },
            { optionText: '', optionKey: 'B' },
            { optionText: '', optionKey: 'C' },
            { optionText: '', optionKey: 'D' }
          ],
          correctOptionId: 'A'
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quiz.questions.length === 0) {
      setError('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }

    setSaving(true);
    try {
      await axios.put(`http://localhost:8080/api/quizzes/${id}`, quiz, {
        withCredentials: true
      });
      navigate(`/quizzes/${id}`);
    } catch (err) {
      setError('Không thể cập nhật quiz');
      setSaving(false);
    }
  };

  if (loading) return <div className="alert alert-info text-center">Đang tải...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!quiz) return null;

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4 text-center">Chỉnh sửa Quiz</h2>
      <form className="card mx-auto p-4 shadow" style={{maxWidth: 800}} onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tiêu đề</label>
          <input 
            type="text" 
            className="form-control" 
            name="title" 
            value={quiz.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea 
            className="form-control" 
            name="description" 
            value={quiz.description} 
            onChange={handleChange} 
            rows={3} 
          />
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Thời gian (phút)</label>
            <input 
              type="number" 
              className="form-control" 
              name="timeLimit" 
              value={quiz.timeLimit} 
              onChange={handleChange} 
              min="1" 
              required 
            />
          </div>
          <div className="col">
            <label className="form-label">Tổng điểm</label>
            <input 
              type="number" 
              className="form-control" 
              name="totalPoints" 
              value={quiz.totalPoints} 
              onChange={handleChange} 
              min="1" 
              required 
            />
          </div>
        </div>

        <h4 className="mt-4 mb-3">Câu hỏi</h4>
        {quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Câu {questionIndex + 1}</h5>
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  Xóa
                </button>
              </div>
              <div className="mb-3">
                <label className="form-label">Nội dung câu hỏi</label>
                <textarea 
                  className="form-control" 
                  value={question.questionText} 
                  onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)} 
                  rows={3} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Ảnh minh họa</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(questionIndex, e.target.files[0])} 
                />
                {question.questionImageUrl && (
                  <img 
                    src={`http://localhost:8080${question.questionImageUrl}`} 
                    alt="Ảnh minh họa" 
                    className="img-fluid rounded mt-2" 
                    style={{maxHeight: 200}} 
                  />
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Điểm</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={question.points} 
                  onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))} 
                  min="1" 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Lựa chọn</label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="input-group mb-2">
                    <span className="input-group-text">{option.optionKey}</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={option.optionText} 
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'optionText', e.target.value)} 
                      required 
                    />
                    <div className="input-group-text">
                      <input 
                        type="radio" 
                        name={`correct-${questionIndex}`} 
                        checked={question.correctOptionId === option.optionKey} 
                        onChange={() => handleQuestionChange(questionIndex, 'correctOptionId', option.optionKey)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-between mt-4">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate(`/quizzes/${id}`)}
          >
            Hủy
          </button>
          <div>
            <button 
              type="button" 
              className="btn btn-success me-2" 
              onClick={addQuestion}
            >
              Thêm câu hỏi
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuizEdit; 