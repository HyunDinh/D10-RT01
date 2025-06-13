// File: src/components/course/AddLessonPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddLessonPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState({
        title: '',
        duration: ''
    });
    const [errors, setErrors] = useState({});

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
            await axios.post(`/api/lessons/add/${courseId}`, lesson);
            setTimeout(() => {
                navigate(`/hocho/teacher/course/${courseId}/lesson`);
            }, 1500);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-success text-white">
                            <h4 className="mb-0">Add New Lesson</h4>
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
                                    <label htmlFor="lessonDuration" className="form-label">Duration</label>
                                    <input
                                      type="number"
                                      className="form-control"
                                      name="duration"
                                      id="lessonDuration"
                                      placeholder="Enter lesson duration"
                                      value={lesson.duration}
                                      onChange={handleChange}
                                      required
                                    />
                                    {errors.duration && <div className="text-danger">{errors.duration}</div>}
                                </div>
                                <button type="submit" className="btn btn-success w-100">Add Lesson</button>
                                <button
                                    type="button"
                                    className="btn btn-secondary w-100 mt-2"
                                    onClick={() => navigate(-1)}>
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}