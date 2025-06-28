import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/LearningPage.module.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function ChildCoursePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [childId, setChildId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await axios.get(`/api/hocho/profile`, { withCredentials: true });
        const id = profileRes.data.id;
        setChildId(id);
        const enrollmentsRes = await axios.get(`/api/enrollments/child/${id}`);
        setEnrollments(enrollmentsRes.data);
      } catch (err) {
        setError('Failed to load learning data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.learningPageContainer}><div style={{padding: 32, textAlign: 'center'}}>Loading...</div></div>;
  }
  if (error) {
    return <div className={styles.learningPageContainer}><div style={{padding: 32, color: 'red', textAlign: 'center'}}>{error}</div></div>;
  }
  if (!enrollments.length) {
    return <div className={styles.learningPageContainer}><div style={{padding: 32, textAlign: 'center'}}>No enrolled courses found.</div></div>;
  }

  return (
    <>
      <h2 className={styles.learningTitle} style={{ textAlign: 'center', marginTop: 40 }}>My Learning</h2>
      <div className={styles.learningPageContainer}>
        <div className={styles.courseGrid}>
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.enrollmentId}
              className={styles.courseCardClickable}
              onClick={() => navigate(`/hocho/child/course/${enrollment.course.courseId}/learning`)}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') navigate(`/hocho/child/course/${enrollment.course.courseId}/learning`); }}
              role="button"
            >
              <div className={styles.courseCardImageWrapper}>
                <img
                  // src={enrollment.course.courseImageUrl}
                  alt={enrollment.course.title}
                  className={styles.courseCardImage}
                  onError={e => { e.target.src = '/images/default-course.jpg'; }}
                />
              </div>
              <div className={styles.courseCardInfo}>
                <div className={styles.courseCardTitle}>{enrollment.course.title}</div>
                <div className={styles.courseCardDesc}>{enrollment.course.description || 'No description.'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
