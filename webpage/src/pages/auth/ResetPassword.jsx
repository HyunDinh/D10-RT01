import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../../styles/Auth.module.css';
import { useTranslation } from 'react-i18next';

function ResetPassword() {
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setMessage(t('reset_password_invalid_link', 'Invalid link. Please try again.'));
        }
    }, [token, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (newPassword !== confirmPassword) {
            setMessage(t('reset_password_confirm_error', 'Confirmation password does not match.'));
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            if (response.ok) {
                setMessage(t('reset_password_success', 'Password has been reset successfully - You can log in.'));
                setTimeout(() => navigate('/hocho/login'), 3000);
            } else {
                const errorData = await response.text();
                setMessage(errorData || t('reset_password_expired', 'The link is invalid or expired.'));
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setMessage(t('reset_password_error', 'An error occurred. Please try again.'));
        }
    };

    return (
        <div className={styles.body}>
            <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <h4>{t('reset_password_title', 'Reset Password 🔑')}</h4>
                    <p>{t('reset_password_subtitle', 'Enter a new password for your account')}</p>
                    {message && (
                        <div className={`${styles.alert} ${message.includes('error') ? styles.alertDanger : styles.alertSuccess}`}>
                            {message}
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit} noValidate autoComplete="off" className={styles.form}>
                    <div className={styles.formGroup}>
                        <div className={styles.inputContainer}>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="newPassword">{t('profile_new_password', 'New Password')}</label>
                            <span className={styles.notch}></span>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <div className={styles.inputContainer}>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="confirmPassword">{t('profile_confirm_password', 'Confirm Password')}</label>
                            <span className={styles.notch}></span>
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn}>{t('reset_password_btn', 'Reset Password')}</button>
                    <p className={styles.backLink}>
                        <a href="/hocho/login" className={styles.linkFlex}>
                            <i className="ri-arrow-left-s-line"></i>
                            <span>{t('forgot_password_back_login', 'Return to Login')}</span>
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;