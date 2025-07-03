import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Auth.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCaretDown, faEyeSlash, faUpload} from '@fortawesome/free-solid-svg-icons';
import {faFacebookF, faGithub, faGoogle, faTwitter} from '@fortawesome/free-brands-svg-icons';

const Auth = () => {
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
                setError('Vui lòng chọn tệp PNG hoặc JPG.');
                setFileName('');
                setRegisterData((prev) => ({ ...prev, teacherImage: null }));
                return;
            }
            if (file.size > maxSize) {
                setError('Kích thước tệp không được vượt quá 5MB.');
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
            setError('Ảnh xác thực giáo viên là bắt buộc.');
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

            setMessage(response.data.message || 'Đăng ký thành công!');
            setError('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.';
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
        setMessage('Login ...');

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
            setMessage('An error occurred during login. Please try again.');
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
                <img src='/Logo1.png' alt='Logo' width={80} height={80} className={styles.logo}/>
            </a>
            <div className={styles.container}>
                {isRegistering ? (
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h4>Adventure starts here 🚀</h4>
                            <p>Make your app management easy and fun!</p>
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
                                    <label htmlFor="username">Username</label>
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
                                        <label htmlFor="email">Email</label>
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
                                        <label htmlFor="email">Parent Email</label>
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
                                    <label htmlFor="password">Password</label>
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
                                    <label htmlFor="password">Repeat Password</label>
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
                                        <option value="child">Student (Enter mail parent)</option>
                                        <option value="parent">Parent</option>
                                        <option value="teacher">Teacher</option>
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
                                        <label htmlFor="phone">Phone number (09)</label>
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
                                            {fileName || 'Teacher Verification Image (PNG/JPG)'}
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
                                        I agree to <a href="#" className={styles.termsLink}>privacy policy & terms</a>
                                    </span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!registerData.agree}
                                title={!registerData.agree ? "Please agree to the privacy policy & terms" : ""}
                            >
                                Sign Up
                            </button>
                            <div className={styles.registerLink}>
                                <p>
                                    Already have an account?
                                    <a href="#" onClick={() => setIsRegistering(false)}> Sign in instead</a>
                                </p>
                            </div>
                            <div className={styles.divider}>
                                <span>or</span>
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
                            <h4>Welcome to Hocho! 👋🏻</h4>
                            {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
                            {message && <div className={`${styles.alert} ${styles.alertDanger}`}>{message}</div>}
                            {logoutMessage && (
                                <div className={`${styles.alert} ${styles.alertSuccess}`}>{logoutMessage}</div>
                            )}
                            <p>Please sign-in to your account and start the adventure</p>
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
                                    <label htmlFor="username">Username</label>
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
                                    <label htmlFor="password">Password</label>
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
                                    <span>Remember me</span>
                                </label>
                                <a
                                    href="#"
                                    className={styles.forgotPassword}
                                    onClick={handleForgotPassword}
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <button type="submit" className={styles.submitBtn}>Log In</button>
                            <div className={styles.registerLink}>
                                <p>
                                    New on our platform?
                                    <a href="#" onClick={() => setIsRegistering(true)}> Create an account</a>
                                </p>
                            </div>
                            <div className={styles.divider}>
                                <span>or</span>
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