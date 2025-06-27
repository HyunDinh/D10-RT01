import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/quiz/QuizForm.module.css';
import * as XLSX from 'xlsx';

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
  const [inputMode, setInputMode] = useState('excel');

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

  const handleExcelFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const [header, ...rows] = json;
      const newQuestions = rows.map((row, idx) => {
        return {
          questionText: row[0] || '',
          points: Number(row[6]) || 10,
          options: [
            { optionText: row[1] || '', optionKey: 'A' },
            { optionText: row[2] || '', optionKey: 'B' },
            { optionText: row[3] || '', optionKey: 'C' },
            { optionText: row[4] || '', optionKey: 'D' }
          ],
          correctOptionId: row[5] || 'A'
        };
      });
      setQuestions(prev => [...prev, ...newQuestions]);
    };
    reader.readAsArrayBuffer(file);
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
      navigate(`/hocho/teacher/quizzes?courseId=${form.courseId}`);
    } catch (err) {
      setError('Không thể tạo quiz');
    }
    setLoading(false);
  };

  // Hàm tải file template Excel
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Câu hỏi', 'A', 'B', 'C', 'D', 'Đáp án đúng', 'Điểm'],
      ['2+2=?', '3', '4', '5', '6', 'B', '10'],
      ['Thủ đô Việt Nam?', 'Hà Nội', 'Sài Gòn', 'Huế', 'Đà Nẵng', 'A', '10']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'quiz_template.xlsx');
  };

  const getQuizImageUrl = (questionImageUrl) => {
    const baseUrl = 'http://localhost:8080';
    if (!questionImageUrl || questionImageUrl === 'none') {
      return '/images/default-quiz.jpg';
    }
    const fileName = questionImageUrl.split('/').pop();
    return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
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
          <div style={{ margin: '16px 0' }}>
            <label>
              <input
                type="radio"
                name="inputMode"
                value="excel"
                checked={inputMode === 'excel'}
                onChange={() => setInputMode('excel')}
              />
              Nhập câu hỏi từ file Excel
            </label>
            <label style={{ marginLeft: 24 }}>
              <input
                type="radio"
                name="inputMode"
                value="manual"
                checked={inputMode === 'manual'}
                onChange={() => setInputMode('manual')}
              />
              Nhập câu hỏi trực tiếp trên web
            </label>
          </div>
          {inputMode === 'excel' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelFile}
                />
                <button type="button" onClick={downloadTemplate} style={{ padding: '4px 12px', cursor: 'pointer' }}>
                  Tải file mẫu
                </button>
              </div>
            
            </div>
          )}
          {inputMode === 'manual' && (
            <>
              <div>
                <label className={styles.quizFormLabel}>Ảnh minh họa (tùy chọn)</label>
                <input
                  type="file"
                  className={styles.quizFormInput}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className={styles.quizFormRow}>
                {currentQuestion.options.map((opt, idx) => (
                  <div key={opt.optionKey} className={styles.quizFormCol}>
                    <label className={styles.quizFormLabel}>{`Đáp án ${opt.optionKey}`}</label>
                    <input
                      type="text"
                      className={styles.quizFormInput}
                      value={opt.optionText}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className={styles.quizFormLabel}>Nội dung câu hỏi</label>
                <textarea className={styles.quizFormTextarea} name="questionText" value={currentQuestion.questionText} onChange={handleQuestionChange} rows={3} />
              </div>
              <div className={styles.quizFormRow}>
                <div className={styles.quizFormCol}>
                  <label className={styles.quizFormLabel}>Điểm</label>
                  <input type="number" className={styles.quizFormInput} name="points" value={currentQuestion.points} onChange={handleQuestionChange} min="1" />
                </div>
                <div className={styles.quizFormCol}>
                  <label className={styles.quizFormLabel}>Đáp án đúng</label>
                  <select className={styles.quizFormSelect} name="correctOptionId" value={currentQuestion.correctOptionId} onChange={handleQuestionChange}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
              <div>
                <button type="button" className={styles.quizFormButton} onClick={addQuestion}>
                  Thêm câu hỏi
                </button>
              </div>
            </>
          )}

          <div className={styles.quizFormQuestionList}>
            {questions.map((q, idx) => (
                <div className={styles.quizFormQuestionItem} key={idx}>
                  <div style={{fontWeight: 600, color: '#2d6cdf'}}>Câu {idx + 1}: {q.questionText}</div>
                  {q.questionImageUrl && (
                    <img
                      src={getQuizImageUrl(q.questionImageUrl)}
                      alt="minh họa"
                      style={{maxWidth: '100%', borderRadius: 8, marginBottom: 8}}
                      onError={e => (e.target.src = '/images/default-quiz.jpg')}
                    />
                  )}
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