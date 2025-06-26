import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../../styles/Auth.module.css';

function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setMessage('Invalid link. Please try again.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (newPassword !== confirmPassword) {
            setMessage('Confirmation password does not match.');
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
                setMessage('Password has been reset successfully - You can log in.');
                setTimeout(() => navigate('/hocho/login'), 3000);
            } else {
                const errorData = await response.text();
                setMessage(errorData || 'The link is invalid or expired.');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.body}>
            <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <h4>Reset Password 🔑</h4>
                    <p>Enter a new password for your account</p>
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
                            <label htmlFor="newPassword">New Password</label>
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
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <span className={styles.notch}></span>
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn}>Reset Password</button>
                    <p className={styles.backLink}>
                        <a href="/hocho/login" className={styles.linkFlex}>
                            <i className="ri-arrow-left-s-line"></i>
                            <span>Return to Login</span>
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;