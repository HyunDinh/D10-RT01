import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/Auth.module.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Sending ...');
        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({email}),
            });

            if (response.ok) {
                setMessage('A password reset link has been sent to your email.');
            } else {
                const errorData = await response.text();
                setMessage(errorData || 'An error occurred. Please try again.');
            }
        } catch (err) {
            console.error('Error sending password reset request:', err);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (<>
            <a href='/hocho/home'>
                <img src='/Logo1.png' alt='Logo' width={80} height={80} className={styles.logo}/>
            </a>
            <div className={styles.body}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h4>Forgot Password 🔒</h4>
                        <p>Enter your email and we will send instructions to reset your password</p>
                        {message && (<div
                                className={`${styles.alert} ${message.includes('error') ? styles.alertDanger : styles.alertSuccess}`}>
                                {message}
                            </div>)}
                    </div>
                    <form onSubmit={handleSubmit} noValidate autoComplete="off" className={styles.form}>
                        <div className={styles.formGroup}>
                            <div className={styles.inputContainer}>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <label htmlFor="email">Email</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <button type="submit" className={styles.submitBtn}>Send reset link</button>
                        <p className={styles.backLink}>
                            <a href="/hocho/login" className={styles.linkFlex}>
                                <i className="ri-arrow-left-s-line"></i>
                                <span>Return to Login</span>
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </>);
}

export default ForgotPassword;