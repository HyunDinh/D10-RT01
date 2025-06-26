import React, { useState, useEffect } from 'react';
import {useNavigate, useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

export default function EditLessonPage() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [lesson, setLesson] = useState({
        title: '',
        duration: '',
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!location.state?.lesson) {
            navigate(`/hocho/teacher/course/${courseId}/lesson`);
            return;
        }
        setLesson(location.state.lesson);
    }, [location.state, courseId, navigate]);

    const handleChange = (e) => {
        setLesson({ ...lesson, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const tempErrors = {};
        if (!lesson.title) tempErrors.title = 'Required';
        if (!lesson.duration) tempErrors.duration = 'Required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            await axios.put(`/api/lessons/${lessonId}`, lesson, {
                withCredentials: true
            });
            // toast.success("Lesson updated successfully!");
            setTimeout(() => {
                navigate(`/hocho/teacher/course/${courseId}/lesson`);
            }, 1500);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else {
                setError('Failed to update lesson.');
            }
        }
    };

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-warning text-white">
                            <h4 className="mb-0">Edit Lesson</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="lessonTitle" className="form-label">Lesson Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        id="lessonTitle"
                                        placeholder="Enter lesson title"
                                        value={lesson.title}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.title && <div className="text-danger">{errors.title}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lessonDuration" className="form-label">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="duration"
                                        id="lessonDuration"
                                        placeholder="Enter duration"
                                        value={lesson.duration}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.duration && <div className="text-danger">{errors.duration}</div>}
                                </div>
                                <button type="submit" className="btn btn-warning w-100">Save Changes</button>
                                <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate(-1)}>
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/*<ToastContainer />*/}
        </div>
    );
}