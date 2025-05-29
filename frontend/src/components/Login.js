import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [logoutMessage, setLogoutMessage] = useState('');

    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [role, setRole] = useState('child');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [registerError, setRegisterError] = useState('');

    const [isRegistering, setIsRegistering] = useState(false);

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

    const handleLoginSubmit = async (e) => {
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
            const { redirect } = response.data;
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

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (registerPassword !== repeatPassword) {
            setRegisterError('Mật khẩu nhập lại không khớp');
            return;
        }
        if (!email) {
            setRegisterError('Vui lòng nhập email (email phụ huynh nếu là child)');
            return;
        }
        if ((role === 'parent' || role === 'teacher') && !phoneNumber) {
            setRegisterError('Vui lòng nhập số điện thoại');
            return;
        }

        try {
            const userData = {
                username: registerUsername,
                password: registerPassword, // Sửa thành password
                role,
                email,
                phoneNumber: role === 'child' ? 'none' : phoneNumber // Gán none cho child
            };
            console.log('Sending register payload:', JSON.stringify(userData, null, 2)); // Debug payload
            const response = await axios.post('http://localhost:8080/api/clients', userData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            console.log('Register response:', response.data); // Debug response
            setIsRegistering(false);
            setLogoutMessage('Đăng ký thành công! Vui lòng đăng nhập.');
            setRegisterUsername('');
            setRegisterPassword('');
            setRepeatPassword('');
            setRole('child');
            setEmail('');
            setPhoneNumber('');
            setRegisterError('');
        } catch (err) {
            console.error('Register error:', err.response?.data); // Log chi tiết lỗi
            if (err.response) {
                setRegisterError(err.response.data?.message || `Đăng ký thất bại (Status: ${err.response.status})`);
            } else {
                setRegisterError('Không thể kết nối đến server');
            }
        }
    };

    const handleForgotPassword = () => {
        alert('Tính năng Forgot Password đang được phát triển. Vui lòng liên hệ admin.');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
            <div className="login-container" style={{ maxWidth: '400px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                {isRegistering ? (
                    <>
                        <h2 className="text-center mb-4">Đăng ký</h2>
                        {registerError && <div className="alert alert-danger">{registerError}</div>}
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="mb-3">
                                <label htmlFor="registerUsername" className="form-label">Tên người dùng</label>
                                <input
                                    type="text"
                                    id="registerUsername"
                                    className="form-control"
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="registerPassword" className="form-label">Mật khẩu</label>
                                <input
                                    type="password"
                                    id="registerPassword"
                                    className="form-control"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="repeatPassword" className="form-label">Nhập lại mật khẩu</label>
                                <input
                                    type="password"
                                    id="repeatPassword"
                                    className="form-control"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="role" className="form-label">Vai trò</label>
                                <select
                                    id="role"
                                    className="form-select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                >
                                    <option value="child">Học sinh (nhập email phụ huynh)</option>
                                    <option value="parent">Phụ huynh</option>
                                    <option value="teacher">Giáo viên</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    {role === 'child' ? 'Email phụ huynh' : 'Email'}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            {(role === 'parent' || role === 'teacher') && (
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        className="form-control"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary w-100">Đăng ký</button>
                        </form>
                        <div className="text-center mt-3">
                            <button
                                className="btn btn-link"
                                onClick={() => setIsRegistering(false)}
                            >
                                Đã có tài khoản? Đăng nhập
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-center mb-4">Đăng nhập</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {logoutMessage && <div className="alert alert-success">{logoutMessage}</div>}
                        <form onSubmit={handleLoginSubmit}>
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
                        <div className="text-center mt-3">
                            <button
                                className="btn btn-link"
                                onClick={handleForgotPassword}
                            >
                                Quên mật khẩu?
                            </button>
                            <button
                                className="btn btn-link"
                                onClick={() => setIsRegistering(true)}
                            >
                                Đăng ký
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;