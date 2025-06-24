import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/tutor/Tutor.module.css';

const AdminTutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTutors();
    }, []);

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

    const handleApprove = async (tutorId) => {
        try {
            await axios.put(`http://localhost:8080/api/tutors/${tutorId}/status?status=APPROVED`, {}, {
                withCredentials: true
            });
            fetchTutors();
        } catch (err) {
            setError('Không thể phê duyệt gia sư');
        }
    };

    const handleReject = async (tutorId) => {
        try {
            await axios.put(`http://localhost:8080/api/tutors/${tutorId}/status?status=REJECTED`, {}, {
                withCredentials: true
            });
            fetchTutors();
        } catch (err) {
            setError('Không thể từ chối gia sư');
        }
    };

    if (loading) return <div className="alert alert-info text-center">Đang tải danh sách gia sư...</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;

    return (
        <div className={styles.tutorContainer}>
            <h2 className={styles.tutorTitle}>Quản lý gia sư (Admin)</h2>
            <div className="row g-4">
                {tutors.map(tutor => (
                    <div key={tutor.tutorId} className="col-md-6">
                        <div className={styles.tutorCard}>
                            <h5 className={styles.tutorCardTitle}>{tutor.user.fullName}</h5>
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
                            <div className={styles.tutorBtnGroup}>
                                <button
                                    className={styles.tutorBtn}
                                    onClick={() => navigate(`/hocho/tutors/profile/${tutor.user.id}`)}
                                >
                                    Xem chi tiết
                                </button>
                                {tutor.status !== 'APPROVED' && (
                                    <button className={styles.tutorBtn} style={{background:'#4caf50'}} onClick={() => handleApprove(tutor.tutorId)}>
                                        Duyệt
                                    </button>
                                )}
                                {tutor.status !== 'REJECTED' && (
                                    <button className={styles.tutorBtn} style={{background:'#e53935'}} onClick={() => handleReject(tutor.tutorId)}>
                                        Từ chối
                                    </button>
                                )}
                                <button className={styles.tutorBtn} style={{background:'#888'}} onClick={() => handleDelete(tutor.user.id)}>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminTutorList; 