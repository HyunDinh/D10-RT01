import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Dashboard() {
    const [data, setData] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8080/api/hocho/dashboard', { withCredentials: true })
            .then(response => setData(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <Header />
            <div className="container my-5">
                <h1 className="text-center">{data.title || 'Dashboard'}</h1>
                <p className="lead text-center">Tổng quan về hệ thống Hocho</p>
                <div className="row mt-4">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Thống kê học sinh</h5>
                                <p className="card-text">Số học sinh: {data.totalStudents || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Thống kê khóa học</h5>
                                <p className="card-text">Số khóa học: {data.totalCourses || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <Link to="/hocho/childList" className="btn btn-primary">Xem danh sách học sinh</Link>
                    <Link to="/hocho/teacher/course" className="btn btn-primary">Xem khóa học</Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Dashboard;