import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [logoutMessage, setLogoutMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error')) {
            setError('Tên người dùng hoặc mật khẩu không đúng');
        }
        if (params.get('logout')) {
            setLogoutMessage('Bạn đã đăng xuất thành công');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/loginSubmit',
                new URLSearchParams({
                    username,
                    password
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    withCredentials: true
                }
            );
            // Nhận JSON từ server
            const { redirect } = response.data;
            // Điều hướng bằng React Router
            navigate(redirect);
        } catch (err) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Tên người dùng hoặc mật khẩu không đúng');
                } else if (err.response.status === 403) {
                    setError('Truy cập bị từ chối. Vui lòng kiểm tra CORS hoặc quyền truy cập');
                } else {
                    setError(`Lỗi: ${err.response.data?.message || 'Đăng nhập thất bại'}`);
                }
            } else {
                setError('Không thể kết nối đến server');
            }
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
            <div className="login-container" style={{ maxWidth: '400px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <h2 className="text-center mb-4">Đăng nhập</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                {logoutMessage && <div className="alert alert-success">{logoutMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Tên người dùng</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
                </form>
            </div>
        </div>
    );
}

export default Login;