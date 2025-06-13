import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './TutorProfile.css';

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
        <div className="container tutor-profile mt-5">
            <h2 className="text-primary mb-4 text-center">Thông tin gia sư</h2>
            <div className="card mx-auto shadow" style={{maxWidth: 600}}>
                <div className="card-body">
                    <h4 className="card-title mb-3">{tutor.user.fullName}</h4>
                    <p className="card-text"><b>Email:</b> {tutor.user.email}</p>
                    <p className="card-text"><b>Số điện thoại:</b> {tutor.user.phoneNumber}</p>
                    <p className="card-text"><b>Chuyên môn:</b> {tutor.specialization}</p>
                    <p className="card-text"><b>Kinh nghiệm:</b> {tutor.experience} năm</p>
                    <p className="card-text"><b>Học vấn:</b> {tutor.education}</p>
                    <p className="card-text"><b>Giới thiệu:</b> {tutor.introduction}</p>
                    <p className="card-text">
                        <b>Trạng thái:</b> {tutor.status === 'APPROVED' ? (
                            <span className="badge bg-success">Đã duyệt</span>
                        ) : tutor.status === 'REJECTED' ? (
                            <span className="badge bg-danger">Từ chối</span>
                        ) : (
                            <span className="badge bg-warning text-dark">Chờ duyệt</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TutorProfile; 