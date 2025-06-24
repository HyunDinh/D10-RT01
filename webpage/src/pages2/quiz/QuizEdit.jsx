import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import formStyles from '../../styles/quiz/QuizForm.module.css';
import detailStyles from '../../styles/quiz/QuizDetail.module.css';

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

  if (loading) return <div className={detailStyles.quizDetailAlert}>Đang tải...</div>;
  if (error) return <div className={detailStyles.quizDetailAlert}>{error}</div>;
  if (!quiz) return null;

  return (
    <div className={formStyles.quizFormContainer}>
      <h2 className={formStyles.quizFormTitle}>Chỉnh sửa Quiz</h2>
      <form className={formStyles.quizForm} onSubmit={handleSubmit}>
        <div>
          <label className={formStyles.quizFormLabel}>Tiêu đề</label>
          <input 
            type="text" 
            className={formStyles.quizFormInput} 
            name="title" 
            value={quiz.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label className={formStyles.quizFormLabel}>Mô tả</label>
          <textarea 
            className={formStyles.quizFormTextarea} 
            name="description" 
            value={quiz.description} 
            onChange={handleChange} 
            rows={3} 
          />
        </div>
        <div className={formStyles.quizFormRow}>
          <div className={formStyles.quizFormCol}>
            <label className={formStyles.quizFormLabel}>Thời gian (phút)</label>
            <input 
              type="number" 
              className={formStyles.quizFormInput} 
              name="timeLimit" 
              value={quiz.timeLimit} 
              onChange={handleChange} 
              min="1" 
              required 
            />
          </div>
          <div className={formStyles.quizFormCol}>
            <label className={formStyles.quizFormLabel}>Tổng điểm</label>
            <input 
              type="number" 
              className={formStyles.quizFormInput} 
              name="totalPoints" 
              value={quiz.totalPoints} 
              onChange={handleChange} 
              min="1" 
              required 
            />
          </div>
        </div>

        <h4 style={{margin: '24px 0 10px 0', color: '#2d6cdf'}}>Câu hỏi</h4>
        {quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className={detailStyles.quizDetailQuestionCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
              <div className={detailStyles.quizDetailQuestionTitle}>Câu {questionIndex + 1}</div>
              <button 
                type="button" 
                className={formStyles.quizFormRemoveBtn}
                onClick={() => removeQuestion(questionIndex)}
              >
                Xóa
              </button>
            </div>
            <div>
              <label className={formStyles.quizFormLabel}>Nội dung câu hỏi</label>
              <textarea 
                className={formStyles.quizFormTextarea}
                value={question.questionText}
                onChange={e => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label className={formStyles.quizFormLabel}>Ảnh minh họa (tùy chọn)</label>
              <input 
                type="file" 
                className={formStyles.quizFormInput}
                accept="image/*"
                onChange={e => handleImageUpload(questionIndex, e.target.files[0])}
              />
              {question.questionImageUrl && (
                <img 
                  src={question.questionImageUrl.startsWith('http') ? question.questionImageUrl : `http://localhost:8080${question.questionImageUrl}`}
                  alt="Ảnh minh họa"
                  style={{maxWidth: '100%', borderRadius: 8, marginTop: 8}}
                />
              )}
            </div>
            <div className={formStyles.quizFormRow}>
              {question.options.map((opt, idx) => (
                <div className={formStyles.quizFormCol} key={opt.optionKey}>
                  <label className={formStyles.quizFormLabel}>Đáp án {opt.optionKey}</label>
                  <input 
                    type="text" 
                    className={formStyles.quizFormInput}
                    value={opt.optionText}
                    onChange={e => handleOptionChange(questionIndex, idx, 'optionText', e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            <div>
              <label className={formStyles.quizFormLabel}>Đáp án đúng</label>
              <select 
                className={formStyles.quizFormSelect}
                value={question.correctOptionId}
                onChange={e => handleQuestionChange(questionIndex, 'correctOptionId', e.target.value)}
              >
                {question.options.map(opt => (
                  <option key={opt.optionKey} value={opt.optionKey}>{opt.optionKey}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={formStyles.quizFormLabel}>Điểm</label>
              <input 
                type="number" 
                className={formStyles.quizFormInput}
                value={question.points}
                min="1"
                onChange={e => handleQuestionChange(questionIndex, 'points', e.target.value)}
                required
              />
            </div>
          </div>
        ))}
        <button type="button" className={formStyles.quizFormAddBtn} onClick={addQuestion}>Thêm câu hỏi</button>
        <button type="submit" className={formStyles.quizFormSubmitBtn} disabled={saving}>Lưu Quiz</button>
      </form>
    </div>
  );
};

export default QuizEdit; 