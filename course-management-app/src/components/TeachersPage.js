// File: src/components/TeachersPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async() => {
        const result = await axios.get("/api/teachers");
        setTeachers(result.data);
    }

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Teacher List</h1>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {teachers.map((teacher) => (
                        <tr>
                            <th>{teacher.userId}</th>
                            <td>{teacher.fullName}</td>
                            <td>{teacher.email}</td>
                            <td>
                                    <Link to={`/teachers/${teacher.userId}/courses`} className="btn btn-primary mx-2">
                                        View Courses
                                    </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};