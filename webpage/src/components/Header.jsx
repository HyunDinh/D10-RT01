import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập và lấy thông tin người dùng
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/auth/user', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setRole(userData.role); // Lấy role từ response
                    setIsLoggedIn(true);
                    localStorage.setItem('userRole', userData.role); // Lưu role vào localStorage
                } else {
                    setIsLoggedIn(false);
                    setRole(null);
                    setUser({});
                    localStorage.removeItem('userRole'); // Xóa role nếu không đăng nhập
                }
            } catch (err) {
                console.error('Lỗi kiểm tra trạng thái đăng nhập:', err);
                setIsLoggedIn(false);
                setRole(null);
                setUser({});
                localStorage.removeItem('userRole');
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const message = await response.text();
                console.log(message); // "Đăng xuất thành công."
                // Có thể hiển thị thông báo cho người dùng, ví dụ: setLogoutMessage(message)
            } else {
                console.error('Đăng xuất thất bại:', response.status);
                // Có thể hiển thị thông báo lỗi
            }
            setIsLoggedIn(false);
            setRole(null);
            setUser({});
            localStorage.removeItem('userRole');
            navigate('/hocho/home');
        } catch (err) {
            console.error('Lỗi đăng xuất:', err);
            setIsLoggedIn(false);
            setRole(null);
            setUser({});
            localStorage.removeItem('userRole');
            navigate('/hocho/home');
        }
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!isLoggedIn || !user.avatarUrl || user.avatarUrl === 'none') {
            return `${baseUrl}/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
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
                { path: '/hocho/dashboard', name: 'Giải trí & Nội dung' },
                { path: '/hocho/questions', name: 'Forum' },
            ],
            'ROLE_parent': [
                { path: '/hocho/parent', name: 'Thông tin Phụ huynh' },
                { path: '/hocho/dashboard', name: 'Thanh toán & Giao dịch' },
                { path: '/hocho/questions', name: 'Forum' },
            ],
            'ROLE_child': [
                { path: '/hocho/questions', name: 'Forum' },
            ],
        };

        return (
            <ul className="navAdmin">
                {menuItems[role]?.map((item, index) => (
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
        <>
            <nav className="navbar">
                <div className="headerTop">
                    <div className="headerTopBanner">
                        <img
                            src="/headerTopShape.png"
                            alt="logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                    <div className="headerTopContent">
                        <div className="header-top-wrapper">
                            <ul className="contact-list">
                                <li>
                                    <i className="fas fa-map-marker-alt"></i>
                                    FPT University FUDA
                                </li>
                                <li>
                                    <i className="far fa-envelope"></i>
                                    <a className="link" href="mailto:info@example.com">hocho@gmail.com</a>
                                </li>
                            </ul>
                            <div className="social-icon">
                                <span>Follow Us On:</span>
                                <a href="/">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="/">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="/">
                                    <i className="fa-brands fa-linkedin-in"></i>
                                </a>
                                <a href="/">
                                    <i className="fa-brands fa-youtube"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <header id="header-sticky" className="header-1">
                <div className="container-fluid">
                    <div className="mega-menu-wrapper">
                        <div className="header-main">
                            <div className="header-left">
                                <a href="/hocho/home">
                                    <img alt="logo" width="100" height="100" src="/logo.png" />
                                </a>
                            </div>
                            <div className="header-right">
                                <nav id="mobile-menu" className="main-menu">
                                    <ul style={{ margin: 0 }}>
                                        <li className="has-dropdown active menu-thumb">
                                            <a href="/hocho/home">Home</a>
                                        </li>
                                        <li><a href="about">About Us</a></li>
                                        <li className="has-dropdown">
                                            <a href="news">
                                                Courses <i className="fas fa-angle-down"></i>
                                            </a>
                                            <ul className="submenu">
                                                <li className="has-dropdown">
                                                    <a href="event-details">
                                                        Subject <i className="fas fa-angle-down"></i>
                                                    </a>
                                                    <ul className="submenu">
                                                        <li><a href="event">Event Grid</a></li>
                                                        <li><a href="event-carousel">Event Carousel</a></li>
                                                        <li><a href="event-details">Event Details</a></li>
                                                    </ul>
                                                </li>
                                                <li className="has-dropdown">
                                                    <a href="team-details">
                                                        Teacher <i className="fas fa-angle-down"></i>
                                                    </a>
                                                    <ul className="submenu">
                                                        <li><a href="team">Our Teacher</a></li>
                                                        <li><a href="team-carousel">Teacher Carousel</a></li>
                                                        <li><a href="team-details">Teacher Details</a></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                        <li className="has-dropdown">
                                            <a href="news">
                                                Entertainment <i className="fas fa-angle-down"></i>
                                            </a>
                                            <ul className="submenu">
                                                <li><a href="/hocho/video">Video</a></li>
                                                <li><a href="#">Games</a></li>
                                            </ul>
                                        </li>
                                        <li><a href="contact">Contact Us</a></li>
                                        {renderMenu()}
                                    </ul>
                                </nav>
                                <button className="search-trigger search-icon">
                                    <i className="fas fa-search"></i>
                                </button>
                                {!isLoggedIn ? (
                                    <div className="header-button">
                                        <a className="theme-btn" href="/hocho/login">
                                            <span>
                                                Login <i className="fa-solid fa-arrow-right-long"></i>
                                            </span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="user-profile">
                                        <div className="avatar-container">
                                            <img
                                                src={getAvatarUrl()}
                                                alt="User Avatar"
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    cursor: 'pointer',
                                                    objectFit: 'cover',
                                                    border: '3px solid #fff',
                                                }}
                                                onError={(e) => {
                                                    e.target.src = `http://localhost:8080/profile/default.png?t=${new Date().getTime()}`;
                                                }}
                                            />
                                            <ul className="profile-dropdown">
                                                <li><a href="/hocho/profile">Profile</a></li>
                                                <li><a href="#">Cart</a></li>
                                                <li>
                                                    <a className="logout-link" onClick={handleLogout}>
                                                        Logout
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;