import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddLessonContentPage() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState({
        title: '',
        file: null
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setContent({ ...content, file: files[0] });
        } else {
            setContent({ ...content, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.file || !content.title) {
            alert('Vui lòng nhập tiêu đề và chọn file!');
            return;
        }
        const formData = new FormData();
        formData.append('file', content.file);
        formData.append('title', content.title);
        try {
            await axios.post(
                `/api/lesson-contents/${lessonId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            navigate(`/hocho/teacher/course/${courseId}/lesson/${lessonId}/content`);
        } catch (error) {
            alert('Lỗi khi upload: ' + error.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Add Lesson Content</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={content.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="file" className="form-label">Upload PDF or Video</label>
                    <input
                        type="file"
                        className="form-control"
                        id="file"
                        name="file"
                        accept=".pdf,video/*"
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success me-2">Add Content</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </form>
        </div>
    );
}