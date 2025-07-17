import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/Profile.module.css';
import Header from '../../components/Header';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleCheck, faImage, faUser} from '@fortawesome/free-regular-svg-icons';
import { useTranslation } from 'react-i18next';

function Profile() {
    const { t } = useTranslation();
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
            setError(t('profile_error_load', 'Cannot load profile information. Please try again.'));
            if (err.response && err.response.status === 401) {
                navigate('/hocho/login');
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        if (editedDateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(editedDateOfBirth)) {
            setError(t('profile_error_date_format', 'Invalid date format. Please use yyyy-MM-dd.'));
            return;
        }
        axios
            .put('http://localhost:8080/api/hocho/profile', {
                fullName: editedFullName, dateOfBirth: editedDateOfBirth
            }, {withCredentials: true})
            .then((response) => {
                setUser(response.data);
                setIsEditing(false);
                setError(t('profile_update_success', 'Profile updated successfully!'));
                window.location.reload(true);
            })
            .catch((err) => {
                console.error('Error updating profile:', err);
                setError(err.response?.data?.message || t('profile_error_update', 'Failed to update profile. Please try again.'));
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
        if (!oldPassword) {
            setError(t('profile_error_enter_old_password', 'Please enter old password'));
            return;
        }
        if (!newPassword) {
            setError(t('profile_error_enter_new_password', 'Please enter new password'));
            return;
        }
        if (!confirmPassword) {
            setError(t('profile_error_confirm_new_password', 'Please confirm new password'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('profile_error_password_not_match', 'New password and confirmation do not match'));
            return;
        }

        axios
            .put('http://localhost:8080/api/hocho/profile/password', {
                oldPassword, newPassword, confirmPassword
            }, {withCredentials: true})
            .then(() => {
                setShowPasswordModal(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError(t('profile_password_update_success', 'Password updated successfully!'));
            })
            .catch((err) => {
                console.error('Error updating password:', err);
                setError(err.response?.data?.message || t('profile_error_update_password', 'Failed to update password. Please try again.'));
            });
    };

    const handleFileChange = async (event) => {
        setError(t('profile_uploading', 'Uploading ...'));
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
                setError(t('profile_avatar_update_success', 'Avatar updated successfully!'));
            } catch (err) {
                console.error('Error uploading profile picture:', err);
                setError(err.response?.data || t('profile_error_update_avatar', 'Failed to update avatar. Please try again.'));
                fileInputRef.current.value = '';
            }
        } else {
            setError(t('profile_error_file_type', 'Please select a PNG or JPG file.'));
            fileInputRef.current.value = '';
        }
    };

    const getAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!user.avatarUrl || user.avatarUrl === 'none') {
            return `/default.jpg?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${user.avatarUrl}?t=${new Date().getTime()}`;
    };

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('profile_my_profile', 'My Profile')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                    data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">{t('profile_home', 'Home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('profile_profile', 'Profile')}</li>
                </ul>
            </div>
        </section>
        <div className={styles.accountHub}>
            <div className={styles.gridItems}>
                <div className={styles.userPreview}>
                    <div className={styles.background}>
                        <img src="/avaBack.jpg" alt={t('profile_background', 'Background')} className={styles.backgroundImg} />
                    </div>
                    <div className={styles.userInfo}>
                        <img
                            src={getAvatarUrl()}
                            alt={t('profile_user_avatar', 'User Avatar')}
                            className={styles.avatarImg}
                            onError={(e) => {
                                e.target.src = `/default.jpg${new Date().getTime()}`;
                            }}
                        />
                        {user.isActive && (
                            <FontAwesomeIcon icon={faCircleCheck} bounce className={styles.verifyIcon}/>
                        )}
                    </div>
                    <span>{user.isActive ? '' : t('profile_account_not_verified', 'This account not verify')}</span>
                </div>
                <button className={styles.uploadBox} onClick={() => fileInputRef.current.click()}>
                    <FontAwesomeIcon icon={faUser} className={styles.IconUpload}/>
                    <p>{t('profile_change_avatar', 'Change Avatar')}</p>
                    <p>{t('profile_avatar_size', '110x110px size minimum')}</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{display: 'none'}}
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                    />
                </button>
                <button className={styles.uploadBox}>
                    <FontAwesomeIcon icon={faImage} className={styles.IconUpload}/>
                    <p>{t('profile_change_cover', 'Change Cover')}</p>
                    <p>{t('profile_cover_size', '1184x300px size minimum')}</p>
                </button>
            </div>
            <div className={styles.gridContainer}>
                <div className={styles.widgetBox}>
                    <div className={styles.profileHeader}>
                        <p className={styles.widgetTitle}>{t('profile_about_your_profile', 'About Your Profile')}</p>
                        <button className={styles.buttonSave} onClick={isEditing ? handleSave : handleEdit}>
                            {isEditing ? t('profile_save', 'Save') : t('profile_edit', 'Edit')}
                        </button>
                    </div>
                    <form className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={user.username || ''}
                                    disabled
                                    required
                                />
                                <label htmlFor="username">{t('profile_profile_name', 'Profile Name')}</label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editedFullName}
                                    onChange={(e) => setEditedFullName(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                />
                                <label htmlFor="name">{t('profile_full_name', 'Full Name')}</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder=""
                                    disabled={!isEditing}
                                    required
                                />
                                <label htmlFor="description">{t('profile_description', 'Description')}</label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="text"
                                    id="mail"
                                    name="mail"
                                    value={user.email || ''}
                                    disabled
                                    required
                                />
                                <label htmlFor="mail">{t('profile_gmail', 'Gmail')}</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <select id="country" name="country" disabled={!isEditing} required>
                                    <option value="">{t('profile_select_country', 'Select your Country')}</option>
                                    <option value="United States">{t('profile_country_us', 'United States')}</option>
                                    <option value="Viet Nam">{t('profile_country_vn', 'Viet Nam')}</option>
                                </select>
                                <i className="fa-solid fa-caret-down"></i>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <select id="city" name="city" disabled={!isEditing} required>
                                    <option value="">{t('profile_select_city', 'Select your City')}</option>
                                    <option value="New York">{t('profile_city_newyork', 'New York')}</option>
                                </select>
                                <i className="fa-solid fa-caret-down"></i>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={editedDateOfBirth}
                                    onChange={(e) => setEditedDateOfBirth(e.target.value)}
                                    disabled={!isEditing}
                                    required
                                />
                                <label htmlFor="date">{t('profile_birthdate', 'Birthdate')}</label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="text"
                                    id="role"
                                    name="role"
                                    value={user.role || ''}
                                    disabled
                                    required
                                />
                                <label htmlFor="role">{t('profile_role', 'Role')}</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.inputContainer}>
                                <input
                                    type="text"
                                    id="createdAt"
                                    name="createdAt"
                                    value={user.createdAt || ''}
                                    disabled
                                    required
                                />
                                <label htmlFor="createdAt">{t('profile_created_at', 'Created At')}</label>
                                <span className={styles.notch}></span>
                            </div>
                            <div className={styles.inputContainer}>
                                <input
                                    type="text"
                                    id="updatedAt"
                                    name="updatedAt"
                                    value={user.updatedAt || ''}
                                    disabled
                                    required
                                />
                                <label htmlFor="updatedAt">{t('profile_updated_at', 'Updated At')}</label>
                                <span className={styles.notch}></span>
                            </div>
                        </div>
                    </form>
                </div>
                <div className={styles.widgetBox}>
                    <p className={styles.widgetTitle}>{t('profile_interests', 'Interests')}</p>
                    <form className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>{t('profile_fav_tv_shows', 'Favourite TV Shows:')}</label>
                                <textarea
                                    id="tvShows"
                                    name="tvShows"
                                    placeholder={t('profile_enter_fav_tv_shows', 'Enter your favourite TV shows')}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                            <div className={styles.formItem}>
                                <label>{t('profile_fav_music', 'Favourite Music Bands / Artists:')}</label>
                                <textarea
                                    id="music"
                                    name="music"
                                    placeholder={t('profile_enter_fav_music', 'Enter your favourite music bands/artists')}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>{t('profile_fav_movies', 'Favourite Movies:')}</label>
                                <textarea
                                    id="movies"
                                    name="movies"
                                    placeholder={t('profile_enter_fav_movies', 'Enter your favourite movies')}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                            <div className={styles.formItem}>
                                <label>{t('profile_fav_books', 'Favourite Books:')}</label>
                                <textarea
                                    id="books"
                                    name="books"
                                    placeholder={t('profile_enter_fav_books', 'Enter your favourite books')}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>{t('profile_fav_games', 'Favourite Games:')}</label>
                                <textarea
                                    id="games"
                                    name="games"
                                    placeholder={t('profile_enter_fav_games', 'Enter your favourite games')}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                            <div className={styles.formItem}>
                                <label>{t('profile_hobbies', 'My Hobbies:')}</label>
                                <textarea
                                    id="hobbies"
                                    name="hobbies"
                                    placeholder={t('profile_enter_hobbies', 'Enter your hobbies')}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formRow} style={{justifyContent: 'flex-end'}}>
                            <button
                                className={styles.buttonSave}
                                style={{width: '15%', padding: '10px 20px'}}
                                onClick={isEditing ? handleSave : handleEdit}
                            >
                                {t('profile_save_all', 'Save all')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        {showPasswordModal && (<div className={styles.modal}>
            <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => setShowPasswordModal(false)}>
              &times;
            </span>
                <h2>{t('profile_change_password', 'Change Password')}</h2>
                <form className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.inputContainer}>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <label htmlFor="oldPassword">{t('profile_old_password', 'Old Password')}</label>
                            <span className={styles.notch}></span>
                        </div>
                    </div>
                    <div className={styles.formRow}>
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
                    <div className={styles.formRow}>
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
                    {error && <div className={styles.error}>{error}</div>}
                    <button className={styles.buttonSave} onClick={handleSavePassword}>
                        {t('profile_save_password', 'Save Password')}
                    </button>
                </form>
            </div>
        </div>)}
    </>);
}

export default Profile;