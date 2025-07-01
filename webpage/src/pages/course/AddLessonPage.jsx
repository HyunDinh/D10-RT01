import React, {useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/lesson/AddLesson.module.css';

export default function AddLessonPage() {
    const {courseId} = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState({
        title: '',
        duration: ''
    });
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

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

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const confirmSubmit = async () => {
        if (!validate()) return;
        try {
            await axios.post(`/api/lessons/add/${courseId}`, lesson);
            setShowModal(false);
            setTimeout(() => {
                navigate(`/hocho/teacher/course/${courseId}/lesson`);
            }, 1500);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Link
                to={`/hocho/teacher/course/${courseId}/lesson/add`}
                className={`${styles.btn} ${styles.btnSuccess}`}
                aria-label="Add a new lesson"
            >
                Add New Lesson
            </Link>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h4>Add New Lesson</h4>
                    </div>
                    <div className={styles.cardBody}>
                        <form onSubmit={e => e.preventDefault()}>
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
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSuccess}`}
                                onClick={openModal}
                            >
                                Add Lesson
                            </button>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5>Xác nhận thêm bài học</h5>
                            <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>
                                Bạn có chắc chắn muốn thêm bài học "<strong>{lesson.title}</strong>" với thời lượng{' '}
                                <strong>{lesson.duration}</strong> phút không?
                            </p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>
                                Hủy
                            </button>
                            <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={confirmSubmit}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}