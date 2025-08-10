import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/LearningPage.module.css';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';

export default function ChildCoursePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [childId, setChildId] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        setError(t('learning_childcourse_error_load'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCourseImageUrl = (courseImageUrl) => {
    const baseUrl = 'http://localhost:8080';
    if (!courseImageUrl || courseImageUrl === 'none') {
      return '/avaBack.jpg';
    }
    const fileName = courseImageUrl.split('/').pop();
    return `${baseUrl}/api/courses/image/${fileName}?t=${new Date().getTime()}`;
  };

  if (loading) {
    return <div className={styles.learningPageContainer}><div style={{padding: 32, textAlign: 'center'}}>{t('learning_childcourse_loading')}</div></div>;
  }
  if (error) {
    return <div className={styles.learningPageContainer}><div style={{padding: 32, color: 'red', textAlign: 'center'}}>{error}</div></div>;
  }
  if (!enrollments.length) {
    return <div className={styles.learningPageContainer}><div style={{padding: 32, textAlign: 'center'}}>{t('learning_childcourse_no_enrollments')}</div></div>;
  }

  return (
    <>
      <Header />
      <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
        <div className={styles.headerInfo}>
          <p>{t('learning_childcourse_title')}</p>
          <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
              data-aos-delay="500">
            <li>
              <a href="/hocho/home">{t('learning_breadcrumb_home')}</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faChevronRight}/>
            </li>
            <li>{t('learning_childcourse_title')}</li>
          </ul>
        </div>
      </section>

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
                  src={getCourseImageUrl(enrollment.course.courseImageUrl)}
                  alt={enrollment.course.title}
                  className={styles.courseCardImage}
                  onError={e => { e.target.src = '/avaBack.jpg'; }}
                />
              </div>
              <div className={styles.courseCardInfo}>
                <div className={styles.courseCardTitle}>{enrollment.course.title}</div>
                <div className={styles.courseCardDesc}>{enrollment.course.description || t('learning_childcourse_no_description')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
