import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const SUBJECTS = [
  'Toán', 'Văn', 'Tiếng Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'Tin học', 'Khác'
];
const GRADES = [1,2,3,4,5,6,7,8,9,10,11,12];

const QuestionEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    content: '',
    subject: '',
    grade: '',
    imageUrl: ''
  });
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, userRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/questions/${id}`, { withCredentials: true }),
        axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true })
      ]);
      const q = qRes.data;
      setForm({
        content: q.content || '',
        subject: q.subject || '',
        grade: q.grade || '',
        imageUrl: q.imageUrl || ''
      });
      setUserId(userRes.data.id);
      // Kiểm tra quyền
      if (!q.user || q.user.id !== userRes.data.id) {
        setError('Bạn không có quyền chỉnh sửa câu hỏi này!');
      }
      setLoading(false);
    } catch (err) {
      setError('Không thể tải dữ liệu câu hỏi');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('imageFile', file);
    try {
      // Gửi file lên backend qua endpoint upload ảnh tạm (dùng lại hàm upload ảnh trả lời)
      const res = await axios.post('http://localhost:8080/api/questions/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setForm({ ...form, imageUrl: res.data.imageUrl });
    } catch (err) {
      alert('Upload ảnh thất bại!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.put(`http://localhost:8080/api/questions/${id}`, {
        userId,
        content: form.content,
        subject: form.subject,
        grade: form.grade,
        imageUrl: form.imageUrl || null
      }, { withCredentials: true });
      setSuccess('Cập nhật câu hỏi thành công!');
      setTimeout(() => navigate('/hocho/questions'), 1200);
    } catch (err) {
      setError('Không thể cập nhật câu hỏi');
    }
    setLoading(false);
  };

  if (loading) return <div className="alert alert-info text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4 text-center">Chỉnh sửa câu hỏi</h2>
      <form className="card mx-auto p-4 shadow" style={{maxWidth: 600}} onSubmit={handleSubmit}>
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
          <label className="form-label">Ảnh minh họa (tùy chọn, chỉ chọn file)</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
        </div>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {success && <div className="alert alert-success text-center">{success}</div>}
        <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary" disabled={loading || !userId}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionEdit; 