// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [role, setRole] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // Thêm refreshKey
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập và lấy vai trò
        const fetchUserData = async () => {
            try {
                const profileResponse = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
                setUser(profileResponse.data);
                setIsLoggedIn(true);

                // Lấy vai trò từ API
                const roleResponse = await axios.get('http://localhost:8080/api/hocho/role', { withCredentials: true });
                setRole(roleResponse.data.role);
            } catch (err) {
                setIsLoggedIn(false);
                console.error('Error checking login status:', err);
                if (err.response && err.response.status === 401) {
                    navigate('/hocho/login');
                }
            }
        };
        fetchUserData();
    }, [navigate, refreshKey]); // Thêm refreshKey vào dependency

    const handleLogout = () => {
        axios.post('http://localhost:8080/logout', {}, { withCredentials: true, maxRedirects: 0 })
            .then(() => {
                setIsLoggedIn(false);
                setRole(null);
                setUser({});
                navigate('/hocho/login?logout');
            })
            .catch(err => {
                console.error('Error logging out:', err);
                navigate('/hocho/login?logout');
            });
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!isLoggedIn || !user.avatarUrl || user.avatarUrl === 'none') {
            return `${baseUrl}/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
    };

    // Hàm để force refresh dữ liệu (gọi từ profile.js nếu cần)
    const refreshProfile = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    // Render menu dựa trên vai trò
    const renderMenu = () => {
        if (!role || !isLoggedIn) return null;

        const menuItems = {
            'ROLE_admin': [
                { path: '/hocho/clients', name: 'Quản lý tài khoản' },
                { path: '/hocho/teacher', name: 'Quản lý khóa học' },
                { path: '/hocho/dashboard', name: 'Thanh toán & Giao dịch' },
                { path: '/hocho/video', name: 'Quản lý video' },
            ],
            'ROLE_teacher': [
                { path: '/hocho/teacher', name: 'Quản lý khóa học' },
                { path: '/hocho/dashboard', name: 'Giai tri & Nội dung' },
            ],
            'ROLE_parent': [
                { path: '/hocho/parent', name: 'Thông tin Phụ huynh' },
                { path: '/hocho/dashboard', name: 'Thanh toán & Giao dịch' },
            ],
            'ROLE_child': [
                { path: '/hocho/childList', name: 'Giai tri & Nội dung' },
            ],
        };

        return (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {menuItems[role].map((item, index) => (
                    <li className="nav-item" key={index}>
                        <Link className="nav-link" to={item.path}>
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/hocho/home">Hocho</Link>
                <div className="collapse navbar-collapse">
                    {isLoggedIn && renderMenu()}
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {!isLoggedIn ? (
                            <li className="nav-item">
                                <Link className="nav-link btn btn-outline-primary" to="/hocho/login">Login</Link>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item" style={{ marginRight: '10px' }}>
                                    <img
                                        src={getAvatarUrl()}
                                        alt="User Avatar"
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }}
                                        onClick={() => navigate('/hocho/profile')}
                                        onError={(e) => { e.target.src = `http://localhost:8080/profile/default.png?t=${new Date().getTime()}`; }}
                                    />
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-outline-danger" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Header;