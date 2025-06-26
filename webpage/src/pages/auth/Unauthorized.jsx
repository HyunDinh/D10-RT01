import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Unauthorized.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Unauthorized = ({ allowedRoles }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/hocho/home');
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true });
            localStorage.removeItem('userRole');
            navigate('/hocho/login');
        } catch (err) {
            console.error('Error logging out:', err);
            navigate('/hocho/login');
        }
    };

    // Format allowed roles for display
    const formatRoles = (roles) => {
        // Map role names to user-friendly names
        const roleMap = {
            ROLE_ADMIN: 'administrators',
            ROLE_TEACHER: 'teachers',
            ROLE_PARENT: 'parents',
            ROLE_CHILD: 'students'
        };

        const formattedRoles = roles.map(role => roleMap[role] || role);

        if (formattedRoles.length === 1) {
            return formattedRoles[0];
        } else if (formattedRoles.length === 2) {
            return `${formattedRoles[0]} or ${formattedRoles[1]}`;
        } else {
            return `${formattedRoles.slice(0, -1).join(', ')}, or ${formattedRoles[formattedRoles.length - 1]}`;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.messageBox}>
                <h1 className={styles.title}>Access Denied</h1>
                <p className={styles.message}>
                    You do not have permission to access this page. Only {formatRoles(allowedRoles)} can view this content.
                </p>
                <div className={styles.buttonGroup}>
                    <button onClick={handleGoHome} className={styles.button}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} /> Go to Home
                    </button>
                    <button onClick={handleLogout} className={styles.button}>
                        <FontAwesomeIcon icon={faSignOutAlt} className={styles.icon} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;