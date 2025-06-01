import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SUBJECTS = [
  'Toán', 'Văn', 'Tiếng Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Tin học', 'Khác'
];
const GRADES = [1,2,3,4,5,6,7,8,9,10,11,12];

const QuestionForm = () => {
  const [form, setForm] = useState({
    content: '',
    subject: '',
    grade: ''
  });
  const [userId, setUserId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Lấy userId từ profile
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

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('content', form.content);
      formData.append('subject', form.subject);
      formData.append('grade', form.grade);
      if (imageFile) formData.append('imageFile', imageFile);
      await axios.post('http://localhost:8080/api/questions', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Đặt câu hỏi thành công!');
      setForm({ content: '', subject: '', grade: '' });
      setImageFile(null);
    } catch (err) {
      setError('Không thể gửi câu hỏi');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4 text-center">Đặt câu hỏi mới</h2>
      <form className="card mx-auto p-4 shadow" style={{maxWidth: 600}} onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Nội dung câu hỏi</label>
          <textarea className="form-control" name="content" value={form.content} onChange={handleChange} required rows={3} />
        </div>
        <div className="mb-3">
          <label className="form-label">Môn học</label>
          <select className="form-select" name="subject" value={form.subject} onChange={handleChange} required>
            <option value="">-- Chọn môn học --</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Lớp</label>
          <select className="form-select" name="grade" value={form.grade} onChange={handleChange} required>
            <option value="">-- Chọn lớp --</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Ảnh minh họa (tùy chọn)</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
        </div>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {success && <div className="alert alert-success text-center">{success}</div>}
        <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary" disabled={loading || !userId}>
            {loading ? 'Đang gửi...' : 'Gửi câu hỏi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm; 