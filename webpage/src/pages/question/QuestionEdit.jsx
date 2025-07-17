import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer';
import styles from '../../styles/FormEdit.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';

const SUBJECTS = ['Toán', 'Văn', 'Tiếng Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Tin học', 'Khác'];
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const QuestionEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    content: '',
    subject: '',
    grade: '',
    imageUrl: '',
  });
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, userRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/questions/${id}`, { withCredentials: true }),
        axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true }),
      ]);
      const q = qRes.data;
      setForm({
        content: q.content || '',
        subject: q.subject || '',
        grade: q.grade || '',
        imageUrl: q.imageUrl || '',
      });
      setUserId(userRes.data.id);
      if (!q.user || q.user.id !== userRes.data.id) {
        setError(t('question_edit_error_permission'));
      }
      setLoading(false);
    } catch (err) {
      setError(t('question_edit_error_fetch'));
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('imageFile', file);
    try {
      const res = await axios.post('http://localhost:8080/api/questions/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setForm({ ...form, imageUrl: res.data.imageUrl });
    } catch (err) {
      setError(t('question_edit_error_upload'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.put(`http://localhost:8080/api/questions/${id}`, {
        userId,
        content: form.content,
        subject: form.subject,
        grade: form.grade,
        imageUrl: form.imageUrl || null,
      }, { withCredentials: true });
      setSuccess(t('question_edit_success_update'));
      setTimeout(() => navigate('/hocho/questions'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || t('question_edit_error_update'));
    }
    setLoading(false);
  };

  if (loading) return <div className={styles.alertInfo}>{t('question_edit_loading')}</div>;
  if (error) return <div className={styles.alertDanger}>{error}</div>;

  return (
      <>
        <Header />
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
          <div className={styles.headerInfo}>
            <p>{t('question_edit_title')}</p>
            <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                data-aos-delay="500">
              <li>
                <a href="/hocho/home">{t('question_edit_breadcrumb_home')}</a>
              </li>
              <li>
                <FontAwesomeIcon icon={faChevronRight}/>
              </li>
              <li><a href="/hocho/questions">{t('question_edit_breadcrumb_forum')}</a></li>
              <li>
                <FontAwesomeIcon icon={faChevronRight}/>
              </li>
              <li>{t('question_edit_title')}</li>
            </ul>
          </div>
        </section>
        <div className={styles.container}>
          <h2 className={styles.heading}>{t('question_edit_heading')}</h2>
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('question_edit_content')}</label>
              <textarea
                  className={styles.formControl}
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows={3}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('question_edit_subject')}</label>
              <select
                  className={styles.formSelect}
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
              >
                <option value="">-- {t('question_edit_select_subject')} --</option>
                {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{t(`subject_${s.toLowerCase()}`)}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('question_edit_grade')}</label>
              <select
                  className={styles.formSelect}
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  required
              >
                <option value="">-- {t('question_edit_select_grade')} --</option>
                {GRADES.map((g) => (
                    <option key={g} value={g}>{t('grade_value', { grade: g })}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('question_edit_image_label')}</label>
              <input
                  type="file"
                  className={styles.formControl}
                  accept="image/*"
                  onChange={handleFileChange}
              />
            </div>
            {error && <div className={styles.alertDanger}>{error}</div>}
            {success && <div className={styles.alertSuccess}>{success}</div>}
            <div className={styles.buttonContainer}>
              <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={loading || !userId}
              >
                {loading ? t('question_edit_saving') : t('question_edit_save_btn')}
              </button>
            </div>
          </form>
        </div>
        <Footer />
      </>
  );
};

export default QuestionEdit;