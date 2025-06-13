import React, { useState } from 'react';
import axios from 'axios';


const styles = `
    .register-container {
        max-width: 384px;
        margin: 0 auto;
        padding: 16px;
    }
    .register-heading {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
    }
    .register-alert {
        padding: 8px;
        margin-bottom: 16px;
        border-radius: 4px;
    }
    .登録-alert-success {
        background-color: #dcfce7;
        color: #15803d;
    }
    .register-alert-error {
        background-color: #fee2e2;
        color: #dc2626;
    }
    .register-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .register-form-group {
        margin-bottom: 16px;
    }
    .register-label {
        display: block;
        margin-bottom: 4px;
    }
    .register-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 16px;
    }
    .register-select {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 16px;
    }
    .register-button {
        width: 100%;
        padding: 8px;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }
    .register-button:hover {
        background-color: #2563eb;
    }
`;

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        retypePassword: '',
        email: '',
        parentEmail: '',
        role: 'child',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', formData);
            setMessage(response.data);
            if (formData.role === 'parent') {
                setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            }
        } catch (error) {
            setMessage(error.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="register-container">
                <h2 className="register-heading">Đăng ký</h2>
                {message && (
                    <div className={`register-alert ${message.includes('thành công') ? 'register-alert-success' : 'register-alert-error'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-form-group">
                        <label className="register-label">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="register-input"
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label className="register-label">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="register-input"
                            required
                        />
                    </div>
                    <div className="register-form-group">
                        <label className="register-label">Nhập lại mật khẩu</label>
                        <input
                            type="password"
                            name="retypePassword"
                            value={formData.retypePassword}
                            onChange={handleChange}
                            className="register-input"
                            required
                        />
                    </div>
                    {formData.role !== 'child' && (
                        <div className="register-form-group">
                            <label className="register-label">Email cá nhân</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="register-input"
                                required
                            />
                        </div>
                    )}
                    {formData.role === 'child' && (
                        <div className="register-form-group">
                            <label className="register-label">Email phụ huynh</label>
                            <input
                                type="email"
                                name="parentEmail"
                                value={formData.parentEmail}
                                onChange={handleChange}
                                className="register-input"
                                required
                            />
                        </div>
                    )}
                    <div className="register-form-group">
                        <label className="register-label">Vai trò</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="register-select">
                            <option value="child">Học sinh</option>
                            <option value="parent">Phụ huynh</option>
                            <option value="teacher">Giáo viên</option>
                        </select>
                    </div>
                    <button type="submit" className="register-button">
                        Đăng ký
                    </button>
                </form>
            </div>
        </>
    );
};

export default Register;