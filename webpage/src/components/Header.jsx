import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Header.module.css';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [role, setRole] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const profileResponse = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
                setUser(profileResponse.data);
                setIsLoggedIn(true);

                const roleResponse = await axios.get('http://localhost:8080/api/hocho/role', {withCredentials: true});
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
    }, [navigate, refreshKey]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        axios.post('http://localhost:8080/logout', {}, {withCredentials: true, maxRedirects: 0})
            .then(() => {
                setIsLoggedIn(false);
                setRole(null);
                setUser({});
                navigate('/hocho/home');
            })
            .catch(err => {
                console.error('Error logging out:', err);
                navigate('/hocho/home');
            });
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!isLoggedIn || !user.avatarUrl || user.avatarUrl === 'none') {
            return `${baseUrl}/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
    };

    const refreshProfile = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuActive(!isMobileMenuActive);
    };

    const renderMenu = () => {
        if (!role || !isLoggedIn) return null;

        const menuItems = {
            'ROLE_admin': [
                {path: '/hocho/clients', name: 'Quản lý tài khoản'},
                {path: '/hocho/teacher', name: 'Quản lý khóa học'},
                {path: '/hocho/dashboard', name: 'Thanh toán & Giao dịch'},
                {path: '/hocho/video', name: 'Quản lý video'},
                {path: '/hocho/questions', name: 'Forum'},
            ],
            'ROLE_teacher': [
                {path: '/hocho/teacher', name: 'Quản lý khóa học'},
                {path: '/hocho/dashboard', name: 'Giải trí & Nội dung'},
                {path: '/hocho/questions', name: 'Forum'},
            ],
            'ROLE_parent': [
                {path: '/hocho/parent', name: 'Thông tin Phụ huynh'},
                {path: '/hocho/dashboard', name: 'Thanh toán & Giao dịch'},
                {path: '/hocho/questions', name: 'Forum'},
            ],
            'ROLE_child': [
                {path: '/hocho/questions', name: 'Forum'},
            ],
        };

        return (
            <ul className={styles.navAdmin}>
                {menuItems[role].map((item, index) => (
                    <li className={styles.navItem} key={index}>
                        <Link className={styles.navLink} to={item.path}>
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.headerTop}>
                    <div className={styles.headerTopBanner}>
                        <img
                            src="/headerTopShape.png"
                            alt="Header Top Shape"
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                    </div>
                    <div className={styles.headerTopContent}>
                        <div className={styles.headerTopWrapper}>
                            <ul className={styles.contactList}>
                                <li>
                                    <i className="fas fa-map-marker-alt"></i>
                                    FPT University FUDA
                                </li>
                                <li>
                                    <i className="far fa-envelope"></i>
                                    <a className={styles.link} href="mailto:hocho@gmail.com">
                                        hocho@gmail.com
                                    </a>
                                </li>
                            </ul>
                            <div className={styles.socialIcon}>
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

            <header id="header-sticky" className={`${styles.header1} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.containerFluid}>
                    <div className={styles.megaMenuWrapper}>
                        <div className={styles.headerMain}>
                            <div className={styles.headerLeft}>
                                <a href="/hocho/home">
                                    <img alt="Logo" width="100" height="100" src="/logo.png"/>
                                </a>
                            </div>
                            <div className={styles.headerRight}>
                                <button
                                    className={`${styles.sidebarToggle} ${styles.dXlNone}`}
                                    onClick={toggleMobileMenu}
                                >
                                    <i className="fas fa-bars"></i>
                                </button>
                                <nav
                                    id="mobile-menu"
                                    className={`${styles.mainMenu} ${isMobileMenuActive ? styles.active : ''} ${styles.dXlBlock}`}
                                >
                                    <ul>
                                        <li className={`${styles.hasDropdown} ${styles.active} ${styles.menuThumb}`}>
                                            <a href="/hocho/home">Home</a>
                                        </li>
                                        <li>
                                            <a href="/about">About Us</a>
                                        </li>
                                        <li className={styles.hasDropdown}>
                                            <a href="/news">
                                                Courses <i className="fas fa-angle-down"></i>
                                            </a>
                                            <ul className={styles.submenu}>
                                                <li className={styles.hasDropdown}>
                                                    <a href="/event-details">
                                                        Subject <i className="fas fa-angle-down"></i>
                                                    </a>
                                                    <ul className={styles.submenu}>
                                                        <li>
                                                            <a href="/event">Event Grid</a>
                                                        </li>
                                                        <li>
                                                            <a href="/event-carousel">Event Carousel</a>
                                                        </li>
                                                        <li>
                                                            <a href="/event-details">Event Details</a>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li className={styles.hasDropdown}>
                                                    <a href="/team-details">
                                                        Teacher <i className="fas fa-angle-down"></i>
                                                    </a>
                                                    <ul className={styles.submenu}>
                                                        <li>
                                                            <a href="/team">Our Teacher</a>
                                                        </li>
                                                        <li>
                                                            <a href="/team-carousel">Teacher Carousel</a>
                                                        </li>
                                                        <li>
                                                            <a href="/team-details">Teacher Details</a>
                                                        </li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                        <li className={styles.hasDropdown}>
                                            <a href="/news">
                                                Entertainment <i className="fas fa-angle-down"></i>
                                            </a>
                                            <ul className={styles.submenu}>
                                                <li>
                                                    <a href="/hocho/video">Video</a>
                                                </li>
                                                <li>
                                                    <a href="#">Games</a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <a href="/contact">Contact Us</a>
                                        </li>
                                        {renderMenu()}
                                    </ul>
                                </nav>

                                <button className={`${styles.searchTrigger} ${styles.searchIcon}`}>
                                    <i className="fas fa-search"></i>
                                </button>

                                {!isLoggedIn ? (
                                    <div className={styles.headerButton}>
                                        <a className={styles.themeBtn} href="/hocho/login">
                                            <span>
                                                Login <i className="fa-solid fa-arrow-right-long"></i>
                                            </span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className={styles.userProfile}>
                                        <div className={styles.avatarContainer}>
                                            <img
                                                src={getAvatarUrl()}
                                                alt="User Avatar"
                                                className={styles.userAvatar}
                                                onError={(e) => {
                                                    e.target.src = `http://localhost:8080/profile/default.png?t=${new Date().getTime()}`;
                                                }}
                                            />
                                            <ul className={styles.profileDropdown}>
                                                <li>
                                                    <a href="/hocho/profile">Profile</a>
                                                </li>
                                                <li>
                                                    <a href="#">Cart</a>
                                                </li>
                                                <li>
                                                    <a className={styles.logoutLink} onClick={handleLogout}>
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