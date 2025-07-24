import React, { useState, useEffect } from "react";
import styles from "../styles/SidebarAdmin.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faBook, faComments, faTable, faSignInAlt, faSignOutAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from "react-country-flag";
import axios from 'axios';

const LANGUAGES = [
    { code: "vi", label: "Tiếng Việt", flag: "VN" },
    { code: "en", label: "English", flag: "US" },
];

const sectionLinks = [
    { id: 'dashboard', icon: faChartPie, label: 'User Statistics' },
    { id: 'content-stats', icon: faBook, label: 'Content Statistics' },
    { id: 'feedback-stats', icon: faComments, label: 'Feedback Statistics' },
    { id: 'system-management', icon: faTable, label: 'System Management' },
];

const SidebarAdmin = () => {
    const { t, i18n } = useTranslation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true })
            .then(res => {
                setUser(res.data);
                setIsLoggedIn(true);
            })
            .catch(() => {
                setUser({});
                setIsLoggedIn(false);
            });
    }, []);

    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true });
            setIsLoggedIn(false);
            setUser({});
            window.location.href = '/hocho/login';
        } catch {
            window.location.href = '/hocho/login';
        }
    };

    const handleLogin = () => {
        window.location.href = '/hocho/login';
    };

    return (
        <nav className={styles.sidebar}>
            <div className={styles.sidebarTitle}>
                <a href="/hocho/home">
                    <img alt="Logo" width="100" height="100" src="/logo.png"/>
                </a>
            </div>
            <ul className={styles.sidebarList}>
                {sectionLinks.map(link => (
                    <li key={link.id}>
                        <button className={styles.sidebarBtn} onClick={() => handleScroll(link.id)}>
                            <FontAwesomeIcon icon={link.icon}/> {link.label}
                        </button>
                    </li>
                ))}
            </ul>
            <div className={styles.sidebarBottom}>
                <div className={styles.languageSwitch}>
                    <FontAwesomeIcon icon={faGlobe} style={{marginRight: 8}}/>
                    <ReactCountryFlag
                        countryCode={LANGUAGES.find(l => l.code === i18n.language)?.flag || "US"}
                        svg
                        style={{ width: "1.3em", height: "1.3em", marginRight: 6 }}
                        title={i18n.language}
                    />
                    <select
                        className={styles.languageSelect}
                        value={i18n.language}
                        onChange={e => {
                            i18n.changeLanguage(e.target.value);
                            localStorage.setItem('i18nextLng', e.target.value);
                        }}
                    >
                        {LANGUAGES.map(lang => (
                            <option value={lang.code} key={lang.code}>{lang.label}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.authBtnWrap}>
                    {isLoggedIn ? (
                        <button className={styles.sidebarBtn} onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} style={{marginRight: 8}}/>{t('logout', 'Logout')}
                        </button>
                    ) : (
                        <button className={styles.sidebarBtn} onClick={handleLogin}>
                            <FontAwesomeIcon icon={faSignInAlt} style={{marginRight: 8}}/>{t('login', 'Login')}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default SidebarAdmin;
