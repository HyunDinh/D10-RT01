import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {faCircleCheck, faImage} from '@fortawesome/free-regular-svg-icons'; // Added icons
import styles from '../../styles/QuestionList.module.css'; // Adjust path

const SUBJECTS = ['Toán', 'Văn', 'Tiếng Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Tin học', 'Khác'];
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const QuestionForm = ({onSubmitRequest}) => {
    const [form, setForm] = useState({
        content: '', subject: '', grade: '',
    });
    const [userId, setUserId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
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
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                withCredentials: true, headers: {'Content-Type': 'multipart/form-data'},
            });

            setSuccess('Đặt câu hỏi thành công!');
            setForm({content: '', subject: '', grade: ''});
            setImageFile(null);
            document.querySelector('input[type="file"]').value = '';
            if (onSubmitRequest) {
                onSubmitRequest(response.data); // Notify parent
            }
            setTimeout(() => setIsDialogOpen(false), 1500); // Close confirmation dialog
        } catch (err) {
            setError('Không thể gửi câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const openDialog = () => {
        if (!form.content || !form.subject || !form.grade) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => setIsDialogOpen(false);

    const confirmSubmit = (e) => {
        handleSubmit(e);
    };

    return (<form className={styles.formCard} onSubmit={(e) => e.preventDefault()} encType="multipart/form-data">
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
                    {SUBJECTS.map((s) => (<option key={s} value={s}>
                            {s}
                        </option>))}
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
                    {GRADES.map((g) => (<option key={g} value={g}>
                            {g}
                        </option>))}
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
                />
            </div>
            {error && <div className={styles.alertDanger}>{error}</div>}
            {success && (<div className={styles.alertSuccess}>
                    <FontAwesomeIcon icon={faCircleCheck} className="fa-bounce"/> {success}
                </div>)}
            <div className={styles.buttonContainer}>
                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={openDialog}
                    disabled={loading || !userId}
                >
                    Gửi câu hỏi <FontAwesomeIcon icon={faChevronRight} className={styles.btnIcon}/>
                </button>
            </div>

            {isDialogOpen && (<div className={styles.dialogOverlay}>
                    <div className={styles.dialog}>
                        <h3 className={styles.dialogTitle}>Xác nhận gửi câu hỏi</h3>
                        <p className={styles.dialogMessage}>Bạn có chắc muốn gửi câu hỏi này?</p>
                        <div className={styles.dialogButtons}>
                            <button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={closeDialog}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={confirmSubmit}
                                disabled={loading}
                            >
                                Xác nhận <FontAwesomeIcon icon={faChevronRight} className={styles.btnIcon}/>
                            </button>
                        </div>
                    </div>
                </div>)}
        </form>);
};

export default QuestionForm;