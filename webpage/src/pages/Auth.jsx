import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const styles = `
    .auth-container {
        max-width: 384px;
        margin: 0 auto;
        padding: 16px;
    }
    .auth-heading {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
        text-align: center;
    }
    .auth-alert {
        padding: 8px;
        margin-bottom: 16px;
        border-radius: 4px;
    }
    .auth-alert-success {
        background-color: #dcfce7;
        color: #15803d;
    }
    .auth-alert-error {
        background-color: #fee2e2;
        color: #dc2626;
    }
    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .auth-form-group {
        margin-bottom: 16px;
    }
    .auth-label {
        display: block;
        margin-bottom: 4px;
    }
    .auth-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 16px;
    }
    .auth-select {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 16px;
    }
    .auth-button {
        width: 100%;
        padding: 8px;
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 16px;
        cursor: pointer;
    }
    .auth-button-blue {
        background-color: #3b82f6;
        margin-bottom: 16px;
    }
    .auth-button-blue:hover {
        background-color: #2563eb;
    }
    .auth-button-red {
        background-color: #ef4444;
    }
    .auth-button-red:hover {
        background-color: #dc2626;
    }
    .auth-toggle {
        text-align: center;
        margin-top: 16px;
    }
    .auth-toggle-link {
        color: #3b82f6;
        cursor: pointer;
        text-decoration: underline;
    }
    .auth-toggle-link:hover {
        color: #2563eb;
    }
`;

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({
        username: '',
        password: '',
        retypePassword: '',
        email: '',
        parentEmail: '',
        role: 'child',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Handle query params
        const searchParams = new URLSearchParams(location.search);
        const oauthError = searchParams.get('oauthError');
        const loginError = searchParams.get('error');
        if (oauthError) {
            setMessage(decodeURIComponent(oauthError));
        } else if (loginError) {
            setMessage(decodeURIComponent(loginError));
        }

        // Check authentication status
        fetch('http://localhost:8080/api/auth/user', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.ok) {
                    navigate('/hocho/welcome');
                }
            })
            .catch(err => console.error('Error checking auth status:', err));
    }, [navigate, location.search]);

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const userResponse = await fetch('http://localhost:8080/api/auth/user', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (userResponse.ok) {
                    navigate('/hocho/welcome');
                }
            } else {
                const errorData = await response.text();
                setMessage(errorData);
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', registerData);
            setMessage(response.data);
            if (registerData.role === 'parent') {
                setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            }
        } catch (error) {
            setMessage(error.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setMessage('');
    };

    return (
        <>
            <style>{styles}</style>
            <div className="auth-container">
                <h2 className="auth-heading">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
                {message && (
                    <div className={`auth-alert ${message.includes('thành công') ? 'auth-alert-success' : 'auth-alert-error'}`}>
                        {message}
                    </div>
                )}
                {isLogin ? (
                    <form onSubmit={handleLoginSubmit} className="auth-form">
                        <div className="auth-form-group">
                            <label className="auth-label">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={loginData.username}
                                onChange={handleLoginChange}
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                className="auth-input"
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button auth-button-blue">
                            Đăng nhập
                        </button>
                        <button onClick={handleGoogleLogin} className="auth-button auth-button-red">
                            Đăng nhập bằng Google
                        </button>
                        <div className="auth-toggle">
                            <span>Chưa có tài khoản? </span>
                            <span className="auth-toggle-link" onClick={toggleAuthMode}>
                                Tạo tài khoản
                            </span>
                        </div>
                    </form>
                ) : (


                    <form onSubmit={handleRegisterSubmit} className="auth-form">
                        <div className="auth-form-group">
                            <label className="auth-label">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={registerData.username}
                                onChange={handleRegisterChange}
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                className="auth-input"
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                name="retypePassword"
                                value={registerData.retypePassword}
                                onChange={handleRegisterChange}
                                className="auth-input"
                                required
                            />
                        </div>
                        {registerData.role !== 'child' && (
                            <div className="auth-form-group">
                                <label className="auth-label">Email cá nhân</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    className="auth-input"
                                    required
                                />
                            </div>
                        )}
                        {registerData.role === 'child' && (
                            <div className="auth-form-group">
                                <label className="auth-label">Email phụ huynh</label>
                                <input
                                    type="email"
                                    name="parentEmail"
                                    value={registerData.parentEmail}
                                    onChange={handleRegisterChange}
                                    className="auth-input"
                                    required
                                />
                            </div>
                        )}
                        <div className="auth-form-group">
                            <label className="auth-label">Vai trò</label>
                            <select
                                name="role"
                                value={registerData.role}
                                onChange={handleRegisterChange}
                                className="auth-select"
                            >
                                <option value="child">Học sinh</option>
                                <option value="parent">Phụ huynh</option>
                                <option value="teacher">Giáo viên</option>
                            </select>
                        </div>
                        <button type="submit" className="auth-button auth-button-blue">
                            Đăng ký
                        </button>
                        <div className="auth-toggle">
                            <span>Đã có tài khoản? </span>
                            <span className="auth-toggle-link" onClick={toggleAuthMode}>
                                Đăng nhập
                            </span>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};

export default Auth;