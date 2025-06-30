import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faArrowRightLong,
    faBars,
    faCartShopping,
    faDoorOpen,
    faIdBadge,
    faMapMarkerAlt,
    faSearch,
    faComments,
} from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faFacebookF, faLinkedinIn, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [role, setRole] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation(); // Lấy đường dẫn hiện tại


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const profileResponse = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
                setUser(profileResponse.data);
                setIsLoggedIn(true);

                const roleResponse = await axios.get('http://localhost:8080/api/hocho/role', {withCredentials: true});
                const userRole = roleResponse.data?.role || localStorage.getItem('userRole') || null;
                setRole(userRole);
                localStorage.setItem('userRole', userRole);
                console.log('User role:', userRole);
            } catch (err) {
                setIsLoggedIn(false);
                setRole(null);
                console.error('Error checking login status:', err);
                // Chỉ chuyển hướng nếu không ở trang công khai
                if (err.response?.status === 401 && location.pathname !== '/hocho/home') {
                    navigate('/hocho/login');
                }
            }
        };
        fetchUserData();
    }, [navigate, refreshKey, location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            axios.get('http://localhost:8080/api/messages/sessions', { withCredentials: true })
                .then(res => {
                    const totalUnreadChats = res.data.filter(session => session.unreadCount > 0).length;
                    setUnreadCount(totalUnreadChats);
                })
                .catch(() => setUnreadCount(0));
        }
    }, [isLoggedIn, refreshKey]);

    const handleLogout = () => {
        axios
            .post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true, maxRedirects: 0 })
            .then(() => {
                setIsLoggedIn(false);
                setRole(null);
                setUser({});
                localStorage.removeItem('userRole');
                navigate('/hocho/home');
            })
            .catch((err) => {
                console.error('Error logging out:', err);
                navigate('/hocho/home');
            });
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!isLoggedIn || !user.avatarUrl || user.avatarUrl === 'none') {
            return `${baseUrl}/api/hocho/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuActive(!isMobileMenuActive);
    };

    const handleNavClick = (e, path) => {
        e.preventDefault();
        navigate(path);
    };

    const cartUrl = isLoggedIn && role === 'ROLE_CHILD' ? '/hocho/child/cart' : isLoggedIn && role === 'ROLE_PARENT' ? '/hocho/parent/cart' : '/hocho/login';

    const renderMenu = () => {
        if (!isLoggedIn || !role) return null;

        const menuItems = {
            ROLE_ADMIN: [
                {path: '/hocho/admin/course/approval', name: 'Course Manager'},
                {path: '/hocho/dashboard', name: 'Thanh toán & Giao dịch'},
                {path: '/hocho/admin/accounts', name: 'Manager Account'},
                {path: '/hocho/admin/video/approval', name: 'Approval Video'},
                {path: '/hocho/admin/feedbacks', name: 'Quản lý phản hồi'},
                {path: '/hocho/questions', name: 'Forum'},
                {path: '/hocho/messaging', name: '', icon: faComments},
                {name: 'Approval', dropdown: [
                        {path: '/hocho/admin/course/approval', name: 'Course Manager'},
                        {path: '/hocho/admin/course/approval', name: 'CoursesPage'},
                        {path: '/hocho/admin/course/approval', name: 'CoursesPage'},
                    ],
                },],
            ROLE_TEACHER: [
                {path: '/hocho/teacher/course', name: 'Course Manager'},
                {path: '/hocho/questions', name: 'Forum'},
                {path: '/hocho/teacher/video', name: 'Entertainment'},
                {path: '/hocho/feedback', name: 'My Feedbacks'},
                {path: '/hocho/messaging', name: '', icon: faComments},
            ],
            ROLE_PARENT: [
                {path: '/hocho/parent', name: 'Thông tin Phụ huynh'},
                {path: '/hocho/dashboard', name: 'Thanh toán & Giao dịch'},
                {path: '/hocho/questions', name: 'Forum'},
                {path: '/hocho/parent/time-restriction', name: 'Time'},
                {path: '/hocho/feedback', name: 'My Feedbacks'},
                {path: '/hocho/parent/monitor', name: 'Learning Progress'},
                {path: '/hocho/messaging', name: '', icon: faComments},
            ],
            ROLE_CHILD: [
                {path: '/hocho/questions', name: 'Forum'},
                {path: '/hocho/child/course', name: 'My Learning'},
                {path: '/hocho/child/learning-history', name: 'Learning History'},
                {path: '/hocho/feedback', name: 'My Feedbacks'},
                {path: '/hocho/messaging', name: '', icon: faComments},
            ],
        };

        if (!menuItems[role]) {
            console.warn(`Role không hợp lệ: ${role}`);
            return <ul className={styles.navAdmin}>
                <li>Không có menu cho vai trò này</li>
            </ul>;
        }

        return (
            <div className={styles.navAdminWrapper}>
                <ul className={styles.navAdmin}>
                    {menuItems[role].map((item, index) => (
                        <li className={item.dropdown ? styles.hasDropdown : styles.navItem} key={index}>
                            {item.dropdown ? (
                                <>
                                    <a href="#" className={styles.navLink}>
                                        {item.icon ? (
                                            <span style={{position: 'relative', display: 'inline-block'}}>
                                                <FontAwesomeIcon icon={item.icon} className={styles.navIconOnly} />
                                                {item.path === '/hocho/messaging' && unreadCount > 0 && (
                                                    <span className={styles.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                                                )}
                                            </span>
                                        ) : (
                                            item.name
                                        )}
                                        {' '}
                                        <FontAwesomeIcon icon={faAngleDown} className={styles.mainMenuIcon} />
                                    </a>
                                    <ul className={styles.submenu}>
                                        {item.dropdown.map((subItem, subIndex) => (
                                            <li key={subIndex} className={styles.hasDropdown}>
                                                <a href={subItem.path} className={styles.navLink} onClick={(e) => handleNavClick(e, subItem.path)}>
                                                    {subItem.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <a href={item.path} className={styles.navLink} onClick={(e) => handleNavClick(e, item.path)}>
                                    {item.icon ? (
                                        <span style={{position: 'relative', display: 'inline-block'}}>
                                            <FontAwesomeIcon icon={item.icon} className={styles.navIconOnly} />
                                            {item.path === '/hocho/messaging' && unreadCount > 0 && (
                                                <span className={styles.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                                            )}
                                        </span>
                                    ) : (
                                        item.name
                                    )}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className={styles.bodys}>
            <header id="header-sticky" className={`${styles.header1} ${isScrolled ? styles.scrolled : ''}`}>
                <nav className={styles.headerTop}>
                    <div className={styles.headerTopBanner}>
                        <img
                            src="/headerTopShape.png"
                            alt="Header Top Shape"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div className={styles.headerTopContent}>
                        <div className={styles.headerTopWrapper}>
                            <ul className={styles.contactList}>
                                <li>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.contactListicon} />
                                    FPT University FUDA
                                </li>
                                <li>
                                    <FontAwesomeIcon icon={faEnvelope} className={styles.contactListicon} />
                                    <a className={styles.link} href="mailto:hocho@gmail.com">
                                        hocho@gmail.com
                                    </a>
                                </li>
                            </ul>
                            <div className={styles.socialIcon}>
                                <span>Follow Us On:</span>
                                <a href="/"><FontAwesomeIcon icon={faFacebookF} className={styles.socialIconLink} /></a>
                                <a href="/"><FontAwesomeIcon icon={faTwitter} className={styles.socialIconLink} /></a>
                                <a href="/"><FontAwesomeIcon icon={faLinkedinIn} className={styles.socialIconLink} /></a>
                                <a href="/"><FontAwesomeIcon icon={faYoutube} className={styles.socialIconLink} /></a>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className={styles.containerFluid}>
                    <div className={styles.headerMain}>
                        <div className={styles.headerLeft}>
                            <a href="/hocho/home"><img alt="Logo" width="100" height="100" src="/logo.png" /></a>
                        </div>
                        <div className={styles.headerRight}>
                            <button className={`${styles.sidebarToggle} ${styles.dXlNone}`} onClick={toggleMobileMenu}>
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                            <nav
                                id="mobile-menu"
                                className={`${styles.mainMenu} ${isMobileMenuActive ? styles.active : ''} ${styles.dXlBlock}`}
                            >
                                <ul>
                                    <li className={`${styles.hasDropdown} ${styles.active}`}>
                                        <a href="/hocho/home">Home</a>
                                    </li>
                                    <li><a href="/about">About Us</a></li>
                                    <li className={styles.hasDropdown}>
                                        <a href="#">Courses <FontAwesomeIcon icon={faAngleDown} className={styles.mainMenuIcon} /></a>
                                        <ul className={styles.submenu}>
                                            <li className={styles.hasDropdown}>
                                                <a href="/hocho/course">Subject <FontAwesomeIcon icon={faAngleDown} className={styles.mainMenuIcon} /></a>
                                                <ul className={styles.submenu}>
                                                    <li><a href="/hocho/teacher/course">Course</a></li>
                                                    <li><a href="/event-carousel">Event Carousel</a></li>
                                                    <li><a href="/event-details">Event Details</a></li>
                                                </ul>
                                            </li>
                                            <li className={styles.hasDropdown}>
                                                <a href="/team-details">Teacher <FontAwesomeIcon icon={faAngleDown} className={styles.mainMenuIcon} /></a>
                                                <ul className={styles.submenu}>
                                                    <li><a href="/team">Our Teacher</a></li>
                                                    <li><a href="/team-carousel">Teacher Carousel</a></li>
                                                    <li><a href="/team-details">Teacher Details</a></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className={styles.hasDropdown}>
                                        <a href="/news">Entertainment <FontAwesomeIcon icon={faAngleDown} className={styles.mainMenuIcon} /></a>
                                        <ul className={styles.submenu}>
                                            <li><a href="/hocho/video">Video</a></li>
                                            <li><a href="/hocho/games">Games</a></li>
                                        </ul>
                                    </li>
                                    <li><a href="/hocho/contact">Contact Us</a></li>
                                    {renderMenu()}
                                </ul>
                            </nav>
                            <button className={`${styles.searchTrigger} ${styles.searchIcon}`}>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                            <Link to={cartUrl} className={`${styles.searchTrigger} ${styles.searchIcon}`} aria-label="Cart">
                                <FontAwesomeIcon icon={faCartShopping} />
                            </Link>
                            {!isLoggedIn ? (
                                <div className={styles.headerButton}>
                                    <a className={styles.themeBtn} href="/hocho/login">
                                        <span>Login <FontAwesomeIcon icon={faArrowRightLong} /></span>
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
                                            <li><a href="/hocho/profile"><FontAwesomeIcon icon={faIdBadge} /> Profile</a></li>
                                            <li><a className={styles.logoutLink} onClick={handleLogout}><FontAwesomeIcon icon={faDoorOpen} /> Logout</a></li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Header;