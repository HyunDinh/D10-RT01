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
        const result = await axios.get('/teachers');
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
                            <th>{teacher.user_id}</th>
                            <td>{teacher.full_name}</td>
                            <td>{teacher.email}</td>
                            <td>
                                    <Link to={`/teachers/${teacher.user_id}/courses`} className="btn btn-primary mx-2">
                                        View Courses
                                    </Link>
                            </td>
                            {/*<td>{teacher.teacher_id}</td>*/}
                            {/*<td>{teacher.name}</td>*/}
                            {/*<td>{teacher.email}</td>*/}
                            {/*<td>*/}
                            {/*</td>*/}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};