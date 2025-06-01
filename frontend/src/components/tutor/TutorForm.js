import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TutorForm.css';

const SUBJECTS = [
  'Toán', 'Văn', 'Tiếng Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Tin học', 'Khác'
];

const TutorForm = () => {
    const [form, setForm] = useState({
        specialization: '',
        experience: '',
        education: '',
        introduction: '',
        phoneNumber: ''
    });
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
                setUserId(res.data.id);
            } catch (err) {
                setError('Không thể lấy thông tin người dùng');
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post('http://localhost:8080/api/tutors/profile', { ...form, userId }, {
                withCredentials: true
            });
            setSuccess('Lưu thông tin gia sư thành công!');
            setForm({ specialization: '', experience: '', education: '', introduction: '', phoneNumber: '' });
        } catch (err) {
            setError('Không thể lưu thông tin gia sư');
        }
        setLoading(false);
    };

    return (
        <div className="container tutor-form mt-5">
            <h2 className="text-primary mb-4 text-center">Tạo/Cập nhật thông tin gia sư</h2>
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
                    <button type="submit" className="btn btn-primary" disabled={loading || !userId}>
                        {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TutorForm; 