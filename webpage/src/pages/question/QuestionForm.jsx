import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {faImage} from '@fortawesome/free-regular-svg-icons'; // Added icons
import styles from '../../styles/AnswerQuestion/QuestionForm.module.css'; // Adjust path

const SUBJECTS = ['Math', 'Literature', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Informatics', 'Other'];
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
                setError('Cannot get user information');
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
            setError('Please select an image file.');
            e.target.value = '';
        } else {
            setImageFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.content || !form.subject || !form.grade) {
            setError('Please fill in all required information');
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

            setSuccess('Question submitted successfully!');
            setForm({ content: '', subject: '', grade: '' });
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (onSubmitRequest) {
                onSubmitRequest(response.data); // Notify parent
            }
            setTimeout(() => onClose(), 1500); // Close modal after success
        } catch (err) {
            setError(err.response?.data?.message || 'Cannot submit question');
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
                <h2 className={styles.modalTitle}>Add New Question</h2>
                <form className={styles.formCard} onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Question Content</label>
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
                        <label className={styles.formLabel}>Subject</label>
                        <select
                            className={styles.formSelect}
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select subject --</option>
                            {SUBJECTS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Grade</label>
                        <select
                            className={styles.formSelect}
                            name="grade"
                            value={form.grade}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select grade --</option>
                            {GRADES.map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${styles.formLabelIcon}`}>
                            <FontAwesomeIcon icon={faImage} className={styles.formIcon}/> Illustration image (optional)
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
                            Submit Question <FontAwesomeIcon icon={faChevronRight} className={styles.btnIcon}/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionForm;