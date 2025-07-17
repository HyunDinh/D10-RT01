import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer';
import QuestionForm from './QuestionForm.jsx';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog.jsx';
import styles from '../../styles/AnswerQuestion/QuestionList.module.css';
import { faChevronRight, faPlus, faUserPen, faEraser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

const QuestionList = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestions();
        fetchCurrentUser();
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
            setUser(response.data);
            console.log('Fetched user data:', response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Cannot load profile information. Please try again.');
            if (err.response && err.response.status === 401) {
                navigate('/hocho/login');
            }
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/questions', { withCredentials: true });
            setQuestions(res.data);
            setLoading(false);
        } catch (err) {
            setError('Cannot load question list');
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
            setCurrentUser(res.data);
        } catch (err) {
            setCurrentUser(null);
        }
    };

    const handleEdit = (questionId) => {
        navigate(`/hocho/questions/${questionId}/edit`);
    };

    const handleQuestionSubmit = (newQuestion) => {
        setQuestions((prev) => [newQuestion, ...prev]);
    };

    // Thêm hàm mới để lấy avatar của người hỏi
    const getQuestionUserAvatarUrl = (q) => {
        const baseUrl = 'http://localhost:8080';
        if (!q.user?.avatarUrl || q.user.avatarUrl === 'none') {
            return `${baseUrl}/api/hocho/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${q.user.avatarUrl}?t=${new Date().getTime()}`;
    };

    const handleDelete = (questionId) => {
        setQuestionToDelete(questionId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setShowDeleteDialog(false);
        setDeletingId(questionToDelete);
        try {
            await axios.delete(`http://localhost:8080/api/questions/${questionToDelete}`, {
                data: { userId: currentUser.id },
                withCredentials: true,
            });
            setQuestions(questions.filter((q) => q.questionId !== questionToDelete)); // Update state client-side
        } catch (err) {
            setError(err.response?.data?.message || 'Cannot delete question');
        } finally {
            setDeletingId(null);
            setQuestionToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setQuestionToDelete(null);
    };

    if (loading) return <div className="alert alert-info text-center">{t('question_list_loading')}</div>;
    if (error) return <div className="alert alert-danger text-center">{t('question_list_error')}</div>;

    return (
        <>
            <Header />
            <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={styles.headerInfo}>
                    <p>{t('question_list_forum')}</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">{t('question_list_breadcrumb_home')}</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>{t('question_list_forum')}</li>
                    </ul>
                </div>
            </section>

            <div className={styles.container}>
                <h2 className={styles.heading}>{t('question_list_heading')}</h2>
                <button className={styles.buttonAsk} onClick={() => setShowQuestionForm(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    {t('question_list_ask_question')}
                </button>
                <div className={styles.grid}>
                    {questions.length === 0 && <div className={styles.noQuestions}>{t('question_list_no_questions')}</div>}
                    {questions.map((q) => {
                        const isOwner = currentUser && q.user && currentUser.id === q.user.id;
                        return (
                            <div key={q.questionId} className={styles.gridItem}>
                                <div className={styles.card}>
                                    <div className={styles.cardBody}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <img src={getQuestionUserAvatarUrl(q)} alt="User Avatar" className={styles.userAvatar} />
                                            <div className={styles.cardContent}>
                                                <h5 className={styles.cardTitle}>{q.content}</h5>
                                                <p className={styles.cardText}>
                                                    <strong>{t('question_list_subject')}:</strong>{q.subject} <strong>{t('question_list_grade')}:</strong>{q.grade}
                                                </p>
                                                <p className={styles.cardText}>
                                                    <strong>{t('question_list_asker')}:</strong>{q.user?.fullName || t('question_list_anonymous')}
                                                </p>
                                                <p className={styles.cardText}>
                                                    <strong>{t('question_list_time')}:</strong>{''}
                                                    {q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.buttonGroup}>
                                            <button
                                                className={`${styles.btn} ${styles.btnPrimary}`}
                                                onClick={() => navigate(`/hocho/questions/${q.questionId}/answer`)}
                                            >
                                                {t('question_list_ask_for_answer')}
                                            </button>
                                            {isOwner && (
                                                <>
                                                    <button
                                                        className={`${styles.btn} ${styles.btnWarning}`}
                                                        onClick={() => handleEdit(q.questionId)}
                                                        disabled={deletingId === q.questionId}
                                                    >
                                                        <FontAwesomeIcon icon={faUserPen} />
                                                        {t('question_list_edit')}
                                                    </button>
                                                    <button
                                                        className={`${styles.btn} ${styles.btnDanger}`}
                                                        onClick={() => handleDelete(q.questionId)}
                                                        disabled={deletingId === q.questionId}
                                                    >
                                                        <FontAwesomeIcon icon={faEraser} />
                                                        {deletingId === q.questionId ? t('question_list_deleting') : t('question_list_delete')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <QuestionForm
                    show={showQuestionForm}
                    onClose={() => setShowQuestionForm(false)}
                    onSubmitRequest={handleQuestionSubmit}
                />
                <DeleteConfirmDialog
                    sh={showDeleteDialog}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            </div>
            <Footer />
        </>
    );
};

export default QuestionList;