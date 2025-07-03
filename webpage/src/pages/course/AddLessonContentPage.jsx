import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/lesson/AddLessonContent.module.css';

const AddLessonContentPage = ({ showModal, closeModal, lessonId, courseId, onContentAdded }) => {
    const [content, setContent] = useState({
        title: '',
        file: null,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            const file = files[0];
            const isVideo = file.type.startsWith('video/');
            const isPDF = file.type === 'application/pdf';
            const isLt100M = file.size / 1024 / 1024 < 100;

            if (!isVideo && !isPDF) {
                alert('You can only upload video or PDF files!');
                return;
            }
            if (!isLt100M) {
                alert('File must be smaller than 100MB!');
                return;
            }
            setContent({ ...content, file });
        } else {
            setContent({ ...content, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.file || !content.title) {
            alert('Vui lòng nhập tiêu đề và chọn file!');
            return;
        }
        const formData = new FormData();
        formData.append('file', content.file);
        formData.append('title', content.title);
        setLoading(true);
        try {
            await axios.post(`/api/lesson-contents/${lessonId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            alert('Content added successfully');
            onContentAdded();
            closeModal();
        } catch (error) {
            console.error('Error adding content:', error);
            alert('Lỗi khi upload: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h4>Add Lesson Content</h4>
                <button className={styles.modalClose} onClick={closeModal} aria-label="Close">
                    ×
                </button>
            </div>
            <div className={styles.cardBody}>
                {loading ? (
                    <div className={styles.loading}>Adding content...</div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title" className={styles.formLabel}>
                                Title
                            </label>
                            <input
                                type="text"
                                className={styles.formControl}
                                id="title"
                                name="title"
                                value={content.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="file" className={styles.formLabel}>
                                Upload PDF or Video
                            </label>
                            <input
                                type="file"
                                className={styles.formControl}
                                id="file"
                                name="file"
                                accept=".pdf,video/*"
                                onChange={handleChange}
                                required
                            />
                            <p className={styles.textDanger}>Only PDF or video files, max 100MB.</p>
                        </div>
                        <div className={styles.formGroupButton}>
                            <button
                                type="submit"
                                className={`${styles.btn} ${styles.btnSuccess}`}
                                disabled={loading}
                            >
                                Add Content
                            </button>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={closeModal}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddLessonContentPage;