import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {faImage} from '@fortawesome/free-regular-svg-icons'; // Added icons
import styles from '../../styles/AnswerQuestion/QuestionForm.module.css'; // Adjust path

const SUBJECTS = ['Toán', 'Văn', 'Tiếng Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Tin học', 'Khác'];
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const QuestionForm = ({show, onClose, onSubmitRequest}) => {
    const [form, setForm] = useState({
        content: '',
        subject: '',
        grade: '',
    });
    const [userId, setUserId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = React.useRef(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/hocho/profile', {
                    withCredentials: true,
                });
                setUserId(res.data.id);
            } catch (err) {
                setError('Không thể lấy thông tin người dùng');
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh.');
            e.target.value = '';
        } else {
            setImageFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.content || !form.subject || !form.grade) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('content', form.content);
            formData.append('subject', form.subject);
            formData.append('grade', form.grade);
            if (imageFile) formData.append('imageFile', imageFile);

            const response = await axios.post('http://localhost:8080/api/questions', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Đặt câu hỏi thành công!');
            setForm({ content: '', subject: '', grade: '' });
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (onSubmitRequest) {
                onSubmitRequest(response.data); // Notify parent
            }
            setTimeout(() => onClose(), 1500); // Close modal after success
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
        <span className={styles.closeButton} onClick={onClose}>
          ×
        </span>
                <h2 className={styles.modalTitle}>Thêm câu hỏi mới</h2>
                <form className={styles.formCard} onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nội dung câu hỏi</label>
                        <textarea
                            className={styles.formTextarea}
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
                                <option key={s} value={s}>
                                    {s}
                                </option>
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
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${styles.formLabelIcon}`}>
                            <FontAwesomeIcon icon={faImage} className={styles.formIcon}/> Ảnh minh họa (tùy chọn)
                        </label>
                        <input
                            type="file"
                            className={styles.formInput}
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
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
                            Gửi câu hỏi <FontAwesomeIcon icon={faChevronRight} className={styles.btnIcon}/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionForm;