import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
    .welcome-container {
        max-width: 640px;
        margin: 0 auto;
        padding: 16px;
    }
    .welcome-heading {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
    }
    .welcome-card {
        background-color: #f3f4f6;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .welcome-item {
        margin-bottom: 8px;
    }
    .welcome-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin-top: 8px;
    }
    .welcome-button {
        margin-top: 16px;
        padding: 8px;
        background-color: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }
    .welcome-button:hover {
        background-color: #dc2626;
    }
    .text-error {
        color: #dc2626;
        text-align: center;
        margin-top: 16px;
    }
    .text-center {
        text-align: center;
        margin-top: 16px;
    }
`;

const Welcome = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Hàm định dạng ngày giờ theo chuẩn Việt Nam
    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'Chưa cập nhật';
        const date = new Date(dateTime);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    // Hàm định dạng ngày sinh (dd/MM/yyyy)
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Chưa cập nhật';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/auth/user', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser({
                        ...data,
                        createdAt: formatDateTime(data.createdAt),
                        updatedAt: formatDateTime(data.updatedAt),
                        dateOfBirth: formatDate(data.dateOfBirth),
                    });
                } else if (response.status === 401) {
                    setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    setTimeout(() => navigate('/hocho/login'), 2000);
                } else {
                    throw new Error('Lỗi server');
                }
            } catch (err) {
                setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
                setTimeout(() => navigate('/hocho/login'), 2000);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        console.log('Logout button clicked, sending POST /api/auth/logout');
        try {
            const response = await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Logout response:', response.status, response.statusText);
            if (response.ok) {
                console.log('Logout successful, redirecting to /hocho/login');
                navigate('/hocho/login');
            } else {
                console.error('Logout failed with status:', response.status, await response.text());
                navigate('/hocho/login');
            }
        } catch (err) {
            console.error('Logout error:', err.message);
            navigate('/hocho/login');
        }
    };

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    if (!user) {
        return <div className="text-center mt-4">Đang tải...</div>;
    }

    return (
        <>
            <style>{styles}</style>
            <div className="welcome-container">
                <h2 className="welcome-heading">Chào mừng, {user.username}!</h2>
                <div className="welcome-card">
                    <div className="welcome-item">
                        <strong>Tên đăng nhập:</strong> {user.username}
                    </div>
                    <div className="welcome-item">
                        <strong>Email:</strong> {user.email}
                    </div>
                    <div className="welcome-item">
                        <strong>Họ và tên:</strong> {user.fullName || 'Chưa cập nhật'}
                    </div>
                    <div className="welcome-item">
                        <strong>Ngày sinh:</strong> {user.dateOfBirth}
                    </div>
                    <div className="welcome-item">
                        <strong>Số điện thoại:</strong> {user.phoneNumber || 'Chưa cập nhật'}
                    </div>
                    <div className="welcome-item">
                        <strong>Vai trò:</strong> {user.role}
                    </div>
                    <div className="welcome-item">
                        <strong>Ảnh đại diện:</strong>
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="welcome-avatar" />
                        ) : (
                            ' Chưa có'
                        )}
                    </div>
                    <div className="welcome-item">
                        <strong>Trạng thái:</strong> {user.isActive ? 'Kích hoạt' : 'Chưa kích hoạt'}
                    </div>
                    <div className="welcome-item">
                        <strong>Xác minh:</strong> {user.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </div>
                    <div className="welcome-item">
                        <strong>Ngày tạo:</strong> {user.createdAt}
                    </div>
                    <div className="welcome-item">
                        <strong>Ngày cập nhật:</strong> {user.updatedAt}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="welcome-button"
                >
                    Đăng xuất
                </button>
            </div>
        </>
    );
};

export default Welcome;