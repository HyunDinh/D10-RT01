import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import styles from "../../styles/AnswerQuestion/AnswerForm.module.css";
import Header from "../../components/Header.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight,faClock} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog.jsx";
import { useTranslation } from 'react-i18next';

const AnswerForm = () => {
    const { t } = useTranslation();
    const {id} = useParams(); // id của câu hỏi
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingAnswerId, setEditingAnswerId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false); // New state for dialog
    const [answerToDelete, setAnswerToDelete] = useState(null); // Track answer ID
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, aRes, userRes] = await Promise.all([axios.get(`http://localhost:8080/api/questions/${id}`, {withCredentials: true}), axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true}), axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true})]);
            setQuestion(qRes.data);
            setAnswers(aRes.data);
            setUserId(userRes.data.id);
            setLoading(false);
        } catch (err) {
            setError('Failed to load question or answer');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('content', content);
            if (imageFile) formData.append('imageFile', imageFile);
            await axios.post(`http://localhost:8080/api/questions/${id}/answers`, formData, {
                withCredentials: true, headers: {'Content-Type': 'multipart/form-data'}
            });
            setSuccess(t('answer_form_success'));
            setContent('');
            setImageFile(null);
            // Reload lại danh sách câu trả lời
            const aRes = await axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true});
            setAnswers(aRes.data);
        } catch (err) {
            setError('Failed to submit answer');
        }
        setSubmitting(false);
    };

    const handleEditClick = (answer) => {
        setEditingAnswerId(answer.answerId);
        setEditContent(answer.content);
        setEditImageFile(null);
    };

    const handleEditCancel = () => {
        setEditingAnswerId(null);
        setEditContent('');
        setEditImageFile(null);
    };

    const handleEditSave = async (answerId) => {
        setEditLoading(true);
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('content', editContent);
            if (editImageFile) formData.append('imageFile', editImageFile);
            await axios.put(`http://localhost:8080/api/questions/${id}/answers/${answerId}`, formData, {
                withCredentials: true, headers: {'Content-Type': 'multipart/form-data'}
            });
            setEditingAnswerId(null);
            setEditContent('');
            setEditImageFile(null);
            // Reload lại danh sách câu trả lời
            const aRes = await axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true});
            setAnswers(aRes.data);
        } catch (err) {
            setError('Failed to update answer');
        }
        setEditLoading(false);
    };

    const handleDelete = (answerId) => {
        setAnswerToDelete(answerId);
        setShowDeleteDialog(true); // Open dialog
    };

    const confirmDelete = async () => {
        setShowDeleteDialog(false);
        setDeletingId(answerToDelete);
        try {
            await axios.delete(`http://localhost:8080/api/questions/${id}/answers/${answerToDelete}`, {
                data: {userId},
                withCredentials: true,
            });
            setAnswers(answers.filter((a) => a.answerId !== answerToDelete)); // Update state client-side
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete answer');
        } finally {
            setDeletingId(null);
            setAnswerToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setAnswerToDelete(null);
    };

    const getQuestionImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl === 'none') return '/images/default-course.jpg';
        const fileName = imageUrl.split('/').pop();
        return `http://localhost:8080/api/questions/image/${fileName}`;
    };

    const getAnswerImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl === 'none') return '/images/default-course.jpg';
        const fileName = imageUrl.split('/').pop();
        return `http://localhost:8080/api/questions/answers/image/${fileName}`;
    };

    const openImageModal = (src) => {
        setModalImageSrc(src);
        setShowImageModal(true);
    };

    const closeImageModal = () => setShowImageModal(false);

    if (loading) return <div className="alert alert-info text-center">{t('answer_form_loading')}</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;
    if (!question) return null;

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('answer_form_title')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                    data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">{t('answer_form_breadcrumb_home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li><a href="/hocho/questions">{t('answer_form_breadcrumb_forum')}</a></li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('answer_form_title')}</li>
                </ul>
            </div>
        </section>
        <div className={styles.container}>
            <h2 className={styles.heading}>{t('answer_form_heading')}</h2>
            <div className={styles.card}>
                <div className={styles.cardBody}>
                    <h4 className={styles.cardTitle}>{question.content}</h4>
                    <p className={styles.cardText}>
                        <b>{t('answer_form_subject')}:</b> {question.subject} &nbsp; <b>{t('answer_form_grade')}:</b> {question.grade}
                    </p>
                    <p className={styles.cardText}>
                        <b>{t('answer_form_asker')}:</b>
                        <span className={styles.userInfoRow}>
                          <img
                            src={question.user?.avatarUrl && question.user.avatarUrl !== 'none'
                                ? `http://localhost:8080/api/hocho/profile/${question.user.avatarUrl}`
                                : '/images/default-avatar.png'}
                            alt={t('answer_form_asker_avatar_alt')}
                            className={styles.userAvatar}
                            onError={e => { e.target.src = '/images/default-avatar.png'; }}
                          />
                          <span className={styles.userName}>{question.user?.fullName || t('answer_form_anonymous')}</span>
                        </span>
                    </p>
                    <p className={styles.cardText}>
                        <b>{t('answer_form_time')}:</b> {question.createdAt ? new Date(question.createdAt).toLocaleString() : ''}
                    </p>
                    {question.imageUrl && (
                        <img
                            src={getQuestionImageUrl(question.imageUrl)}
                            alt={t('answer_form_image_alt')}
                            className={styles.questionImage}
                            onError={e => (e.target.src = '/images/default-course.jpg')}
                            onClick={() => openImageModal(getQuestionImageUrl(question.imageUrl))}
                            style={{ cursor: 'pointer' }}
                        />
                    )}
                    <div className={styles.line}></div>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label className={styles.formLabel}>{t('answer_form_label')}</label>
                        <textarea
                            className={styles.formControl}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            placeholder={t('answer_form_placeholder')}
                            rows={3}
                        />
                        <input
                            type="file"
                            className={styles.formControl}
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        {error && <div className={styles.alertDanger}>{error}</div>}
                        {success && <div className={styles.alertSuccess}>{success}</div>}
                        <div className={styles.buttonContainer}>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}
                                    disabled={submitting || !userId}>
                                {submitting ? t('answer_form_submitting') : t('answer_form_submit_btn')}
                            </button>
                        </div>
                    </form>
                    <h5 className={styles.answerListTitle}>{t('answer_form_answer_list')}</h5>
                    {answers.length === 0 && <div className={styles.noAnswers}>{t('answer_form_no_answers')}</div>}
                    {answers.map((a) => {
                        const isOwner = userId && a.user && userId === a.user.id;
                        return (
                            <div key={a.answerId} className={styles.answerItem}>
                                <div className={styles.answerUser}>
                                    <span className={styles.userInfoRow}>
                                      <img
                                        src={a.user?.avatarUrl && a.user.avatarUrl !== 'none'
                                            ? `http://localhost:8080/api/hocho/profile/${a.user.avatarUrl}`
                                            : '/images/default-avatar.png'}
                                        alt={t('answer_form_answer_avatar_alt')}
                                        className={styles.userAvatar}
                                        onError={e => { e.target.src = '/images/default-avatar.png'; }}
                                      />
                                      <span className={styles.userName}>{a.user?.fullName || t('answer_form_anonymous')}:</span>
                                    </span>
                                </div>
                                {editingAnswerId === a.answerId ? (<>
                    <textarea
                        className={styles.formControl}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                    />
                                    <input
                                        type="file"
                                        className={styles.formControl}
                                        accept="image/*"
                                        onChange={(e) => setEditImageFile(e.target.files[0])}
                                    />
                                    <div className={styles.buttonGroup}>
                                        <button
                                            className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                                            onClick={() => handleEditSave(a.answerId)}
                                            disabled={editLoading}
                                        >
                                            {editLoading ? t('answer_form_saving') : t('answer_form_save_btn')}
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                            onClick={handleEditCancel}
                                            disabled={editLoading}
                                        >
                                            {t('answer_form_cancel_btn')}
                                        </button>
                                    </div>
                                </>) : (<>
                                    <div className={styles.answerContent}>{a.content}</div>
                                    {a.imageUrl && (
                                        <img
                                            src={getAnswerImageUrl(a.imageUrl)}
                                            alt={t('answer_form_image_alt')}
                                            className={styles.answerImage}
                                            onError={e => (e.target.src = '/images/default-course.jpg')}
                                            onClick={() => openImageModal(getAnswerImageUrl(a.imageUrl))}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                </>)}
                                <div className={styles.answerFooter}>
                                    <div className={styles.answerTimestamp}>
                                        <FontAwesomeIcon icon={faClock}/>
                                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                                    </div>
                                    {isOwner && editingAnswerId !== a.answerId && (
                                        <div className={styles.buttonGroup}>
                                            <button
                                                className={`${styles.btn} ${styles.btnOutlineWarning} ${styles.btnSm}`}
                                                onClick={() => handleEditClick(a)}
                                            >
                                                {t('answer_form_edit_btn')}
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnOutlineDanger} ${styles.btnSm}`}
                                                onClick={() => handleDelete(a.answerId)}
                                                disabled={deletingId === a.answerId}
                                            >
                                                {deletingId === a.answerId ? t('answer_form_deleting') : t('answer_form_delete_btn')}
                                            </button>
                                        </div>)}
                                </div>
                            </div>);
                    })}
                    <DeleteConfirmDialog sh={showDeleteDialog}
                                         onConfirm={confirmDelete}
                                         onCancel={cancelDelete}/>

                </div>
            </div>
            {showImageModal && (
                <div className={styles.modal} onClick={closeImageModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <img src={modalImageSrc} alt={t('answer_form_zoomed_image_alt')} style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
                        <button className={styles.modalClose} onClick={closeImageModal} aria-label={t('answer_form_close_aria')}>
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    </>);
};

export default AnswerForm;