import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import styles from "../../styles/AnswerQuestion/AnswerForm.module.css";
import Header from "../../components/Header.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight,faClock} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog.jsx";


const AnswerForm = () => {
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
            setError('Không thể tải dữ liệu câu hỏi hoặc câu trả lời');
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
            setSuccess('Đã gửi câu trả lời!');
            setContent('');
            setImageFile(null);
            // Reload lại danh sách câu trả lời
            const aRes = await axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true});
            setAnswers(aRes.data);
        } catch (err) {
            setError('Không thể gửi câu trả lời');
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
            setError('Không thể cập nhật câu trả lời');
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
            setError(err.response?.data?.message || 'Không thể xóa câu trả lời');
        } finally {
            setDeletingId(null);
            setAnswerToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setAnswerToDelete(null);
    };

    if (loading) return <div className="alert alert-info text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;
    if (!question) return null;

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>Answer Question</p>
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
                    <li>Answer Question</li>

                </ul>
            </div>
        </section>
        <div className={styles.container}>
            <h2 className={styles.heading}>Answer Question</h2>
            <div className={styles.card}>
                <div className={styles.cardBody}>
                    <h4 className={styles.cardTitle}>{question.content}</h4>
                    <p className={styles.cardText}>
                        <b>Môn:</b> {question.subject} &nbsp; <b>Lớp:</b> {question.grade}
                    </p>
                    <p className={styles.cardText}>
                        <b>Người hỏi:</b> {question.user?.fullName || 'Ẩn danh'}
                    </p>
                    <p className={styles.cardText}>
                        <b>Thời gian:</b> {question.createdAt ? new Date(question.createdAt).toLocaleString() : ''}
                    </p>
                    {question.imageUrl && (<img
                        src={`http://localhost:8080/${question.imageUrl}`}
                        alt="Ảnh minh họa"
                        className={styles.questionImage}
                    />)}
                    <div className={styles.line}></div>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label className={styles.formLabel}>Nhập câu trả lời của bạn</label>
                        <textarea
                            className={styles.formControl}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            placeholder="Enter your answer here..."
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
                                {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                            </button>
                        </div>
                    </form>
                    <h5 className={styles.answerListTitle}>Danh sách câu trả lời</h5>
                    {answers.length === 0 && <div className={styles.noAnswers}>Chưa có câu trả lời nào.</div>}
                    {answers.map((a) => {
                        const isOwner = userId && a.user && userId === a.user.id;
                        return (
                            <div key={a.answerId} className={styles.answerItem}>
                                <div className={styles.answerUser}>
                                    <b>{a.user?.fullName || 'Ẩn danh'}:</b>
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
                                            {editLoading ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                            onClick={handleEditCancel}
                                            disabled={editLoading}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </>) : (<>
                                    <div className={styles.answerContent}>{a.content}</div>
                                    {a.imageUrl && (<img
                                        src={`http://localhost:8080${a.imageUrl}`}
                                        alt="Ảnh trả lời"
                                        className={styles.answerImage}
                                    />)}
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
                                                Sửa
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnOutlineDanger} ${styles.btnSm}`}
                                                onClick={() => handleDelete(a.answerId)}
                                                disabled={deletingId === a.answerId}
                                            >
                                                {deletingId === a.answerId ? 'Đang xóa...' : 'Xóa'}
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
        </div>
    </>);
};

export default AnswerForm; 