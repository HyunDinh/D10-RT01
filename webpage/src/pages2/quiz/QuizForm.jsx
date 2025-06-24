import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/quiz/QuizForm.module.css';

const QuizForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseIdFromUrl = queryParams.get('courseId');
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
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courseIdFromUrl && courses.length > 0) {
      setForm(f => ({ ...f, courseId: courseIdFromUrl }));
      const found = courses.find(c => String(c.courseId) === String(courseIdFromUrl));
      setSelectedCourse(found);
    }
  }, [courseIdFromUrl, courses]);

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
      navigate(`/quizzes?courseId=${form.courseId}`);
    } catch (err) {
      setError('Không thể tạo quiz');
    }
    setLoading(false);
  };

  return (
    <div className={styles.quizFormContainer}>
      <h2 className={styles.quizFormTitle}>Tạo Quiz mới</h2>
      {error && <div className={styles.quizFormError}>{error}</div>}
      {success && <div className={styles.quizFormSuccess}>{success}</div>}
      <form className={styles.quizForm} onSubmit={handleSubmit}>
        <div>
          <label className={styles.quizFormLabel}>Tiêu đề</label>
          <input type="text" className={styles.quizFormInput} name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label className={styles.quizFormLabel}>Mô tả</label>
          <textarea className={styles.quizFormTextarea} name="description" value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div>
          <label className={styles.quizFormLabel}>Khóa học</label>
          {courseIdFromUrl && selectedCourse ? (
            <div className={styles.quizFormInput} style={{background: 'none', border: 'none', fontWeight: 600}}>{selectedCourse.title}</div>
          ) : (
            <select className={styles.quizFormSelect} name="courseId" value={form.courseId} onChange={handleChange} required>
              <option value="">Chọn khóa học</option>
              {courses.map(course => (
                <option key={course.courseId} value={course.courseId}>
                  {course.title}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.quizFormRow}>
          <div className={styles.quizFormCol}>
            <label className={styles.quizFormLabel}>Thời gian (phút)</label>
            <input type="number" className={styles.quizFormInput} name="timeLimit" value={form.timeLimit} onChange={handleChange} min="1" required />
          </div>
          <div className={styles.quizFormCol}>
            <label className={styles.quizFormLabel}>Tổng điểm</label>
            <input type="number" className={styles.quizFormInput} name="totalPoints" value={form.totalPoints} onChange={handleChange} min="1" required />
          </div>
        </div>

        <h4 style={{margin: '24px 0 10px 0', color: '#2d6cdf'}}>Thêm câu hỏi</h4>
        <div>
          <label className={styles.quizFormLabel}>Nội dung câu hỏi</label>
          <textarea className={styles.quizFormTextarea} name="questionText" value={currentQuestion.questionText} onChange={handleQuestionChange} rows={3} />
        </div>
        <div>
          <label className={styles.quizFormLabel}>Ảnh minh họa (tùy chọn)</label>
          <input type="file" className={styles.quizFormInput} accept="image/*" onChange={handleFileChange} />
        </div>
        <div className={styles.quizFormRow}>
          {currentQuestion.options.map((opt, idx) => (
            <div className={styles.quizFormCol} key={opt.optionKey}>
              <label className={styles.quizFormLabel}>Đáp án {opt.optionKey}</label>
              <input type="text" className={styles.quizFormInput} value={opt.optionText} onChange={e => handleOptionChange(idx, e.target.value)} required />
            </div>
          ))}
        </div>
        <div>
          <label className={styles.quizFormLabel}>Đáp án đúng</label>
          <select className={styles.quizFormSelect} name="correctOptionId" value={currentQuestion.correctOptionId} onChange={handleQuestionChange}>
            {currentQuestion.options.map(opt => (
              <option key={opt.optionKey} value={opt.optionKey}>{opt.optionKey}</option>
            ))}
          </select>
        </div>
        <button type="button" className={styles.quizFormAddBtn} onClick={addQuestion} disabled={loading}>Thêm câu hỏi</button>

        <div className={styles.quizFormQuestionList}>
          {questions.map((q, idx) => (
            <div className={styles.quizFormQuestionItem} key={idx}>
              <div className={styles.quizFormQuestionTitle}>Câu {idx + 1}: {q.questionText}</div>
              {q.questionImageUrl && <img src={q.questionImageUrl} alt="minh họa" style={{maxWidth: '100%', borderRadius: 8, marginBottom: 8}} />}
              {q.options.map(opt => (
                <div className={styles.quizFormOption} key={opt.optionKey}>
                  <b>{opt.optionKey}.</b> {opt.optionText} {q.correctOptionId === opt.optionKey && <span style={{color: '#38a169', fontWeight: 600}}>(Đáp án đúng)</span>}
                </div>
              ))}
              <button type="button" className={styles.quizFormRemoveBtn} onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}>Xóa</button>
            </div>
          ))}
        </div>

        <button type="submit" className={styles.quizFormSubmitBtn} disabled={loading}>Tạo Quiz</button>
      </form>
    </div>
  );
};

export default QuizForm; 