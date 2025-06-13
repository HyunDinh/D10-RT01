import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QuizForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    totalPoints: 100,
    courseId: ''
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    points: 10,
    options: [
      { optionText: '', optionKey: 'A' },
      { optionText: '', optionKey: 'B' },
      { optionText: '', optionKey: 'C' },
      { optionText: '', optionKey: 'D' }
    ],
    correctOptionId: 'A'
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/teacher/courses', {
        withCredentials: true
      });
      setCourses(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách khóa học:", err);
      setError("Không thể tải danh sách khóa học.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index].optionText = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
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
      setCurrentQuestion({ ...currentQuestion, questionImageUrl: res.data.imageUrl });
    } catch (err) {
      setError('Upload ảnh thất bại!');
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (currentQuestion.options.some(opt => !opt.optionText)) {
      setError('Vui lòng nhập đầy đủ các lựa chọn');
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      questionText: '',
      points: 10,
      options: [
        { optionText: '', optionKey: 'A' },
        { optionText: '', optionKey: 'B' },
        { optionText: '', optionKey: 'C' },
        { optionText: '', optionKey: 'D' }
      ],
      correctOptionId: 'A'
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      setError('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }
    if (!form.courseId) {
      setError('Vui lòng chọn khóa học cho quiz');
      return;
    }
    setLoading(true);
    try {
      const quizData = {
        ...form,
        questions: questions,
        course: { courseId: form.courseId }
      };
      await axios.post('http://localhost:8080/api/quizzes', quizData, {
        withCredentials: true
      });
      setSuccess('Tạo quiz thành công!');
      setForm({
        title: '',
        description: '',
        timeLimit: 30,
        totalPoints: 100,
        courseId: ''
      });
      setQuestions([]);
      navigate('/quizzes');
    } catch (err) {
      setError('Không thể tạo quiz');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4 text-center">Tạo Quiz mới</h2>
      <form className="card mx-auto p-4 shadow" style={{maxWidth: 800}} onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tiêu đề</label>
          <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div className="mb-3">
          <label className="form-label">Khóa học</label>
          <select className="form-select" name="courseId" value={form.courseId} onChange={handleChange} required>
            <option value="">Chọn khóa học</option>
            {courses.map(course => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Thời gian (phút)</label>
            <input type="number" className="form-control" name="timeLimit" value={form.timeLimit} onChange={handleChange} min="1" required />
          </div>
          <div className="col">
            <label className="form-label">Tổng điểm</label>
            <input type="number" className="form-control" name="totalPoints" value={form.totalPoints} onChange={handleChange} min="1" required />
          </div>
        </div>

        <h4 className="mt-4 mb-3">Thêm câu hỏi</h4>
        <div className="mb-3">
          <label className="form-label">Nội dung câu hỏi</label>
          <textarea className="form-control" name="questionText" value={currentQuestion.questionText} onChange={handleQuestionChange} rows={3} />
        </div>
        <div className="mb-3">
          <label className="form-label">Ảnh minh họa (tùy chọn)</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
          {currentQuestion.questionImageUrl && (
            <img 
              src={`http://localhost:8080${currentQuestion.questionImageUrl}`} 
              alt="Ảnh minh họa" 
              className="img-fluid rounded mt-2" 
              style={{maxHeight: 200}} 
            />
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Điểm</label>
          <input type="number" className="form-control" name="points" value={currentQuestion.points} onChange={handleQuestionChange} min="1" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Các lựa chọn</label>
          {currentQuestion.options.map((option, index) => (
            <div key={option.optionKey} className="input-group mb-2">
              <span className="input-group-text">{option.optionKey}</span>
              <input
                type="text"
                className="form-control"
                value={option.optionText}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Nhập lựa chọn ${option.optionKey}`}
              />
              <div className="input-group-text">
                <input
                  type="radio"
                  name="correctOption"
                  checked={currentQuestion.correctOptionId === option.optionKey}
                  onChange={() => setCurrentQuestion({...currentQuestion, correctOptionId: option.optionKey})}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-between mb-4">
          <button type="button" className="btn btn-success" onClick={addQuestion}>
            Thêm câu hỏi
          </button>
          <div className="text-muted">
            Đã thêm {questions.length} câu hỏi
          </div>
        </div>

        {questions.length > 0 && (
          <div className="mb-4">
            <h5>Danh sách câu hỏi đã thêm</h5>
            {questions.map((q, index) => (
              <div key={index} className="card mb-2">
                <div className="card-body">
                  <h6>Câu {index + 1}: {q.questionText}</h6>
                  {q.questionImageUrl && (
                    <img 
                      src={`http://localhost:8080${q.questionImageUrl}`} 
                      alt="Ảnh minh họa" 
                      className="img-fluid rounded mb-2" 
                      style={{maxHeight: 150}} 
                    />
                  )}
                  <div className="ms-3">
                    {q.options.map(opt => (
                      <div key={opt.optionKey} className="mb-1">
                        {opt.optionKey}. {opt.optionText}
                        {opt.optionKey === q.correctOptionId && ' ✓'}
                      </div>
                    ))}
                  </div>
                  <div className="text-muted mt-2">Điểm: {q.points}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="alert alert-danger text-center">{error}</div>}
        {success && <div className="alert alert-success text-center">{success}</div>}
        <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm; 