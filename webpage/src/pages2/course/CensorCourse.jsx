import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseApproval = () => {
    const [courses, setCourses] = useState([]);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [lessonMap, setLessonMap] = useState({});

    const fetchCourses = () => {
        axios.get('http://localhost:8080/api/courses/pending', {
            withCredentials: true
        })
            .then(res => {
                const mapped = res.data.map(course => ({
                    ...course,
                    ageGroup: course.age_group || course.ageGroup,
                }));
                setCourses(mapped);
            })
            .catch(err => console.error('Error loading courses:', err));
    };


    const fetchLessons = (courseId) => {
        axios.get(`http://localhost:8080/api/lessons/course/${courseId}`, {
            withCredentials: true
        })
            .then(res => {
                setLessonMap(prev => ({ ...prev, [courseId]: res.data }));
                setExpandedCourseId(courseId);
            })
            .catch(err => console.error('Error loading lessons:', err));

    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleApprove = (id) => {
        axios.post(`http://localhost:8080/api/courses/${id}/approve`, {}, {
            withCredentials: true
        })
            .then(() => {
                setCourses(prev =>
                    prev.map(course =>
                        course.courseId === id ? { ...course, status: 'APPROVED' } : course
                    )
                );
            })
            .catch(err => console.error(err));
    };

    const handleReject = (id) => {
        axios.post(`http://localhost:8080/api/courses/${id}/reject`, {}, {
            withCredentials: true
        })
            .then(() => {
                setCourses(prev =>
                    prev.map(course =>
                        course.courseId === id ? { ...course, status: 'REJECTED' } : course
                    )
                );
            })
            .catch(err => console.error(err));
    };

    return (
        <div>
            {/* Header */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">Admin Dashboard</span>
                </div>
            </nav>

            <div className="container mt-5">
                <h2 className="mb-4 text-center">Pending Course Approvals</h2>

                {courses.length === 0 ? (
                    <div className="alert alert-warning text-center">
                        No courses pending approval.
                    </div>
                ) : (
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                        <tr>
                            <th>Course ID</th>
                            <th>Title</th>
                            <th>Teacher</th>
                            <th>Age Group</th>
                            <th>Price</th>
                            <th>Created At</th>
                            <th>Status</th>
                            <th>View Details</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {courses.map(course => (
                            <React.Fragment key={course.courseId}>
                                <tr>
                                    <td>{course.courseId}</td>
                                    <td>{course.title}</td>
                                    {/*<td>{course.teacher ? course.teacher.fullName : 'N/A'}</td>*/}
                                    <td>{course.teacher.fullName}</td>
                                    <td>{course.ageGroup}</td>
                                    <td>{course.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td>{new Date(course.createdAt).toLocaleString()}</td>
                                    <td>
                                        <span className={
                                            course.status === 'APPROVED' ? 'text-success' :
                                                course.status === 'REJECTED' ? 'text-danger' : 'text-warning'
                                        }>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() =>
                                                expandedCourseId === course.courseId
                                                    ? setExpandedCourseId(null)
                                                    : fetchLessons(course.courseId)
                                            }
                                        >
                                            👁 View Details
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-success btn-sm me-1"
                                            onClick={() => handleApprove(course.courseId)}
                                            disabled={course.status !== 'PENDING'}
                                        >
                                            ✅ Accept
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleReject(course.courseId)}
                                            disabled={course.status !== 'PENDING'}
                                        >
                                            ❌ Reject
                                        </button>
                                    </td>
                                </tr>

                                {expandedCourseId === course.courseId && (
                                    <tr>
                                        <td colSpan="9">

                                            {lessonMap[course.courseId]?.length > 0 ? (
                                                <table className="table table-sm table-striped mt-2">
                                                    <thead>
                                                    <tr>
                                                        <th>Lesson ID</th>
                                                        <th>Title</th>
                                                        <th>Duration (min)</th>
                                                        <th>Created At</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {lessonMap[course.courseId].map(lesson => (
                                                        <tr key={lesson.lessonId}>
                                                            <td>{lesson.lessonId}</td>
                                                            <td>{lesson.title}</td>
                                                            <td>{lesson.duration}</td>
                                                            <td>{new Date(lesson.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                            }</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>

                                            ) : (
                                                <span className="text-muted">No lessons available.</span>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CourseApproval;
