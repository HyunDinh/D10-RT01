import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from '../../styles/Tutor.module.css';

const TutorProfile = () => {
    const { userId } = useParams();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTutor();
    }, [userId]);

    const fetchTutor = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/tutors/profile/${userId}`, {
                withCredentials: true
            });
            setTutor(response.data);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải thông tin gia sư');
            setLoading(false);
        }
    };

    if (loading) return <div className="alert alert-info text-center">Đang tải thông tin gia sư...</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;
    if (!tutor) return null;

    return (
        <div className={styles.tutorContainer}>
            <h2 className={styles.tutorTitle}>Thông tin gia sư</h2>
            <div className={styles.tutorCard}>
                <h4 className={styles.tutorCardTitle}>{tutor.user.fullName}</h4>
                <p className={styles.tutorCardText}><b>Email:</b> {tutor.user.email}</p>
                <p className={styles.tutorCardText}><b>Số điện thoại:</b> {tutor.user.phoneNumber}</p>
                <p className={styles.tutorCardText}><b>Chuyên môn:</b> {tutor.specialization}</p>
                <p className={styles.tutorCardText}><b>Kinh nghiệm:</b> {tutor.experience} năm</p>
                <p className={styles.tutorCardText}><b>Học vấn:</b> {tutor.education}</p>
                <p className={styles.tutorCardText}><b>Giới thiệu:</b> {tutor.introduction}</p>
                <p className={styles.tutorCardText}>
                    <b>Trạng thái:</b> {tutor.status === 'APPROVED' ? (
                        <span className={`${styles.tutorBadge} ${styles.approved}`}>Đã duyệt</span>
                    ) : tutor.status === 'REJECTED' ? (
                        <span className={`${styles.tutorBadge} ${styles.rejected}`}>Từ chối</span>
                    ) : (
                        <span className={`${styles.tutorBadge} ${styles.pending}`}>Chờ duyệt</span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default TutorProfile;