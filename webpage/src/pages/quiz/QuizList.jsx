import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Link, useLocation} from 'react-router-dom';
import styles from '../../styles/quiz/QuizList.module.css';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";


const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const courseId = queryParams.get('courseId');

    useEffect(() => {
        fetchQuizzes();
        // eslint-disable-next-line
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            let url = 'http://localhost:8080/api/quizzes';
            if (courseId) {
                url = `http://localhost:8080/api/quizzes/course/${courseId}`;
            }
            const res = await axios.get(url, {
                withCredentials: true
            });
            if (Array.isArray(res.data)) {
                setQuizzes(res.data);
            } else {
                console.error('API response for quizzes is not an array:', res.data);
                setError('Dữ liệu danh sách quiz không hợp lệ.');
            }
            setLoading(false);
        } catch (err) {
            console.error('Lỗi khi tải danh sách quiz:', err);
            setError('Không thể tải danh sách quiz');
            setLoading(false);
        }
    };

    if (!courseId) {
        return (
            <div className={styles.quizListAlert}>
                Bạn phải chọn một khóa học để xem hoặc tạo quiz.<br/>
                Vui lòng quay lại trang khóa học.
            </div>
        );
    }

    if (loading) return <div className={styles.quizListAlert}>Đang tải...</div>;
    if (error) return <div className={styles.quizListAlert}>{error}</div>;

    return (
        <>
            <Header />
            <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={styles.headerInfo}>
                    <p>Quizzez Content</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>
                            <a href={`/hocho/teacher/course/${courseId}/lesson`}>Course Detail</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>Quizzez Content</li>
                    </ul>
                </div>
            </section>

            <div className={styles.quizListContainer}>
                <div className={styles.quizListHeader}>
                    <h2 className={styles.quizListTitle}>Danh sách Quiz</h2>
                    <Link to={`/hocho/teacher/quizzes/create?courseId=${courseId}`}
                          className={styles.quizListCreateBtn}>
                        Tạo Quiz mới
                    </Link>
                </div>

                {quizzes.length === 0 ? (
                    <div className={styles.quizListAlert}>Chưa có quiz nào</div>
                ) : (
                    <div className={styles.quizListGrid}>
                        {quizzes.map(quiz => (
                            <div key={quiz.quizId} className={styles.quizCard}>
                                <div className={styles.quizCardBody}>
                                    <h5 className={styles.quizCardTitle}>{quiz.title}</h5>
                                    <p className={styles.quizCardDesc}>{quiz.description}</p>
                                    <div className={styles.quizCardInfo}>Thời gian: {quiz.timeLimit} phút</div>
                                    <div className={styles.quizCardInfo}>Tổng điểm: {quiz.totalPoints} điểm</div>
                                    <div className={styles.quizCardInfo}>Số câu hỏi: {quiz.questions?.length || 0} câu
                                    </div>
                                </div>
                                <div className={styles.quizCardFooter}>
                                    <Link to={`/hocho/teacher/quizzes/${quiz.quizId}`} className={styles.quizCardBtn}>
                                        Chi tiết
                                    </Link>
                                    <Link to={`/hocho/teacher/quizzes/${quiz.quizId}/edit`}
                                          className={styles.quizCardBtn}>
                                        Chỉnh sửa
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default QuizList; 