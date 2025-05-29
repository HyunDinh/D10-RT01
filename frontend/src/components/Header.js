import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [refreshKey, setRefreshKey] = useState(0); // Thêm refreshKey
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập bằng cách gọi API profile
        axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true })
            .then(response => {
                setUser(response.data);
                setIsLoggedIn(true);
                console.log('Fetched user data in header:', response.data);
            })
            .catch(err => {
                setIsLoggedIn(false);
                console.error('Error checking login status:', err);
                if (err.response && err.response.status === 401) {
                    navigate('/hocho/login');
                }
            });
    }, [navigate, refreshKey]); // Thêm refreshKey vào dependency

    const handleLogout = () => {
        axios.post('http://localhost:8080/logout', {}, { withCredentials: true, maxRedirects: 0 })
            .then(() => {
                setIsLoggedIn(false);
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

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/hocho/home">Hocho</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/hocho/home">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/hocho/dashboard">Dashboard</Link>
                        </li>
                    </ul>
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