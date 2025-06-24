import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/tutor/Tutor.module.css';

const PublicTutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTutors();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
            setCurrentUser(response.data);
        } catch (err) {
            // Không cần báo lỗi nếu chưa đăng nhập
        }
    };

    const fetchTutors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/tutors', {
                withCredentials: true
            });
            setTutors(response.data);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải danh sách gia sư');
            setLoading(false);
        }
    };

    const handleEdit = (userId) => {
        navigate(`/hocho/tutors/form/${userId}`);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bạn có chắc muốn xóa gia sư này?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/tutors/profile/${userId}`, {
                withCredentials: true
            });
            fetchTutors();
        } catch (err) {
            setError('Không thể xóa gia sư');
        }
    };

    if (loading) return <div className="alert alert-info text-center">Đang tải danh sách gia sư...</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;

    return (
        <div className={styles.tutorContainer}>
            <h2 className={styles.tutorTitle}>Danh sách gia sư</h2>
            <div className="row g-4">
                {tutors
                    .filter(tutor => tutor.status === 'APPROVED')
                    .map(tutor => (
                        <div key={tutor.tutorId} className="col-md-6">
                            <div className={styles.tutorCard}>
                                <h5 className={styles.tutorCardTitle}>{tutor.user.fullName}</h5>
                                <p className={styles.tutorCardText}><b>Email:</b> {tutor.user.email}</p>
                                <p className={styles.tutorCardText}><b>Số điện thoại:</b> {tutor.user.phoneNumber}</p>
                                <p className={styles.tutorCardText}><b>Chuyên môn:</b> {tutor.specialization}</p>
                                <p className={styles.tutorCardText}><b>Kinh nghiệm:</b> {tutor.experience} năm</p>
                                <p className={styles.tutorCardText}><b>Học vấn:</b> {tutor.education}</p>
                                <p className={styles.tutorCardText}><b>Giới thiệu:</b> {tutor.introduction}</p>
                                <div className={styles.tutorBtnGroup}>
                                    <button
                                        className={styles.tutorBtn}
                                        onClick={() => navigate(`/hocho/tutors/profile/${tutor.user.id}`)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    {currentUser && tutor.user && currentUser.id === tutor.user.id && (
                                        <>
                                            <button
                                                className={styles.tutorBtn}
                                                style={{background:'#ffb300', color:'#333'}}
                                                onClick={() => handleEdit(tutor.user.id)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className={styles.tutorBtn}
                                                style={{background:'#e53935'}}
                                                onClick={() => handleDelete(tutor.user.id)}
                                            >
                                                Xóa
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default PublicTutorList; 