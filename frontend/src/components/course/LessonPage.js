// File: `course-management-app/src/components/course/LessonPage.js`
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function LessonPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        try {
            const result = await axios.get(`/api/lessons/course/${courseId}`, {
                withCredentials: true
            });
            setLessons(result.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else {
                setError('Failed to load lessons. Please try again later.');
            }
        }
    };

    const handleDelete = async (lessonId) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) {
            return;
        }
        try {
            await axios.delete(`/api/lessons/${lessonId}`, {
                withCredentials: true
            });
            fetchLessons(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error deleting lesson:', error);
            if (error.response?.status === 401) {
                navigate('/hocho/login');
            } else {
                setError('Failed to delete lesson. Please try again later.');
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Lessons</h1>
                <div>
                    <Link to={`/hocho/teacher/course/${courseId}/lesson/add`} className="btn btn-success me-2">
                        Add New Lesson
                    </Link>
                    <Link to="/hocho/teacher/course" className="btn btn-secondary">
                        Back to Courses
                    </Link>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead className="table-dark">
                    <tr>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {lessons.map(lesson => (
                        <tr key={lesson.lessonId}>
                            <td>{lesson.title}</td>
                            <td>{lesson.duration}</td>
                            <td>{new Date(lesson.createdAt).toLocaleString()}</td>
                            <td>{new Date(lesson.updatedAt).toLocaleString()}</td>
                            <td>
                                <Link
                                    to={`/hocho/teacher/course/${courseId}/lesson/${lesson.lessonId}/edit`}
                                    className="btn btn-warning btn-sm me-2"
                                    state={{ lesson }}>
                                    Edit
                                </Link>
                                <Link
                                    to={`/hocho/teacher/course/${courseId}/lesson/${lesson.lessonId}/content`}
                                    className="btn btn-info btn-sm me-2">
                                    View Content
                                </Link>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(lesson.lessonId)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {lessons.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center">No lessons available.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}