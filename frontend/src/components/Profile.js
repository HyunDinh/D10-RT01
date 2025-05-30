
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

    useEffect(() => {
        fetchProfileData();
    }, [navigate, refreshKey]);

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
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
        axios.put('http://localhost:8080/api/hocho/profile', {
            fullName: editedFullName,
            dateOfBirth: editedDateOfBirth
        }, { withCredentials: true })
            .then(response => {
                setUser(response.data);
                setIsEditing(false);
                setError('');
            })
            .catch(err => {
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

        axios.put('http://localhost:8080/api/hocho/profile/password', {
            oldPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        }, { withCredentials: true })
            .then(response => {
                setShowPasswordModal(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError('Cập nhật mật khẩu thành công!');
            })
            .catch(err => {
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
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                console.log('Upload response:', response.data);
                setRefreshKey(prevKey => prevKey + 1);
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

    return (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' }}>
            <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '30px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '20px', textAlign: 'center' }}>User Profile</h1>
                {error && <div style={{ color: '#dc3545', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

                {/* Avatar Section */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img
                        src={getAvatarUrl()}
                        alt="User Avatar"
                        style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e9ecef' }}
                        onError={(e) => { e.target.src = 'http://localhost:8080/profile/default.png?t=' + new Date().getTime(); }}
                    />
                </div>

                {/* User Info Section */}
                <div style={{ textAlign: 'left', padding: '0 20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Username:</span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>{user.username || 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Email:</span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>{user.email || 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Phone Number:</span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>{user.phoneNumber || 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Full Name:</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedFullName}
                                onChange={(e) => setEditedFullName(e.target.value)}
                                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ced4da', borderRadius: '4px', width: '200px' }}
                            />
                        ) : (
                            <span style={{ marginLeft: '10px', color: '#666' }}>{user.fullName || 'N/A'}</span>
                        )}
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Date of Birth:</span>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editedDateOfBirth}
                                onChange={(e) => setEditedDateOfBirth(e.target.value)}
                                style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ced4da', borderRadius: '4px', width: '200px' }}
                            />
                        ) : (
                            <span style={{ marginLeft: '10px', color: '#666' }}>{user.dateOfBirth ? user.dateOfBirth.split('T')[0] : 'N/A'}</span>
                        )}
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Role:</span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>{user.role || 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Is Active:</span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>{user.isActive ? 'Yes' : 'No'}</span>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Created At:</span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Updated At:</span>
                        <span style={{ marginLeft: '10px', color: '#666' }}>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    {!isEditing ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleEdit}
                            style={{ marginRight: '15px', padding: '8px 20px', fontSize: '16px', transition: 'all 0.3s' }}
                            onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
                            onMouseOut={(e) => (e.target.style.backgroundColor = '')}
                        >
                            Edit
                        </button>
                    ) : (
                        <button
                            className="btn btn-success"
                            onClick={handleSave}
                            style={{ marginRight: '15px', padding: '8px 20px', fontSize: '16px', transition: 'all 0.3s' }}
                            onMouseOver={(e) => (e.target.style.backgroundColor = '#218838')}
                            onMouseOut={(e) => (e.target.style.backgroundColor = '')}
                        >
                            Save
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={handleUpdatePassword}
                        style={{ marginRight: '15px', padding: '8px 20px', fontSize: '16px', transition: 'all 0.3s' }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#6c757d')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '')}
                    >
                        Update Password
                    </button>
                    <button
                        className="btn btn-info"
                        onClick={() => fileInputRef.current.click()}
                        style={{ padding: '8px 20px', fontSize: '16px', transition: 'all 0.3s' }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#17a2b8')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '')}
                    >
                        Update Profile Picture
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/png, image/jpeg"
                    />
                </div>

                {/* Password Modal */}
                {showPasswordModal && (
                    <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center', width: '300px' }}>
                            <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '15px' }}>Update Password</h3>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Enter old password"
                                style={{ width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #ced4da', borderRadius: '4px' }}
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                style={{ width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #ced4da', borderRadius: '4px' }}
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                style={{ width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #ced4da', borderRadius: '4px' }}
                            />
                            <div>
                                <button
                                    className="btn btn-success"
                                    onClick={handleSavePassword}
                                    style={{ marginRight: '10px', padding: '8px 20px', fontSize: '16px' }}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setOldPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setError('');
                                    }}
                                    style={{ padding: '8px 20px', fontSize: '16px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;