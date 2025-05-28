import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function AccessDenied() {
    const [data, setData] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8080/api/hocho/access-denied', { withCredentials: true })
            .then(response => setData(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <Header />
            <div className="container my-5 text-center">
                <h1 className="text-danger">{data.title || 'Truy cập bị từ chối'}</h1>
                <p className="lead">Trang này yêu cầu quyền quản trị viên (Admin).</p>
                <p>Vui lòng đăng nhập bằng tài khoản có quyền Admin để tiếp tục.</p>
                <div className="mt-4">
                    <Link to="/hocho/login" className="btn btn-primary">Đăng nhập</Link>
                    <Link to="/hocho/dashboard" className="btn btn-secondary">Quay lại Dashboard</Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default AccessDenied;