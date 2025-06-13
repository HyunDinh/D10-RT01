import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Home() {
    const [data, setData] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8080/api/hocho/home', { withCredentials: true })
            .then(response => setData(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <Header />
            <div className="container my-5">
                <h1 className="text-center">{data.title || 'Chào mừng đến với Hocho'}</h1>
                <p className="lead text-center">Hệ thống quản lý giáo dục thông minh cho học sinh, phụ huynh và giáo viên.</p>
                <div className="row mt-4">
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Học sinh</h5>
                                <p className="card-text">Theo dõi tiến độ học tập và thông tin cá nhân của học sinh.</p>
                                <Link to="/hocho/childList" className="btn btn-primary">Xem danh sách học sinh</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Phụ huynh</h5>
                                <p className="card-text">Kết nối với giáo viên và theo dõi hoạt động của con bạn.</p>
                                <Link to="/hocho/parent" className="btn btn-primary">Thông tin phụ huynh</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Giáo viên</h5>
                                <p className="card-text">Quản lý khóa học và thông tin học sinh dễ dàng.</p>
                                <Link to="/hocho/teacher" className="btn btn-primary">Quản lý khóa học</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Home;