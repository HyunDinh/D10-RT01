import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Auth.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCaretDown, faEyeSlash, faUpload} from '@fortawesome/free-solid-svg-icons';
import {faFacebookF, faGithub, faGoogle, faTwitter} from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';

const Auth = () => {
    const { t } = useTranslation();
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [logoutMessage, setLogoutMessage] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        teacherImage: null,
    });
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        setMessage('');
        setError('');
        setLogoutMessage('');
    }, [isRegistering]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const oauthError = searchParams.get('oauthError');
        const loginError = searchParams.get('error');
        if (oauthError) {
            setMessage(decodeURIComponent(oauthError));
        } else if (loginError) {
            setMessage(decodeURIComponent(loginError));
        }

        fetch('http://localhost:8080/api/auth/user', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return null;
            })
            .then(userData => {
                if (userData) {
                    const role = userData.role;
                    setUserRole(role);
                    localStorage.setItem('userRole', role);
                    navigate('/hocho/home');
                }
            })
            .catch(err => console.error('Error checking auth status:', err));
    }, [navigate, location.search]);

    const [registerData, setRegisterData] = useState({
        username: '',
        password: '',
        retypePassword: '',
        email: '',
        parentEmail: '',
        role: 'child',
        phoneNumber: '',
        agree: false,
        teacherImage: null
    });

    const handleRegisterChange = (e) => {
        const {name, value, type, checked, files} = e.target;
        setRegisterData({
            ...registerData,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        });
    };

    const handleRegisterFileChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ['image/png', 'image/jpeg'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setError(t('auth_error_file_type'));
                setFileName('');
                setRegisterData((prev) => ({ ...prev, teacherImage: null }));
                return;
            }
            if (file.size > maxSize) {
                setError(t('auth_error_file_size'));
                setFileName('');
                setRegisterData((prev) => ({ ...prev, teacherImage: null }));
                return;
            }
            setRegisterData((prev) => ({ ...prev, teacherImage: file }));
            setFileName(file.name);
        } else {
            setRegisterData((prev) => ({ ...prev, teacherImage: null }));
            setFileName('');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Kiểm tra client-side
        if (registerData.role === 'teacher' && !registerData.teacherImage) {
            setError(t('auth_error_teacher_image_required'));
            return;
        }

        try {
            const formData = new FormData();
            formData.append('request', new Blob([JSON.stringify({
                username: registerData.username,
                password: registerData.password,
                retypePassword: registerData.retypePassword,
                email: registerData.email,
                parentEmail: registerData.parentEmail,
                role: registerData.role,
                phoneNumber: registerData.phoneNumber
            })], { type: 'application/json' }));
            if (registerData.role === 'teacher' && registerData.teacherImage) {
                formData.append('teacherImage', registerData.teacherImage);
            }

            const response = await axios.post('http://localhost:8080/api/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            setMessage(response.data.message || t('auth_register_success'));
            setError('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || t('auth_register_failed');
            setError(errorMessage);
            setMessage('');
        }
    };

    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });

    const handleLoginChange = (e) => {
        const {name, value, type, checked} = e.target;
        setLoginData({
            ...loginData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage(t('auth_login_loading'));

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const userResponse = await fetch('http://localhost:8080/api/auth/user', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    const role = userData.role;
                    setUserRole(role);
                    localStorage.setItem('userRole', role);
                    navigate('/hocho/home');
                }
            } else {
                const errorData = await response.text();
                setMessage(errorData);
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage(t('auth_login_error'));
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const handleToggleRepeatPassword = () => {
        setShowRepeatPassword(!showRepeatPassword);
    };

    const handleForgotPassword = () => {
        navigate('/hocho/forgot-password');
    };

    return (
        <div className={styles.body}>
            <a href='/hocho/home'>
                <img src='/Logo1.png' alt={t('auth_logo_alt')} width={80} height={80} className={styles.logo}/>
            </a>
            <div className={styles.container}>
                {isRegistering ? (
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h4>{t('auth_register_title')}</h4>
                            <p>{t('auth_register_subtitle')}</p>
                            {message && <div className={`${styles.alert} ${styles.alertSuccess}`}>{message}</div>}
                            {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
                        </div>
                        <form onSubmit={handleRegisterSubmit} noValidate autoComplete="off" className={styles.form}>
                            <div className={styles.formGroup}>
                                <div className={styles.inputContainer}>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={registerData.username}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                    <label htmlFor="username">{t('auth_username')}</label>
                                    <span className={styles.notch}></span>
                                </div>
                            </div>
                            {registerData.role !== 'child' && (
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={registerData.email}
                                            onChange={handleRegisterChange}
                                            required
                                        />
                                        <label htmlFor="email">{t('auth_email')}</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>
                            )}
                            {registerData.role === 'child' && (
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="email"
                                            name="parentEmail"
                                            value={registerData.parentEmail}
                                            onChange={handleRegisterChange}
                                            required
                                        />
                                        <label htmlFor="email">{t('auth_parent_email')}</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>
                            )}
                            <div className={styles.formGroup}>
                                <div className={styles.inputContainer}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        required
                                    />
                                    <label htmlFor="password">{t('auth_password')}</label>
                                    <span className={styles.notch}></span>
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={handleTogglePassword}
                                    >
                                        {showPassword ? '👁️' : <FontAwesomeIcon icon={faEyeSlash}/>} 
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <div className={styles.inputContainer}>
                                    <input
                                        type={showRepeatPassword ? 'text' : 'password'}
                                        id="repeatPassword"
                                        name="retypePassword"
                                        value={registerData.retypePassword}
                                        onChange={handleRegisterChange}
                                        disabled={false}
                                        required
                                    />
                                    <label htmlFor="password">{t('auth_repeat_password')}</label>
                                    <span className={styles.notch}></span>
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={handleToggleRepeatPassword}
                                    >
                                        {showRepeatPassword ? '👁️' : <FontAwesomeIcon icon={faEyeSlash}/>} 
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <div className={styles.inputContainer}>
                                    <select
                                        id="role"
                                        name="role"
                                        value={registerData.role}
                                        onChange={handleRegisterChange}
                                        required
                                    >
                                        <option value="child">{t('auth_role_child')}</option>
                                        <option value="parent">{t('auth_role_parent')}</option>
                                        <option value="teacher">{t('auth_role_teacher')}</option>
                                    </select>
                                    <FontAwesomeIcon icon={faCaretDown} className={styles.customArrow}/>
                                    <span className={styles.notch}></span>
                                </div>
                            </div>
                            {(registerData.role === 'parent' || registerData.role === 'teacher') && (
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phoneNumber"
                                            value={registerData.phoneNumber}
                                            onChange={handleRegisterChange}
                                            required
                                        />
                                        <label htmlFor="phone">{t('auth_phone')}</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>
                            )}
                            {registerData.role === 'teacher' && (
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="file"
                                            id="teacherImage"
                                            name="teacherImage"
                                            accept="image/png,image/jpeg"
                                            onChange={handleRegisterFileChange}
                                            required={registerData.role === 'teacher'}
                                        />
                                        <label htmlFor="teacherImage">
                                            {fileName || t('auth_teacher_image')}
                                        </label>
                                        <span className={styles.notch}></span>
                                        <FontAwesomeIcon icon={faUpload} className={styles.customArrow} />
                                    </div>
                                </div>
                            )}
                            <div className={styles.formOptions}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        name="agree"
                                        checked={registerData.agree}
                                        onChange={handleRegisterChange}
                                    />
                                    <span>
                                        {t('auth_agree')} <a href="#" className={styles.termsLink}>{t('auth_privacy_policy')}</a>
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!registerData.agree}
                                title={!registerData.agree ? t('auth_agree_hint') : ""}
                            >
                                {t('auth_sign_up')}
                            </button>
                            <div className={styles.registerLink}>
                                <p>
                                    {t('auth_already_have_account')}
                                    <a href="#" onClick={() => setIsRegistering(false)}> {t('auth_sign_in_instead')}</a>
                                </p>
                            </div>
                            <div className={styles.divider}>
                                <span>{t('auth_or')}</span>
                            </div>
                            <div className={styles.socialButtons}>
                                <button type="button" className={`${styles.socialBtn} ${styles.facebook}`}>
                                    <FontAwesomeIcon icon={faFacebookF} bounce/>
                                </button>
                                <button type="button" className={`${styles.socialBtn} ${styles.twitter}`}>
                                    <FontAwesomeIcon icon={faTwitter} bounce/>
                                </button>
                                <button type="button" className={`${styles.socialBtn} ${styles.github}`}>
                                    <FontAwesomeIcon icon={faGithub} bounce/>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className={`${styles.socialBtn} ${styles.google}`}
                                >
                                    <FontAwesomeIcon icon={faGoogle} bounce/>
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h4>{t('auth_login_title')}</h4>
                            {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
                            {message && <div className={`${styles.alert} ${styles.alertDanger}`}>{message}</div>}
                            {logoutMessage && (
                                <div className={`${styles.alert} ${styles.alertSuccess}`}>{logoutMessage}</div>
                            )}
                            <p>{t('auth_login_subtitle')}</p>
                        </div>
                        <form onSubmit={handleLoginSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <div className={styles.inputContainer}>
                                    <input
                                        type="text"
                                        name="username"
                                        value={loginData.username}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                    <label htmlFor="username">{t('auth_username')}</label>
                                    <span className={styles.notch}></span>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <div className={styles.inputContainer}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                    <label htmlFor="password">{t('auth_password')}</label>
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={handleTogglePassword}
                                    >
                                        {showPassword ? '👁️' : <FontAwesomeIcon icon={faEyeSlash}/>} 
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formOptions}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={loginData.rememberMe}
                                        onChange={handleLoginChange}
                                    />
                                    <span>{t('auth_remember_me')}</span>
                                </label>
                                <a
                                    href="#"
                                    className={styles.forgotPassword}
                                    onClick={handleForgotPassword}
                                >
                                    {t('auth_forgot_password')}
                                </a>
                            </div>
                            <button type="submit" className={styles.submitBtn}>{t('auth_log_in')}</button>
                            <div className={styles.registerLink}>
                                <p>
                                    {t('auth_new_on_platform')}
                                    <a href="#" onClick={() => setIsRegistering(true)}> {t('auth_create_account')}</a>
                                </p>
                            </div>
                            <div className={styles.divider}>
                                <span>{t('auth_or')}</span>
                            </div>
                            <div className={styles.socialButtons}>
                                <button type="button" className={`${styles.socialBtn} ${styles.facebook}`}>
                                    <FontAwesomeIcon icon={faFacebookF} bounce/>
                                </button>
                                <button type="button" className={`${styles.socialBtn} ${styles.twitter}`}>
                                    <FontAwesomeIcon icon={faTwitter} bounce/>
                                </button>
                                <button type="button" className={`${styles.socialBtn} ${styles.github}`}>
                                    <FontAwesomeIcon icon={faGithub} bounce/>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className={`${styles.socialBtn} ${styles.google}`}
                                >
                                    <FontAwesomeIcon icon={faGoogle} bounce/>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auth;