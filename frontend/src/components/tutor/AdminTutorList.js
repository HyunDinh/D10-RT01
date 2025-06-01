import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TutorList.css';

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
        <div className="container tutor-list mt-5">
            <h2 className="text-primary mb-4 text-center">Quản lý gia sư (Admin)</h2>
            <div className="row g-4">
                {tutors.map(tutor => (
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
                                <p className="card-text">
                                    <b>Trạng thái:</b> {tutor.status === 'APPROVED' ? (
                                        <span className="badge bg-success">Đã duyệt</span>
                                    ) : tutor.status === 'REJECTED' ? (
                                        <span className="badge bg-danger">Từ chối</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark">Chờ duyệt</span>
                                    )}
                                </p>
                                <div className="d-flex gap-2 flex-wrap mt-2">
                                    <button
                                        className="btn btn-outline-info btn-sm"
                                        onClick={() => navigate(`/hocho/tutors/profile/${tutor.user.id}`)}
                                    >
                                        <i className="bi bi-eye"></i> Xem chi tiết
                                    </button>
                                    {tutor.status !== 'APPROVED' && (
                                        <button className="btn btn-outline-success btn-sm" onClick={() => handleApprove(tutor.tutorId)}>
                                            <i className="bi bi-check-circle"></i> Duyệt
                                        </button>
                                    )}
                                    {tutor.status !== 'REJECTED' && (
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleReject(tutor.tutorId)}>
                                            <i className="bi bi-x-circle"></i> Từ chối
                                        </button>
                                    )}
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => handleDelete(tutor.user.id)}>
                                        <i className="bi bi-trash"></i> Xóa
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

export default AdminTutorList; 