import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/lesson/AddLesson.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from "@fortawesome/free-solid-svg-icons";

const AddLessonPage = ({showModal, closeModal, courseId}) => {
    const navigate = useNavigate();
    const [lesson, setLesson] = useState({
        title: '',
        duration: '',
    });
    const [errors, setErrors] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleChange = (e) => {
        setLesson({...lesson, [e.target.name]: e.target.value});
    };

    const validate = () => {
        const tempErrors = {};
        if (!lesson.title) tempErrors.title = 'Required';
        if (!lesson.duration) tempErrors.duration = 'Required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const openConfirmModal = () => setShowConfirmModal(true);
    const closeConfirmModal = () => setShowConfirmModal(false);

    const confirmSubmit = async () => {
        if (!validate()) return;
        try {
            await axios.post(`/api/lessons/add/${courseId}`, lesson);
            closeConfirmModal();
            closeModal(); // Close the dialog
            setTimeout(() => {
                navigate(`/hocho/teacher/course/${courseId}/lesson`);
            }, 1500);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h4>Add New Lesson</h4>
                <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
                    <FontAwesomeIcon icon={faXmark}/>
                </button>
            </div>
            <div className={styles.cardBody}>
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
                            value={lesson.title}
                            onChange={handleChange}
                            required
                        />
                        {errors.title && <div className={styles.textDanger}>{errors.title}</div>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="lessonDuration" className={styles.formLabel}>
                            Duration
                        </label>
                        <input
                            type="number"
                            className={styles.formControl}
                            name="duration"
                            id="lessonDuration"
                            placeholder="Enter lesson duration"
                            value={lesson.duration}
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
                            Add Lesson
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
                            <h5>Xác nhận thêm bài học</h5>
                            <button className={styles.modalClose} onClick={closeConfirmModal} aria-label="Close">
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>
                                Bạn có chắc chắn muốn thêm bài học "<strong>{lesson.title}</strong>" với thời lượng{' '}
                                <strong>{lesson.duration}</strong> phút không?
                            </p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeConfirmModal}>
                                Hủy
                            </button>
                            <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={confirmSubmit}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddLessonPage;