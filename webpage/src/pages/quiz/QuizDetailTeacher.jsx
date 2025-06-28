import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/quiz/QuizDetail.module.css';

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
      navigate('/hocho/teacher/quizzes');
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

  const courseId = quiz?.course?.courseId || quiz?.courseId;

  const getQuizImageUrl = (questionImageUrl) => {
    const baseUrl = 'http://localhost:8080';
    if (!questionImageUrl || questionImageUrl === 'none') {
      return '/images/default-quiz.jpg';
    }
    // Extract filename from questionImageUrl (e.g., "/quiz/filename.jpg" -> "filename.jpg")
    const fileName = questionImageUrl.split('/').pop();
    return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
  };

  if (loading) return <div className={styles.quizDetailAlert}>Đang tải...</div>;
  if (error) return <div className={styles.quizDetailAlert}>{error}</div>;
  if (!quiz) return null;

  return (
      <div className={styles.quizDetailContainer}>
        <div className={styles.quizDetailHeader}>
          <div className={styles.quizDetailTitle}>{quiz.title}</div>
          <div className={styles.quizDetailHeaderActions}>
            <button
                className={styles.quizDetailBtn}
                onClick={() => navigate(`/hocho/teacher/quizzes/${id}/edit`)}
            >
              Chỉnh sửa
            </button>
            {statistics && statistics.totalStudents > 0 && (
                <button
                    className={`${styles.quizDetailBtn} ${styles.warning}`}
                    onClick={handleDeleteResults}
                    disabled={deletingResults}
                >
                  {deletingResults ? 'Đang xóa...' : 'Xóa kết quả bài làm'}
                </button>
            )}
            <button
                className={`${styles.quizDetailBtn} ${styles.danger}`}
                onClick={handleDelete}
                disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </button>
            <button
                className={styles.quizDetailBtn}
                onClick={() => navigate(`/hocho/teacher/quizzes?courseId=${courseId}`)}
            >
              Quay lại
            </button>
          </div>
        </div>
        <div className={styles.quizDetailBody}>
          <div className={styles.quizDetailInfoRow}>
            <div className={styles.quizDetailInfoCol}>
              <div className={styles.quizDetailInfoTitle}>Thông tin cơ bản</div>
              <div className={styles.quizDetailInfoText}><strong>Mô tả:</strong> {quiz.description}</div>
              <div className={styles.quizDetailInfoText}><strong>Thời gian làm bài:</strong> {quiz.timeLimit} phút</div>
              <div className={styles.quizDetailInfoText}><strong>Tổng điểm:</strong> {quiz.totalPoints} điểm</div>
              <div className={styles.quizDetailInfoText}><strong>Số câu hỏi:</strong> {quiz.questions.length} câu</div>
            </div>
            {statistics && (
                <div className={styles.quizDetailInfoCol}>
                  <div className={styles.quizDetailInfoTitle}>Thống kê</div>
                  <div className={styles.quizDetailInfoText}><strong>Số học sinh đã làm:</strong> {statistics.totalStudents}</div>
                  <div className={styles.quizDetailInfoText}><strong>Điểm trung bình:</strong> {statistics.averageScore}</div>
                  <div className={styles.quizDetailInfoText}><strong>Tỷ lệ đạt:</strong> {statistics.passRate}%</div>
                </div>
            )}
          </div>

          <div className={styles.quizDetailQuestionListTitle}>Danh sách câu hỏi</div>
          {quiz.questions.map((question, index) => (
              <div key={question.questionId} className={styles.quizDetailQuestionCard}>
                <div className={styles.quizDetailQuestionTitle}>
                  Câu {index + 1}: {question.questionText}
                </div>
                <img
                    src={getQuizImageUrl(question.questionImageUrl)}
                    alt="Ảnh minh họa"
                    className={styles.quizDetailQuestionImage}
                    onError={e => (e.target.src = '/images/default-quiz.jpg')}
                    style={{ display: question.questionImageUrl ? 'block' : 'none' }}
                />
                <div>
                  {question.options.map(option => (
                      <div
                          key={option.optionId}
                          className={
                            option.optionKey === question.correctOptionId
                                ? `${styles.quizDetailOption} ${styles.correct}`
                                : styles.quizDetailOption
                          }
                      >
                        {option.optionKey}. {option.optionText}{' '}
                        {option.optionKey === question.correctOptionId && (
                            <strong>(Đáp án đúng)</strong>
                        )}
                      </div>
                  ))}
                </div>
                <div style={{marginTop: 8}}>
              <span className={styles.quizDetailBadge}>
                Điểm: {question.points} điểm
              </span>
                  {statistics && statistics.questionStats[question.questionId] && (
                      <span className={`${styles.quizDetailBadge} ${styles.secondary}`}>
                  Tỷ lệ đúng: {statistics.questionStats[question.questionId].correctRate}%
                </span>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default QuizDetailTeacher; 