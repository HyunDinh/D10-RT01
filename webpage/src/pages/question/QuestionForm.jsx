import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {faImage} from '@fortawesome/free-regular-svg-icons'; // Added icons
import styles from '../../styles/AnswerQuestion/QuestionForm.module.css'; // Adjust path
import { useTranslation } from 'react-i18next';

const SUBJECTS = ['Math', 'Literature', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Informatics', 'Other'];
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const QuestionForm = ({show, onClose, onSubmitRequest}) => {
    const { t } = useTranslation();
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
                setError(t('question_form_error_fetch_profile'));
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
            setError(t('question_form_error_image_type'));
            e.target.value = '';
        } else {
            setImageFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.content || !form.subject || !form.grade) {
            setError(t('question_form_error_required'));
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

            setSuccess(t('question_form_success_submit'));
            setForm({ content: '', subject: '', grade: '' });
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (onSubmitRequest) {
                onSubmitRequest(response.data); // Notify parent
            }
            setTimeout(() => onClose(), 1500); // Close modal after success
        } catch (err) {
            setError(err.response?.data?.message || t('question_form_error_submit'));
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
                <h2 className={styles.modalTitle}>{t('question_form_title')}</h2>
                <form className={styles.formCard} onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>{t('question_form_content')}</label>
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
                        <label className={styles.formLabel}>{t('question_form_subject')}</label>
                        <select
                            className={styles.formSelect}
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- {t('question_form_select_subject')} --</option>
                            {SUBJECTS.map((s) => (
                                <option key={s} value={s}>
                                    {t(`subject_${s.toLowerCase()}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>{t('question_form_grade')}</label>
                        <select
                            className={styles.formSelect}
                            name="grade"
                            value={form.grade}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- {t('question_form_select_grade')} --</option>
                            {GRADES.map((g) => (
                                <option key={g} value={g}>
                                    {t('grade_value', { grade: g })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${styles.formLabelIcon}`}>
                            <FontAwesomeIcon icon={faImage} className={styles.formIcon}/> {t('question_form_image_label')}
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
                            {t('question_form_submit_btn')} <FontAwesomeIcon icon={faChevronRight} className={styles.btnIcon}/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionForm;