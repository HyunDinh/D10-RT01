import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer';
import styles from "../../styles/QuestionList.module.css";
import {faChevronRight, faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import QuestionForm from "./QuestionForm.jsx";

const QuestionList = () => {
    const [user, setUser] = useState({});
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();
    const [showQuestionForm, setShowQuestionForm] = useState(false);


    useEffect(() => {
        fetchQuestions();
        fetchCurrentUser();
        fetchProfileData();

    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/questions', {
                    withCredentials: true,
                });
                setQuestions(res.data);
            } catch (err) {
                console.error('Error fetching questions:', err);
            }
        };
        fetchQuestions();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
            setUser(response.data);
            console.log('Fetched user data:', response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Không thể tải thông tin profile. Vui lòng thử lại.');
            if (err.response && err.response.status === 401) {
                navigate('/hocho/login');
            }
        }

    };

    const fetchQuestions = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/questions', {withCredentials: true});
            setQuestions(res.data);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải danh sách câu hỏi');
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
            setCurrentUser(res.data);
        } catch (err) {
            setCurrentUser(null);
        }
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
        setDeletingId(questionId);
        try {
            await axios.delete(`http://localhost:8080/api/questions/${questionId}`, {
                data: {userId: currentUser.id}, withCredentials: true
            });
            setQuestions(questions.filter(q => q.questionId !== questionId));
        } catch (err) {
            setError('Không thể xóa câu hỏi');
        }
        setDeletingId(null);
    };

    const handleEdit = (questionId) => {
        navigate(`/hocho/questions/${questionId}/edit`);
    };

    if (loading) return <div className="alert alert-info text-center">Loading question</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;

    const handleQuestionSubmit = (newQuestion) => {
        setQuestions((prev) => [newQuestion, ...prev]); // Add new question to list
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!user.avatarUrl || user.avatarUrl === 'none') {
            return `${baseUrl}/api/hocho/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
    };


    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>Forum</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                    data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">Home</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>Forum</li>
                </ul>
            </div>
        </section>

        <div className={styles.container}>
            <h2 className={styles.heading}>List Question</h2>
            <button className={styles.buttonAsk}
                    onClick={() => setShowQuestionForm(true)}
            ><FontAwesomeIcon icon={faPlus}/>
                Ask Question
            </button>
            <div className={styles.grid}>
                {questions.length === 0 && <div className={styles.noQuestions}>Chưa có câu hỏi nào.</div>}
                {questions.map(q => {
                    const isOwner = currentUser && q.user && currentUser.id === q.user.id;
                    return (
                        <div key={q.questionId} className={styles.gridItem}>
                            <div className={styles.card}>
                                <div className={styles.cardBody}>
                                    <img
                                        src={getAvatarUrl()}
                                        alt="User Avatar"
                                        className={styles.userAvatar}
                                    />
                                    <div className={styles.cardContent}>
                                        <h5 className={styles.cardTitle}>{q.content}</h5>
                                        <p className={styles.cardText}>
                                            <strong>Môn:</strong> {q.subject} &nbsp; <strong>Lớp:</strong> {q.grade}
                                        </p>
                                        <p className={styles.cardText}>
                                            <strong>Người hỏi:</strong> {q.user?.fullName || 'Ẩn danh'}
                                        </p>
                                        <p className={styles.cardText}>
                                            <strong>Thời
                                                gian:</strong> {q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}
                                        </p>
                                    </div>
                                    <div className={styles.buttonGroup}>
                                        <button
                                            className={`${styles.btn} ${styles.btnPrimary}`}
                                            onClick={() => navigate(`/hocho/questions/${q.questionId}/answer`)}
                                        >
                                            Đặt câu trả lời
                                        </button>
                                        {isOwner && (<>
                                            <button
                                                className={`${styles.btn} ${styles.btnWarning}`}
                                                onClick={() => handleEdit(q.questionId)}
                                                disabled={deletingId === q.questionId}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.btnDanger}`}
                                                onClick={() => handleDelete(q.questionId)}
                                                disabled={deletingId === q.questionId}
                                            >
                                                {deletingId === q.questionId ? 'Đang xóa...' : 'Xóa'}
                                            </button>
                                        </>)}
                                    </div>
                                </div>
                            </div>
                        </div>);
                })}
            </div>
            <QuestionForm
                show={showQuestionForm}
                onClose={() => setShowQuestionForm(false)}
                onSubmitRequest={handleQuestionSubmit}
            />
        </div>
        <Footer/>
    </>);
};

export default QuestionList; 