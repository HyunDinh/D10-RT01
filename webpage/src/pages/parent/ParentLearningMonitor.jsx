import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/ParentDashboard.module.css';

const ParentLearningMonitor = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            // Lấy parentId từ API profile
            const userResponse = await axios.get('/api/hocho/profile', { withCredentials: true });
            const parentId = userResponse.data.id;
            // Gọi API lấy danh sách con theo parentId
            const response = await axios.get(`/api/parent/children/${parentId}`);
            setChildren(response.data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách con');
            console.error('Error fetching children:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy avatar giống QuestionList.jsx
    const getChildAvatarUrl = (child) => {
        const baseUrl = 'http://localhost:8080';
        if (!child.avatarUrl || child.avatarUrl === 'none') {
            return `${baseUrl}/api/hocho/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${child.avatarUrl}?t=${new Date().getTime()}`;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Lỗi</h2>
                <p>{error}</p>
                <button onClick={fetchChildren} className={styles.retryButton}>
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Theo dõi tiến độ học tập của con</h1>
                <p>Chọn con để xem tiến độ học tập chi tiết</p>
            </div>

            <div className={styles.content}>
                <div className={styles.section}>
                    <h2>Danh sách con</h2>
                    {children.length > 0 ? (
                        <div className={styles.childrenGrid}>
                            {children.map((child) => (
                                <div key={child.id} className={styles.childCard}>
                                    <div className={styles.childAvatar}>
                                        <img 
                                            src={getChildAvatarUrl(child)}
                                            alt={child.fullName}
                                            onError={e => (e.target.src = 'http://localhost:8080/api/hocho/profile/default.png')}
                                        />
                                    </div>
                                    <div className={styles.childInfo}>
                                        <h3>{child.fullName}</h3>
                                        <p>{child.email}</p>
                                        <div className={styles.childStats}>
                                            <span>{child.age ? `${child.age} tuổi` : ''}</span>
                                            <span>{child.grade ? `${child.grade} lớp` : ''}</span>
                                        </div>
                                    </div>
                                    <div className={styles.childActions}>
                                        <Link 
                                            to={`/hocho/parent/learning-progress/${child.id}`}
                                            className={styles.progressButton}
                                        >
                                            Xem tiến độ học tập
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noChildren}>
                            <p>Bạn chưa có con nào được đăng ký.</p>
                            <Link to="/hocho/register-child" className={styles.addChildButton}>
                                Đăng ký con
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentLearningMonitor; 