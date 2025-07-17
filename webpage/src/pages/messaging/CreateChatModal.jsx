import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from '../../styles/Messaging.module.css';
import {useTranslation} from 'react-i18next';

const CreateChatModal = ({isOpen, onClose, onChatCreated, chatSessions, currentUser}) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const {t} = useTranslation();

    // Lấy danh sách userId đã chat (ngoại trừ chính mình)
    const chattedUserIds = chatSessions ? chatSessions.map(session => {
        // session.user1 và session.user2 là object user
        if (!currentUser) return null;
        return session.user1.id === currentUser.id ? session.user2.id : session.user1.id;
    }).filter(Boolean) : [];

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        // Lọc users: chỉ lấy user chưa từng chat và không phải chính mình
        const availableUsers = users.filter(user => user.id !== currentUser?.id && !chattedUserIds.includes(user.id));
        // Filter users based on search term
        if (searchTerm.trim() === '') {
            setFilteredUsers(availableUsers);
        } else {
            const filtered = availableUsers.filter(user => (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || user.username.toLowerCase().includes(searchTerm.toLowerCase()) || (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())));
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users, chatSessions, currentUser]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/users', {
                withCredentials: true
            });
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(t('chat_error_load_users'));
        }
    };

    const createChatSession = async () => {
        if (!selectedUserId) {
            setError(t('chat_error_select_user'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/messages/sessions', null, {
                params: {
                    user1Id: selectedUserId
                }, withCredentials: true
            });

            onChatCreated(response.data);
            onClose();
        } catch (error) {
            console.error('Error creating chat session:', error);
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError(t('chat_error_create_session'));
            }
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = (user) => {
        if (user.avatarUrl && user.avatarUrl !== 'none') {
            return `http://localhost:8080/api/hocho/profile/${user.avatarUrl}`;
        }
        return `http://localhost:8080/api/hocho/profile/default.png`;
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedUserId(''); // Reset selection when searching
    };

    if (!isOpen) return null;

    return (<div className={`${styles.modalOverlay} ${styles.show}`}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>{t('chat_create_title')}</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.formGroup}>
                        <label>{t('chat_search_user')}</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder={t('chat_search_placeholder')}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('chat_select_user')}</label>
                        <div className={styles.userList}>
                            {filteredUsers.length === 0 ? (<div className={styles.noUsers}>
                                    {searchTerm ? t('chat_no_users_found') : t('chat_no_users_available')}
                                </div>) : (filteredUsers.map((user) => (<div
                                        key={user.id}
                                        className={`${styles.userItem} ${selectedUserId === user.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedUserId(user.id)}
                                    >
                                        <img
                                            src={getAvatarUrl(user)}
                                            alt="Avatar"
                                            className={styles.userAvatar}
                                            onError={(e) => {
                                                e.target.src = 'http://localhost:8080/api/hocho/profile/default.png';
                                            }}
                                        />
                                        <div className={styles.userInfo}>
                                            <div className={styles.modalUserName}>
                                                {user.fullName || user.username}
                                            </div>
                                            <div className={styles.userSub}>
                                                @{user.username} • {user.role}
                                            </div>
                                        </div>
                                    </div>)))}
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={loading}
                    >
                        {t('chat_cancel')}
                    </button>
                    <button
                        className={styles.createButton}
                        onClick={createChatSession}
                        disabled={loading || !selectedUserId}
                    >
                        {loading ? t('chat_creating') : t('chat_create_btn')}
                    </button>
                </div>
            </div>
        </div>);
};

export default CreateChatModal; 