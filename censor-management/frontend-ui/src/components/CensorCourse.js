// CourseApproval.js - React version of the Thymeleaf course approval page

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const CourseApproval = () => {
    const [courses, setCourses] = useState([]);

    // Load pending courses when component mounts
    const fetchCourses = () => {
        axios.get('http://localhost:8080/api/courses/pending')
            .then(res => {
                console.log("Fetched courses:", res.data);
                setCourses(res.data);
            })
            .catch(err => console.error('Error loading courses:', err));
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleApprove = (id) => {
        axios.post(`http://localhost:8080/api/courses/${id}/approve`)
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
        axios.post(`http://localhost:8080/api/courses/${id}/reject`)
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
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {courses.map(course => (
                            <tr key={course.courseId}>
                                <td>{course.courseId}</td>
                                <td>{course.title}</td>
                                <td>{course.teacher ? course.teacher.fullName : 'N/A'}</td>
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
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CourseApproval;
