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
  const [enrolled, setEnrolled] = useState(false);
  const [childId, setChildId] = useState(null);

  const getCourseImageUrl = (courseImageUrl) => {
    const baseUrl = 'http://localhost:8080';
    if (!courseImageUrl || courseImageUrl === 'none') {
      return 'https://via.placeholder.com/300x150';
    }
    // Extract filename from courseImageUrl (e.g., "/course/filename.jpg" -> "filename.jpg")
    const fileName = courseImageUrl.split('/').pop();
    return `${baseUrl}/api/courses/image/${fileName}?t=${new Date().getTime()}`;
  };

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

  useEffect(() => {
    // Lấy childId từ profile
    axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true })
      .then(res => setChildId(res.data.id));
  }, []);

  useEffect(() => {
    if (childId && courseId) {
      axios.get(`http://localhost:8080/api/enrollments/check/${childId}/${courseId}`, { withCredentials: true })
        .then(res => setEnrolled(res.data === true));
    }
  }, [childId, courseId]);

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
          <img 
            src={getCourseImageUrl(course.courseImageUrl)} 
            alt={course.title} 
            className={styles.courseImg}
            onError={(e) => (e.target.src = 'https://via.placeholder.com/300x150')}
          />
          <div className={styles.courseInfo}>
            <h2>{course.title}</h2>
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
          {enrolled && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage; 