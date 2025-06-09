// File: `frontend/src/components/course/LessonContentPage.js`
import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddLessonContentPage() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [contentType, setContentType] = useState([]);
    const [content, setContent] = useState({
        contentType: '',
        contentUrl: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchContentTypes();
    })

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const tempErrors = {};
        if (!content.contentType) tempErrors.contentBody = 'Required';
        if (!content.contentUrl) tempErrors.contentUrl = 'Required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const fetchContentTypes = async () => {
        try {
            const response = await axios.get('/api/lessons/content-types', { withCredentials: true });
            setContentType(response.data);
        } catch (error) {
            console.error('Error fetching content types:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('lessonId', lessonId);
        formData.append('contentType', content.contentType);
        formData.append('contentFile', content.contentFile);
        try {
            const response = await axios.post(
                `/api/lessons/${lessonId}/contents/add`,
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            // Log the returned file URL
            console.log('Uploaded file URL:', response.data.url);
            setTimeout(() => {
                navigate(`/hocho/teacher/course/${courseId}/lesson/${lessonId}/content`);
            }, 1500);
        } catch (error) {
            console.error('Error adding content:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Add Lesson Content</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="contentType" className="form-label">Content type</label>
                    <select
                        className="form-select"
                        name="contentType"
                        id="contentType"
                        value={content.contentType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select content type</option>
                        {contentType.map((group) => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                    {errors.age_group && <div className="text-danger">{errors.age_group}</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="contentFile" className="form-label">Upload PDF or Video</label>
                    <input
                        type="file"
                        className="form-control"
                        id="contentFile"
                        name="contentFile"
                        accept=".pdf,video/*"
                        onChange={(e) => setContent({ ...content, contentFile: e.target.files[0] })}
                    />
                    {errors.contentFile && <div className="text-danger">{errors.contentFile}</div>}
                </div>
                <button type="submit" className="btn btn-success me-2">Add Content</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </form>
        </div>
    );
}