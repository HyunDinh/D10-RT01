import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer';
import styles from '../../styles/FormEdit.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";

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
        setError('Bạn không có quyền chỉnh sửa câu hỏi này!');
      }
      setLoading(false);
    } catch (err) {
      setError('Không thể tải dữ liệu câu hỏi');
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
      setError('Upload ảnh thất bại!');
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
      setSuccess('Cập nhật câu hỏi thành công!');
      setTimeout(() => navigate('/hocho/questions'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật câu hỏi');
    }
    setLoading(false);
  };

  if (loading) return <div className={styles.alertInfo}>Đang tải dữ liệu...</div>;
  if (error) return <div className={styles.alertDanger}>{error}</div>;

  return (
      <>
        <Header />
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
          <div className={styles.headerInfo}>
            <p>Edit Question</p>
            <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                data-aos-delay="500">
              <li>
                <a href="/hocho/home">Home</a>
              </li>
              <li>
                <FontAwesomeIcon icon={faChevronRight}/>
              </li>
              <li><a href="/hocho/questions"> Forum</a></li>
              <li>
                <FontAwesomeIcon icon={faChevronRight}/>
              </li>
              <li>Edit Question</li>
            </ul>
          </div>
        </section>
        <div className={styles.container}>
          <h2 className={styles.heading}>Chỉnh sửa câu hỏi</h2>
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nội dung câu hỏi</label>
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
              <label className={styles.formLabel}>Môn học</label>
              <select
                  className={styles.formSelect}
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
              >
                <option value="">-- Chọn môn học --</option>
                {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Lớp</label>
              <select
                  className={styles.formSelect}
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  required
              >
                <option value="">-- Chọn lớp --</option>
                {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ảnh minh họa (tùy chọn, chỉ chọn file)</label>
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
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
        <Footer />
      </>
  );
};

export default QuestionEdit;