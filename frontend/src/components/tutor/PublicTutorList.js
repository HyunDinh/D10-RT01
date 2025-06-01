import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TutorList.css';

const PublicTutorList = () => {
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

    if (loading) return <div className="alert alert-info text-center">Đang tải danh sách gia sư...</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;

    return (
        <div className="container tutor-list mt-5">
            <h2 className="text-primary mb-4 text-center">Danh sách gia sư</h2>
            <div className="row g-4">
                {tutors
                    .filter(tutor => tutor.status === 'APPROVED')
                    .map(tutor => (
                        <div key={tutor.tutorId} className="col-md-6">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{tutor.user.fullName}</h5>
                                    <p className="card-text"><b>Email:</b> {tutor.user.email}</p>
                                    <p className="card-text"><b>Số điện thoại:</b> {tutor.user.phoneNumber}</p>
                                    <p className="card-text"><b>Chuyên môn:</b> {tutor.specialization}</p>
                                    <p className="card-text"><b>Kinh nghiệm:</b> {tutor.experience} năm</p>
                                    <p className="card-text"><b>Học vấn:</b> {tutor.education}</p>
                                    <p className="card-text"><b>Giới thiệu:</b> {tutor.introduction}</p>
                                    <div className="d-flex gap-2 flex-wrap mt-2">
                                        <button
                                            className="btn btn-outline-info btn-sm"
                                            onClick={() => navigate(`/hocho/tutors/profile/${tutor.user.id}`)}
                                        >
                                            <i className="bi bi-eye"></i> Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default PublicTutorList; 