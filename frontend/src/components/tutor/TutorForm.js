import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './TutorForm.css';

const SUBJECTS = [
  'Toán', 'Văn', 'Tiếng Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Tin học', 'Khác'
];

const TutorForm = () => {
    const { userId } = useParams();
    const [form, setForm] = useState({
        specialization: '',
        experience: '',
        education: '',
        introduction: '',
        phoneNumber: ''
    });
    const [currentUserId, setCurrentUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
                setCurrentUserId(res.data.id);
            } catch (err) {
                setError('Không thể lấy thông tin người dùng');
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (userId) {
            // Nếu có userId trên URL, fetch thông tin gia sư để sửa
            const fetchTutor = async () => {
                try {
                    const res = await axios.get(`http://localhost:8080/api/tutors/profile/${userId}`, { withCredentials: true });
                    const t = res.data;
                    setForm({
                        specialization: t.specialization || '',
                        experience: t.experience || '',
                        education: t.education || '',
                        introduction: t.introduction || '',
                        phoneNumber: t.user?.phoneNumber || ''
                    });
                } catch (err) {
                    setError('Không thể tải thông tin gia sư');
                }
            };
            fetchTutor();
        }
    }, [userId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Dù là tạo mới hay sửa đều gọi POST và truyền userId
            await axios.post('http://localhost:8080/api/tutors/profile', { ...form, userId: userId || currentUserId }, {
                withCredentials: true
            });
            setSuccess(userId ? 'Cập nhật thông tin gia sư thành công!' : 'Lưu thông tin gia sư thành công!');
            if (!userId) {
                setForm({ specialization: '', experience: '', education: '', introduction: '', phoneNumber: '' });
            }
        } catch (err) {
            setError('Không thể lưu thông tin gia sư');
        }
        setLoading(false);
    };

    return (
        <div className="container tutor-form mt-5">
            <h2 className="text-primary mb-4 text-center">{userId ? 'Chỉnh sửa thông tin gia sư' : 'Tạo thông tin gia sư'}</h2>
            <form className="card mx-auto p-4 shadow" style={{maxWidth: 600}} onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Chuyên môn</label>
                    <select className="form-select" name="specialization" value={form.specialization} onChange={handleChange} required>
                        <option value="">-- Chọn môn chuyên môn --</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Kinh nghiệm (năm)</label>
                    <input type="number" className="form-control" name="experience" value={form.experience} onChange={handleChange} required min="0" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Học vấn</label>
                    <input type="text" className="form-control" name="education" value={form.education} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Giới thiệu</label>
                    <textarea className="form-control" name="introduction" value={form.introduction} onChange={handleChange} required rows={3} />
                </div>
                {error && <div className="alert alert-danger text-center">{error}</div>}
                {success && <div className="alert alert-success text-center">{success}</div>}
                <div className="d-flex justify-content-center">
                    <button type="submit" className="btn btn-primary" disabled={loading || (!userId && !currentUserId)}>
                        {loading ? 'Đang lưu...' : (userId ? 'Cập nhật' : 'Lưu thông tin')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TutorForm; 