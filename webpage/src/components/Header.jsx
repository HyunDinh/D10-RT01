import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Header.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faArrowRightLong,
    faBars,
    faBell,
    faCartShopping,
    faComment,
    faComments,
    faDoorOpen,
    faIdBadge,
    faMapMarkerAlt,
    faSearch,
    faUniversalAccess
} from '@fortawesome/free-solid-svg-icons';
import {faEnvelope} from '@fortawesome/free-regular-svg-icons';
import {faFacebookF, faLinkedinIn, faTwitter, faYoutube} from '@fortawesome/free-brands-svg-icons';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [role, setRole] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [profileResponse, roleResponse] = await Promise.all([axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true}), axios.get('http://localhost:8080/api/hocho/role', {withCredentials: true}),]);
                setUser(profileResponse.data);
                setIsLoggedIn(true);
                const userRole = roleResponse.data?.role || localStorage.getItem('userRole') || null;
                setRole(userRole);
                localStorage.setItem('userRole', userRole);
            } catch (err) {
                setIsLoggedIn(false);
                setRole(null);
                localStorage.removeItem('userRole');
                if (err.response?.status === 401 && location.pathname !== '/hocho/home') {
                    navigate('/hocho/login');
                }
            }
        };

        fetchUserData();
    }, [navigate, location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !user.id) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/messages/sessions', {withCredentials: true});
                const totalUnreadChats = res.data.filter((session) => session.unreadCount > 0).length;
                setUnreadCount(totalUnreadChats);
            } catch {
                setUnreadCount(0);
            }
        };

        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/notifications/user/${user.id}?status=unread`, {
                    withCredentials: true,
                });
                setUnreadNotifications(res.data.length);
            } catch {
                setUnreadNotifications(0);
            }
        };

        fetchMessages();
        fetchNotifications();
        const interval = setInterval(() => {
            fetchMessages();
            fetchNotifications();
        }, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [isLoggedIn, user.id]);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/auth/logout', {}, {withCredentials: true});
            setIsLoggedIn(false);
            setRole(null);
            setUser({});
            localStorage.removeItem('userRole');
            navigate('/hocho/home');
        } catch {
            setError('Không thể đăng xuất');
            navigate('/hocho/home');
        }
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!isLoggedIn || !user.avatarUrl || user.avatarUrl === 'none') {
            return `${baseUrl}/api/hocho/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuActive((prev) => !prev);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuActive(false);
    };

    const cartUrl = isLoggedIn && role === 'ROLE_CHILD' ? '/hocho/child/cart' : isLoggedIn && role === 'ROLE_PARENT' ? '/hocho/parent/cart' : '/hocho/login';

    const renderMenu = () => {
        if (!isLoggedIn || !role) return null;

        const menuItems = {
            ROLE_ADMIN: [{path: '/hocho/questions', name: 'Forum'}],
            ROLE_TEACHER: [{path: '/hocho/teacher/course', name: 'Course Manager'}, {
                path: '/hocho/questions', name: 'Forum'
            }, {path: '/hocho/teacher/video', name: 'Entertainment'},],
            ROLE_PARENT: [{path: '/hocho/questions', name: 'Forum'}, {
                path: '/hocho/parent/monitor', name: 'Learning Progress'
            },],
            ROLE_CHILD: [{path: '/hocho/questions', name: 'Forum'}, {
                path: '/hocho/child/course', name: 'My Learning'
            },],
        };

        return (<div className={styles.navAdminWrapper}>
            <ul className={styles.navAdmin}>
                {menuItems[role]?.map((item, index) => (<li className={styles.navItem} key={index}>
                    <a
                        href={item.path}
                        className={styles.link}
                        onClick={closeMobileMenu}
                    >
                        {item.name}
                    </a>
                </li>))}
            </ul>
        </div>);
    };

    return (<div className={styles.bodys}>
        {error && (<div className={styles.errorAlert}>
            {error}
        </div>)}
        <header id="header-sticky" className={`${styles.header1} ${isScrolled ? styles.scrolled : ''}`}>
            <nav className={styles.headerTop}>
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
                                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.contactListicon}/>
                                FPT University FUDA
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faEnvelope} className={styles.contactListicon}/>
                                <a className={styles.link} href="mailto:hocho@gmail.com"
                                   aria-label="Email hocho@gmail.com">
                                    hocho@gmail.com
                                </a>
                            </li>
                        </ul>
                        <div className={styles.socialIcon}>
                            <span>Follow Us On:</span>
                            <a href="https://facebook.com" aria-label="Follow on Facebook">
                                <FontAwesomeIcon icon={faFacebookF} className={styles.socialIconLink}/>
                            </a>
                            <a href="https://twitter.com" aria-label="Follow on Twitter">
                                <FontAwesomeIcon icon={faTwitter} className={styles.socialIconLink}/>
                            </a>
                            <a href="https://linkedin.com" aria-label="Follow on LinkedIn">
                                <FontAwesomeIcon icon={faLinkedinIn} className={styles.socialIconLink}/>
                            </a>
                            <a href="https://youtube.com" aria-label="Follow on YouTube">
                                <FontAwesomeIcon icon={faYoutube} className={styles.socialIconLink}/>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={styles.containerFluid}>
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
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuActive}
                        >
                            <FontAwesomeIcon icon={faBars}/>
                        </button>
                        <nav
                            id="mobile-menu"
                            className={`${styles.mainMenu} ${isMobileMenuActive ? styles.active : ''} ${styles.dXlBlock}`}
                        >
                            <ul>
                                <li className={`${styles.hasDropdown} ${location.pathname === '/hocho/home' ? styles.active : ''}`}>
                                    <a href="/hocho/home" onClick={closeMobileMenu}>
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="/about" onClick={closeMobileMenu}>
                                        About Us
                                    </a>
                                </li>
                                <li className={styles.hasDropdown}>
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                    }}>
                                        Courses <FontAwesomeIcon icon={faAngleDown}
                                                                 className={styles.mainMenuIcon}/>
                                    </a>
                                    <ul className={styles.submenu}>
                                        <li className={styles.hasDropdown}>
                                            <a href="/hocho/course"
                                                // onClick={(e) => {e.preventDefault();}}
                                            >
                                                Subject <FontAwesomeIcon icon={faAngleDown}
                                                                         className={styles.mainMenuIcon}/>
                                            </a>
                                            <ul className={styles.submenu}>
                                                <li>
                                                    <a href="/hocho/teacher/course" onClick={closeMobileMenu}>
                                                        Course
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/event-carousel" onClick={closeMobileMenu}>
                                                        Event Carousel
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/event-details" onClick={closeMobileMenu}>
                                                        Event Details
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li className={styles.hasDropdown}>
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                            }}>
                                                Teacher <FontAwesomeIcon icon={faAngleDown}
                                                                         className={styles.mainMenuIcon}/>
                                            </a>
                                            <ul className={styles.submenu}>
                                                <li>
                                                    <a href="/team" onClick={closeMobileMenu}>
                                                        Our Teacher
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/team-carousel" onClick={closeMobileMenu}>
                                                        Teacher Carousel
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/team-details" onClick={closeMobileMenu}>
                                                        Teacher Details
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li className={styles.hasDropdown}>
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                    }}>
                                        Entertainment <FontAwesomeIcon icon={faAngleDown}
                                                                       className={styles.mainMenuIcon}/>
                                    </a>
                                    <ul className={styles.submenu}>
                                        <li>
                                            <a href="/hocho/video" onClick={closeMobileMenu}>
                                                Video
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/hocho/games" onClick={closeMobileMenu}>
                                                Games
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="/hocho/tutors" onClick={closeMobileMenu}>
                                        Tutor
                                    </a>
                                </li>
                                {renderMenu()}
                            </ul>
                        </nav>
                        <button className={`${styles.searchTrigger} ${styles.searchIcon}`} aria-label="Search">
                            <FontAwesomeIcon icon={faSearch}/>
                        </button>
                        <a href={cartUrl} className={`${styles.searchTrigger} ${styles.searchIcon}`}
                           aria-label="Cart">
                            <FontAwesomeIcon icon={faCartShopping}/>
                        </a>
                        {!isLoggedIn ? (<div className={styles.headerButton}>
                            <a className={styles.themeBtn} href="/hocho/login">
                    <span>
                      Login <FontAwesomeIcon icon={faArrowRightLong}/>
                    </span>
                            </a>
                        </div>) : (<div className={styles.userProfile}>
                            <div className={styles.avatarContainer}>
                                <img
                                    src={getAvatarUrl()}
                                    alt="User Avatar"
                                    className={styles.userAvatar}
                                    onError={(e) => {
                                        e.target.src = `http://localhost:8080/api/hocho/profile/default.png?t=${new Date().getTime()}`;
                                    }}
                                />
                                <ul className={styles.profileDropdown}>
                                    <li>
                                        <a href="/hocho/profile" onClick={closeMobileMenu}>
                                            <FontAwesomeIcon icon={faIdBadge}/> Profile
                                        </a>
                                    </li>
                                    {role === 'ROLE_ADMIN' && (<li>
                                        <a href="/hocho/admin" onClick={closeMobileMenu}>
                                            <FontAwesomeIcon icon={faUniversalAccess}/> Administration
                                        </a>
                                    </li>)}
                                    {role === 'ROLE_TEACHER' && (<li>
                                        <a href="/hocho/teacher/track-revenue" onClick={closeMobileMenu}>
                                            <FontAwesomeIcon icon={faUniversalAccess}/> Orchestration
                                        </a>
                                    </li>)}
                                    {role === 'ROLE_CHILD' && (<li>
                                        <a href="/hocho/child/learning-history" onClick={closeMobileMenu}>
                                            <FontAwesomeIcon icon={faUniversalAccess}/> Learning History
                                        </a>
                                    </li>)}
                                    <li className={styles.messagesNotification}>
                                        <a href="/hocho/messaging" onClick={closeMobileMenu}>
                                            <FontAwesomeIcon icon={faComments}/> Messages
                                            {unreadCount > 0 && (<span className={styles.unreadBadge}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>)}
                                        </a>
                                    </li>
                                    <li className={styles.messagesNotification}>
                                        <a href="/hocho/notifications" onClick={closeMobileMenu}>
                                            <FontAwesomeIcon icon={faBell}/> Notifications
                                            {unreadNotifications > 0 && (<span className={styles.unreadBadge}>
                                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                        </span>)}
                                        </a>
                                    </li>
                                    {['ROLE_PARENT', 'ROLE_CHILD', 'ROLE_TEACHER'].includes(role) && (
                                        <li className={styles.messagesNotification}>
                                            <a href="/hocho/feedback" onClick={closeMobileMenu}>
                                                <FontAwesomeIcon icon={faComment}/> Feedbacks
                                                {unreadNotifications > 0 && (<span className={styles.unreadBadge}>
                                                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                                    </span>)}
                                            </a>
                                        </li>)}
                                    <li>
                                        <a
                                            className={styles.logoutLink}
                                            href="#"
                                            onClick={(e) => {
                                                handleLogout(e);
                                                closeMobileMenu();
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faDoorOpen}/> Logout
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>)}
                    </div>
                </div>
            </div>
        </header>
    </div>);
}

export default Header;