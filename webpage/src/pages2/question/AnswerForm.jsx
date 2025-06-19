import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';

const AnswerForm = () => {
    const {id} = useParams(); // id của câu hỏi
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingAnswerId, setEditingAnswerId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, aRes, userRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/questions/${id}`, {withCredentials: true}),
                axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true}),
                axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true})
            ]);
            setQuestion(qRes.data);
            setAnswers(aRes.data);
            setUserId(userRes.data.id);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải dữ liệu câu hỏi hoặc câu trả lời');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('content', content);
            if (imageFile) formData.append('imageFile', imageFile);
            await axios.post(`http://localhost:8080/api/questions/${id}/answers`, formData, {
                withCredentials: true,
                headers: {'Content-Type': 'multipart/form-data'}
            });
            setSuccess('Đã gửi câu trả lời!');
            setContent('');
            setImageFile(null);
            // Reload lại danh sách câu trả lời
            const aRes = await axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true});
            setAnswers(aRes.data);
        } catch (err) {
            setError('Không thể gửi câu trả lời');
        }
        setSubmitting(false);
    };

    const handleEditClick = (answer) => {
        setEditingAnswerId(answer.answerId);
        setEditContent(answer.content);
        setEditImageFile(null);
    };

    const handleEditCancel = () => {
        setEditingAnswerId(null);
        setEditContent('');
        setEditImageFile(null);
    };

    const handleEditSave = async (answerId) => {
        setEditLoading(true);
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('content', editContent);
            if (editImageFile) formData.append('imageFile', editImageFile);
            await axios.put(`http://localhost:8080/api/questions/${id}/answers/${answerId}`, formData, {
                withCredentials: true,
                headers: {'Content-Type': 'multipart/form-data'}
            });
            setEditingAnswerId(null);
            setEditContent('');
            setEditImageFile(null);
            // Reload lại danh sách câu trả lời
            const aRes = await axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true});
            setAnswers(aRes.data);
        } catch (err) {
            setError('Không thể cập nhật câu trả lời');
        }
        setEditLoading(false);
    };

    const handleDelete = async (answerId) => {
        if (!window.confirm('Bạn có chắc muốn xóa câu trả lời này?')) return;
        setDeletingId(answerId);
        try {
            await axios.delete(`http://localhost:8080/api/questions/${id}/answers/${answerId}`, {
                data: {userId},
                withCredentials: true
            });
            // Reload lại danh sách câu trả lời
            const aRes = await axios.get(`http://localhost:8080/api/questions/${id}/answers`, {withCredentials: true});
            setAnswers(aRes.data);
        } catch (err) {
            setError('Không thể xóa câu trả lời');
        }
        setDeletingId(null);
    };

    if (loading) return <div className="alert alert-info text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="alert alert-danger text-center">{error}</div>;
    if (!question) return null;

    return (
        <div className="container mt-5">
            <div className="card mx-auto shadow" style={{maxWidth: 700}}>
                <div className="card-body">
                    <h4 className="card-title mb-3">{question.content}</h4>
                    <p className="card-text mb-1"><b>Môn:</b> {question.subject} &nbsp; <b>Lớp:</b> {question.grade}</p>
                    <p className="card-text mb-1"><b>Người hỏi:</b> {question.user?.fullName || 'Ẩn danh'}</p>
                    <p className="card-text mb-1"><b>Thời
                        gian:</b> {question.createdAt ? new Date(question.createdAt).toLocaleString() : ''}</p>
                    {question.imageUrl && <img src={`http://localhost:8080/${question.imageUrl}`} alt="Ảnh minh họa"
                                               className="img-fluid rounded mb-3"
                                               style={{maxHeight: 200}}/>}
                    <form onSubmit={handleSubmit} className="mb-4">
                        <label className="form-label">Nhập câu trả lời của bạn</label>
                        <textarea className="form-control mb-2" value={content}
                                  onChange={e => setContent(e.target.value)} required rows={3}/>
                        <input type="file" className="form-control mb-2" accept="image/*"
                               onChange={e => setImageFile(e.target.files[0])}/>
                        {error && <div className="alert alert-danger text-center">{error}</div>}
                        {success && <div className="alert alert-success text-center">{success}</div>}
                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary" disabled={submitting || !userId}>
                                {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                            </button>
                        </div>
                    </form>
                    <h5 className="mt-4 mb-3">Danh sách câu trả lời</h5>
                    {answers.length === 0 && <div className="text-muted">Chưa có câu trả lời nào.</div>}
                    {answers.map(a => {
                        const isOwner = userId && a.user && userId === a.user.id;
                        return (
                            <div key={a.answerId} className="border rounded p-3 mb-3 bg-light">
                                <div className="mb-1"><b>{a.user?.fullName || 'Ẩn danh'}:</b></div>
                                {editingAnswerId === a.answerId ? (
                                    <>
                                        <textarea className="form-control mb-2" value={editContent}
                                                  onChange={e => setEditContent(e.target.value)} rows={3}/>
                                        <input type="file" className="form-control mb-2" accept="image/*"
                                               onChange={e => setEditImageFile(e.target.files[0])}/>
                                        <div className="d-flex gap-2 mb-2">
                                            <button className="btn btn-success btn-sm"
                                                    onClick={() => handleEditSave(a.answerId)} disabled={editLoading}>
                                                {editLoading ? 'Đang lưu...' : 'Lưu'}
                                            </button>
                                            <button className="btn btn-secondary btn-sm" onClick={handleEditCancel}
                                                    disabled={editLoading}>
                                                Hủy
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>{a.content}</div>
                                        {a.imageUrl && (
                                            <img src={`http://localhost:8080${a.imageUrl}`} alt="Ảnh trả lời"
                                                 className="img-fluid rounded mb-2" style={{maxHeight: 150}}/>
                                        )}
                                    </>
                                )}
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <div className="text-end text-muted"
                                         style={{fontSize: '0.9em'}}>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</div>
                                    {isOwner && editingAnswerId !== a.answerId && (
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-outline-warning btn-sm"
                                                    onClick={() => handleEditClick(a)}>
                                                Sửa
                                            </button>
                                            <button className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleDelete(a.answerId)}
                                                    disabled={deletingId === a.answerId}>
                                                {deletingId === a.answerId ? 'Đang xóa...' : 'Xóa'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnswerForm; 