import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Unauthorized.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const Unauthorized = ({ allowedRoles }) => {
    const { t } = useTranslation();
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
        // Map role names to user-friendly names (i18n)
        const roleMap = {
            ROLE_ADMIN: t('role_admin', 'administrators'),
            ROLE_TEACHER: t('role_teacher', 'teachers'),
            ROLE_PARENT: t('role_parent', 'parents'),
            ROLE_CHILD: t('role_child', 'students')
        };

        const formattedRoles = roles.map(role => roleMap[role] || role);

        if (formattedRoles.length === 1) {
            return formattedRoles[0];
        } else if (formattedRoles.length === 2) {
            return t('unauthorized_or', '{{role1}} or {{role2}}', { role1: formattedRoles[0], role2: formattedRoles[1] });
        } else {
            // e.g. admin, teacher, or parent
            const allButLast = formattedRoles.slice(0, -1).join(', ');
            return t('unauthorized_list_or', '{{list}}, or {{last}}', { list: allButLast, last: formattedRoles[formattedRoles.length - 1] });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.messageBox}>
                <h1 className={styles.title}>{t('unauthorized_title', 'Access Denied')}</h1>
                <p className={styles.message}>
                    {t('unauthorized_message', 'You do not have permission to access this page. Only {{roles}} can view this content.', { roles: formatRoles(allowedRoles) })}
                </p>
                <div className={styles.buttonGroup}>
                    <button onClick={handleGoHome} className={styles.button}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} /> {t('unauthorized_go_home', 'Go to Home')}
                    </button>
                    <button onClick={handleLogout} className={styles.button}>
                        <FontAwesomeIcon icon={faSignOutAlt} className={styles.icon} /> {t('unauthorized_logout', 'Log Out')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;