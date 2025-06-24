import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import styles from '../../styles/course/CoursePublic.module.css';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin chi tiết khóa học (tạm thời lấy từ danh sách all)
        const courseRes = await axios.get(`http://localhost:8080/api/courses`, { withCredentials: true });
        const foundCourse = courseRes.data.find(
          c => (c.id?.toString() === courseId?.toString()) || (c.courseId?.toString() === courseId?.toString())
        );
        setCourse(foundCourse);

        // Lấy danh sách bài học
        const lessonsRes = await axios.get(`http://localhost:8080/api/lessons/course/${courseId}`, { withCredentials: true });
        setLessons(lessonsRes.data);

        // Lấy danh sách quiz
        const quizzesRes = await axios.get(`http://localhost:8080/api/quizzes/course/${courseId}`, { withCredentials: true });
        setQuizzes(quizzesRes.data);
      } catch (err) {
        setError('Không thể tải dữ liệu khóa học.');
      }
      setLoading(false);
    };
    fetchData();
  }, [courseId]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;
  if (!course) return <div>Không tìm thấy khóa học.</div>;

  return (
    <>
      <Header />
      <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
        <div className={styles.headerInfo}>
          <p>Chi tiết khóa học</p>
          <ul className={styles.breadcrumbItems}>
            <li><a href="/hocho/home">Home</a></li>
            <li> / </li>
            <li><a href="/hocho/courses">Course List</a></li>
            <li> / </li>
            <li>{course.title}</li>
          </ul>
        </div>
      </section>
      <div className={styles.mainContainer}>
        <div className={styles.courseDetailBox}>
          <img src={course.image || 'https://via.placeholder.com/300x150'} alt={course.title} className={styles.courseImg} />
          <div className={styles.courseInfo}>
            <h2>{course.title}</h2>
            <p><b>Mô tả:</b> {course.description}</p>
            <p><b>Giá:</b> {course.price} VND</p>
            {/* Thêm các thông tin khác nếu cần */}
          </div>
        </div>
        <div className={styles.lessonQuizSection}>
          <div className={styles.lessonBox}>
            <h3>Danh sách bài học</h3>
            {lessons.length === 0 ? <p>Chưa có bài học nào.</p> : (
              <ul>
                {lessons.map(lesson => (
                  <li key={lesson.lessonId || lesson.id}>{lesson.title}</li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.quizBox}>
            <h3>Danh sách Quiz</h3>
            {quizzes.length === 0 ? <p>Chưa có quiz nào.</p> : (
              <ul>
                {quizzes.map(quiz => (
                  <li key={quiz.quizId || quiz.id}>{quiz.title}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage; 