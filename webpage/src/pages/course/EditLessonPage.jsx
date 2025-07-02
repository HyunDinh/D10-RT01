import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/lesson/EditLesson.module.css';

const EditLessonPage = ({ showModal, closeModal, courseId, lesson, onLessonEdited }) => {
    const [formData, setFormData] = useState({
        title: lesson?.title || '',
        duration: lesson?.duration || '',
    });
    const [errors, setErrors] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const tempErrors = {};
        if (!formData.title) tempErrors.title = 'Required';
        if (!formData.duration) tempErrors.duration = 'Required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const openConfirmModal = () => setShowConfirmModal(true);

    const closeConfirmModal = () => {
        const modal = document.querySelector(`.${styles.modal} .${styles.modal}`);
        const modalContent = document.querySelector(`.${styles.modal} .${styles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => setShowConfirmModal(false), 300);
        } else {
            setShowConfirmModal(false);
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            await axios.put(`/api/lessons/${lesson.lessonId}`, formData, {
                withCredentials: true,
            });
            closeConfirmModal();
            closeModal();
            onLessonEdited();
        } catch (error) {
            console.error('Error updating lesson:', error);
            closeConfirmModal();
            if (error.response?.status === 401) {
                window.location.href = '/hocho/login';
            } else {
                setErrors({ general: 'Failed to update lesson. Please try again.' });
            }
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h4>Edit Lesson</h4>
                <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
                    ×
                </button>
            </div>
            <div className={styles.cardBody}>
                {errors.general && <div className={styles.textDanger}>{errors.general}</div>}
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formGroup}>
                        <label htmlFor="lessonTitle" className={styles.formLabel}>
                            Lesson Title
                        </label>
                        <input
                            type="text"
                            className={styles.formControl}
                            name="title"
                            id="lessonTitle"
                            placeholder="Enter lesson title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        {errors.title && <div className={styles.textDanger}>{errors.title}</div>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="lessonDuration" className={styles.formLabel}>
                            Duration (minutes)
                        </label>
                        <input
                            type="number"
                            className={styles.formControl}
                            name="duration"
                            id="lessonDuration"
                            placeholder="Enter duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                        />
                        {errors.duration && <div className={styles.textDanger}>{errors.duration}</div>}
                    </div>
                    <div className={styles.formGroupButton}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={openConfirmModal}
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {showConfirmModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5>Xác nhận chỉnh sửa bài học</h5>
                            <button className={styles.modalClose} onClick={closeConfirmModal} aria-label="Close">
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>
                                Bạn có chắc chắn muốn lưu thay đổi cho bài học "<strong>{formData.title}</strong>" với thời lượng{' '}
                                <strong>{formData.duration}</strong> phút không?
                            </p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeConfirmModal}>
                                Hủy
                            </button>
                            <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleSubmit}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditLessonPage;