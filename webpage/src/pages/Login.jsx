import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const styles = `
    .login-container {
        max-width: 384px;
        margin: 0 auto;
        padding: 16px;
    }
    .login-heading {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
    }
    .login-error {
        color: #dc2626;
        margin-bottom: 16px;
    }
    .login-form-group {
        margin-bottom: 16px;
    }
    .login-label {
        display: block;
        margin-bottom: 4px;
    }
    .login-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 16px;
    }
    .login-button {
        width: 100%;
        padding: 8px;
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 16px;
        cursor: pointer;
    }
    .login-button-blue {
        background-color: #3b82f6;
        margin-bottom: 16px;
    }
    .login-button-blue:hover {
        background-color: #2563eb;
    }
    .login-button-red {
        background-color: #ef4444;
    }
    .login-button-red:hover {
        background-color: #dc2626;
    }
    .mt-4 {
        margin-top: 16px;
    }
`;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Xử lý query params
        const searchParams = new URLSearchParams(location.search);
        const oauthError = searchParams.get('oauthError');
        const loginError = searchParams.get('error');
        if (oauthError) {
            setError(decodeURIComponent(oauthError));
        } else if (loginError) {
            setError(decodeURIComponent(loginError));
        }

        // Kiểm tra trạng thái đăng nhập
        fetch('http://localhost:8080/api/auth/user', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (response.ok) {
                    navigate('/hocho/welcome');
                }
            })
            .catch(err => console.error('Error checking auth status:', err));
    }, [navigate, location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // Đăng nhập thành công, kiểm tra session
                const userResponse = await fetch('http://localhost:8080/api/auth/user', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                if (userResponse.ok) {
                    navigate('/hocho/welcome');
                }
            } else {
                const errorData = await response.text();
                setError(errorData);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <>
            <style>{styles}</style>
            <div className="login-container">
                <h2 className="login-heading">Đăng nhập</h2>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label className="login-label">Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>
                    <div className="login-form-group">
                        <label className="login-label">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="login-button login-button-blue"
                    >
                        Đăng nhập
                    </button>
                </form>
                <button
                    onClick={handleGoogleLogin}
                    className="login-button login-button-red"
                >
                    Đăng nhập bằng Google
                </button>
            </div>
        </>
    );
};

export default Login;