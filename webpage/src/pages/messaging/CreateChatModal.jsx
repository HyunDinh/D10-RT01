import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/Messaging.module.css';

const CreateChatModal = ({ isOpen, onClose, onChatCreated, chatSessions, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Lấy danh sách userId đã chat (ngoại trừ chính mình)
    const chattedUserIds = chatSessions
        ? chatSessions.map(session => {
            // session.user1 và session.user2 là object user
            if (!currentUser) return null;
            return session.user1.id === currentUser.id ? session.user2.id : session.user1.id;
        }).filter(Boolean)
        : [];

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        // Lọc users: chỉ lấy user chưa từng chat và không phải chính mình
        const availableUsers = users.filter(user =>
            user.id !== currentUser?.id && !chattedUserIds.includes(user.id)
        );
        // Filter users based on search term
        if (searchTerm.trim() === '') {
            setFilteredUsers(availableUsers);
        } else {
            const filtered = availableUsers.filter(user => 
                (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
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
            setError('Cannot load user list');
        }
    };

    const createChatSession = async () => {
        if (!selectedUserId) {
            setError('Please select a user');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/messages/sessions', null, {
                params: {
                    user1Id: selectedUserId
                },
                withCredentials: true
            });

            onChatCreated(response.data);
            onClose();
        } catch (error) {
            console.error('Error creating chat session:', error);
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                setError('Cannot create chat session. A session with this user may already exist.');
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

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Create new chat session</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>
                
                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    
                    <div className={styles.formGroup}>
                        <label>Search user:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Enter name, username or email..."
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Select user:</label>
                        <div className={styles.userList}>
                            {filteredUsers.length === 0 ? (
                                <div className={styles.noUsers}>
                                    {searchTerm ? 'No users found' : 'No users available'}
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`${styles.userItem} ${
                                            selectedUserId === user.id ? styles.selected : ''
                                        }`}
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
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button 
                        className={styles.cancelButton} 
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        className={styles.createButton} 
                        onClick={createChatSession}
                        disabled={loading || !selectedUserId}
                    >
                        {loading ? 'Creating...' : 'Create chat session'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateChatModal; 