import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import styles from '../styles/Profile.module.css'; // Corrected import

function Profile() {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editedFullName, setEditedFullName] = useState('');
    const [editedDateOfBirth, setEditedDateOfBirth] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [date, setDate] = useState('2025-06-17');

    useEffect(() => {
        fetchProfileData();
    }, [navigate, refreshKey]);

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
            setUser(response.data);
            setEditedFullName(response.data.fullName || '');
            setEditedDateOfBirth(response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : '');
            console.log('Fetched user data:', response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Không thể tải thông tin profile. Vui lòng thử lại.');
            if (err.response && err.response.status === 401) {
                navigate('/hocho/login');
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        axios
            .put('http://localhost:8080/api/hocho/profile', {
                fullName: editedFullName, dateOfBirth: editedDateOfBirth,
            }, {withCredentials: true})
            .then((response) => {
                setUser(response.data);
                setIsEditing(false);
                setError('');
            })
            .catch((err) => {
                console.error('Error updating profile:', err);
                setError('Cập nhật thông tin thất bại. Vui lòng thử lại.');
            });
    };

    const handleUpdatePassword = () => {
        setShowPasswordModal(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };

    const handleSavePassword = () => {
        // Validate passwords
        if (!oldPassword) {
            setError('Vui lòng nhập mật khẩu cũ');
            return;
        }
        if (!newPassword) {
            setError('Vui lòng nhập mật khẩu mới');
            return;
        }
        if (!confirmPassword) {
            setError('Vui lòng xác nhận mật khẩu mới');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        axios
            .put('http://localhost:8080/api/hocho/profile/password', {
                oldPassword: oldPassword, newPassword: newPassword, confirmPassword: confirmPassword,
            }, {withCredentials: true})
            .then((response) => {
                setShowPasswordModal(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError('Cập nhật mật khẩu thành công!');
            })
            .catch((err) => {
                console.error('Error updating password:', err);
                setError(err.response?.data?.message || 'Cập nhật mật khẩu thất bại. Vui lòng thử lại.');
            });
    };

    const handleFileChange = async (event) => {
        setError('Uploading ...');
        const file = event.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('username', user.username);
            try {
                const response = await axios.post('http://localhost:8080/api/hocho/profile/upload', formData, {
                    withCredentials: true, headers: {'Content-Type': 'multipart/form-data'},
                });
                console.log('Upload response:', response.data);
                setRefreshKey((prevKey) => prevKey + 1);
                await fetchProfileData();
                fileInputRef.current.value = '';
                setError('Cập nhật ảnh đại diện thành công!');
            } catch (err) {
                console.error('Error uploading profile picture:', err);
                if (err.response && err.response.data) {
                    setError(err.response.data);
                } else {
                    setError('Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.');
                }
                fileInputRef.current.value = '';
            }
        } else {
            setError('Vui lòng chọn file PNG hoặc JPG.');
            fileInputRef.current.value = '';
        }
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!user.avatarUrl || user.avatarUrl === 'none') {
            return `${baseUrl}/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
    };

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>My Profile</p>
                <ul
                    className={styles.breadcrumbItems}
                    data-aos-duration="800"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <li>
                        <a href="/hocho/home">Home</a>
                    </li>
                    <li>
                        <i className="fas fa-chevron-right"></i>
                    </li>
                    <li>About Us</li>
                </ul>
            </div>
        </section>
        <div className={styles.accountHub}>
            <div className={styles.gridContainer}>
                <div className={styles.gridItems}>
                    <div className={styles.userPreview}>
                        <div className={styles.userInfo}>
                            <img
                                src={getAvatarUrl()}
                                alt="User Avatar"
                                className={styles.avatarImg}
                                onError={(e) => {
                                    e.target.src = 'http://localhost:8080/profile/default.png?t=' + new Date().getTime();
                                }}
                            />
                            {user.isActive && <i className="fa-regular fa-circle-check fa-bounce"></i>}
                        </div>
                        <span>{user.isActive ? '' : 'This account not verify'}</span>
                    </div>
                    <button className={styles.uploadBox}>
                        <i className="fa-regular fa-user"></i>
                        <p>Change Avatar</p>
                        <p>110x110px size minimum</p>
                    </button>
                    <button className={styles.uploadBox}>
                        <i className="fa-regular fa-image"></i>
                        <p>Change Cover</p>
                        <p>1184x300px size minimum</p>
                    </button>
                </div>
                <div className={styles.widgetBox}>
                    <div className={styles.profileHeader}>
                        <p className={styles.widgetTitle}>About Your Profile</p>
                        <button className={styles.buttonSave}>Save</button>
                    </div>
                    <form className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>

                                <input type="text" id="username" name="username" placeholder="" required/>
                                <label htmlFor="username">Profile Name</label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input type="text" id="name" name="name"
                                       placeholder=""
                                       required/>
                                <label htmlFor="username">Full Name</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <textarea id="description" name="description" placeholder="" required placeholder=""/>
                                <label htmlFor="Description">Description</label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input type="text" id="mail" name="mail" placeholder="" required/>
                                <label htmlFor="username">Gmail</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <select id="country" name="country" required>
                                    <option>Select your Country</option>
                                    <option selected>United States</option>
                                    <option selected>Viet Nam</option>
                                </select>
                                <i className="fa-solid fa-caret-down "></i>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <select id="city" name="city" required>
                                    <option selected>Select your City</option>
                                    <option>New York</option>
                                </select>
                                <i className="fa-solid fa-caret-down custom-arrow"></i>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    placeholder=""
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                                <label htmlFor="date" className={date ? styles.floating : ''}>
                                    Birthdate
                                </label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input type="text" id="role" name="role" placeholder="" required/>
                                <label htmlFor="role">Role</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <input type="text" id="Created At" name="Created At" placeholder="" required/>
                                <label htmlFor="Created At">Created At:</label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input type="text" id="Updated At" name="Updated At" placeholder="" required/>
                                <label htmlFor="Updated At">Updated At</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                    </form>
                </div>
                <div className={styles.widgetBox}>
                    <p className={styles.widgetTitle}>Interests</p>
                    <form className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>Favourite TV Shows:</label>
                                <textarea id="description" name="description" required placeholder=""/>
                            </div>
                            <div className={styles.formItem}>
                                <label>Favourite Music Bands / Artists:</label>
                                <textarea id="description" name="description" required placeholder=""/>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>Favourite Movies:</label>
                                <textarea id="description" name="description" required placeholder=""/>
                            </div>
                            <div className={styles.formItem}>
                                <label>Favourite Books:</label>
                                <textarea id="description" name="description" required placeholder=""/>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>Favourite Games:</label>
                                <textarea id="description" name="description" required placeholder=""/>
                            </div>
                            <div className={styles.formItem}>
                                <label>My Hobbies:</label>
                                <textarea id="description" name="description" required placeholder=""/>
                            </div>
                        </div>
                        <div className={styles.formRow} style={{justifyContent: 'flex-end'}}>
                            <button
                                className={styles.buttonSave}
                                style={{
                                    width: '15%', padding: '10px 20px',
                                }}
                            >
                                Save all
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </>);
}

export default Profile;