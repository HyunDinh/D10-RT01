import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/NotificationPage.module.css';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [notificationsPerPage] = useState(10);

    // Lấy userId và role
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const profileRes = await axios.get('http://localhost:8080/api/hocho/profile', { withCredentials: true });
                setUserId(profileRes.data.id);
                const roleRes = await axios.get('http://localhost:8080/api/hocho/role', { withCredentials: true });
                // Loại bỏ tiền tố ROLE_ nếu có
                const cleanRole = (roleRes.data?.role || '').replace('ROLE_', '');
                setRole(cleanRole);
            } catch {
                setUserId(null);
                setRole(null);
            }
        };
        fetchUser();
    }, []);

    // Lấy thông báo theo userId và role
    useEffect(() => {
        if (!userId || !role) return;
        setLoading(true);
        let url = `http://localhost:8080/api/notifications?userId=${userId}&role=${role}`;
        if (filter === 'unread') url = `http://localhost:8080/api/notifications/unread?userId=${userId}&role=${role}`;
        axios.get(url, { withCredentials: true })
            .then(res => {
                let data = res.data;
                // Lọc theo thời gian nếu có
                if (dateRange.from && dateRange.to) {
                    const from = new Date(dateRange.from);
                    const to = new Date(dateRange.to);
                    data = data.filter(n => {
                        const created = new Date(n.createdAt || n.timestamp || n.date || n.created_date);
                        return created >= from && created <= to;
                    });
                }
                // Sắp xếp: chưa đọc lên đầu, sau đó mới nhất lên đầu
                data.sort((a, b) => {
                    if (a.read === b.read) {
                        return new Date(b.createdAt || b.timestamp || b.date || b.created_date) - new Date(a.createdAt || a.timestamp || a.date || a.created_date);
                    }
                    return a.read ? 1 : -1;
                });
                setNotifications(data);
                setLoading(false);
                // Reset về trang đầu tiên khi có thay đổi filter hoặc dateRange
                setCurrentPage(1);
            })
            .catch(err => {
                setError('Cannot load notifications.');
                setLoading(false);
            });
    }, [userId, role, filter, dateRange]);

    // Tính toán pagination
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
    const totalPages = Math.ceil(notifications.length / notificationsPerPage);

    // Xử lý thay đổi trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Xóa toàn bộ thông báo: (nếu backend chưa có API xóa all, có thể cần bổ sung)
    const handleDeleteAll = () => {
        if (!window.confirm('Do you want to clear all notifications?')) return;
        axios.delete(`http://localhost:8080/api/notifications?userId=${userId}&role=${role}`, { withCredentials: true })
            .then(() => {
                setNotifications([]);
                setCurrentPage(1);
            })
            .catch(() => setError('Cannot delete notifications.'));
    };

    const handleDeleteOne = (notificationId) => {
        if (!window.confirm('Are you sure you want to clear this notification?')) return;
        axios.delete(`http://localhost:8080/api/notifications/${notificationId}`, { withCredentials: true })
            .then(() => {
                const updatedNotifications = notifications.filter(n => (n.notificationId || n.id) !== notificationId);
                setNotifications(updatedNotifications);
                // Nếu trang hiện tại không còn thông báo nào và không phải trang đầu tiên, chuyển về trang trước
                const newTotalPages = Math.ceil(updatedNotifications.length / notificationsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
            })
            .catch(() => setError('Không thể xóa thông báo.'));
    };

    const handleFilterChange = (e) => setFilter(e.target.value);
    const handleDateChange = (e) => setDateRange({ ...dateRange, [e.target.name]: e.target.value });

    // Render pagination controls
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className={styles.pagination}>
                <button 
                    onClick={() => handlePageChange(1)} 
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                >
                    &laquo; Đầu
                </button>
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                >
                    &lsaquo; Trước
                </button>
                
                {startPage > 1 && (
                    <>
                        <button 
                            onClick={() => handlePageChange(1)} 
                            className={styles.pageButton}
                        >
                            1
                        </button>
                        {startPage > 2 && <span className={styles.pageEllipsis}>...</span>}
                    </>
                )}

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ''}`}
                    >
                        {number}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className={styles.pageEllipsis}>...</span>}
                        <button 
                            onClick={() => handlePageChange(totalPages)} 
                            className={styles.pageButton}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                >
                    Sau &rsaquo;
                </button>
                <button 
                    onClick={() => handlePageChange(totalPages)} 
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                >
                    Cuối &raquo;
                </button>
            </div>
        );
    };

    return (
        <div className={styles.notificationPage}>
            <div className={styles.headerRow}>
                <h2>Notifications</h2>
                <button onClick={handleDeleteAll} className={styles.deleteAllBtn}>Clear all</button>
            </div>
            
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : (
                <>
                    <div className={styles.notificationInfo}>
                        <p>Display {indexOfFirstNotification + 1}-{Math.min(indexOfLastNotification, notifications.length)} out of {notifications.length} notifications</p>
                    </div>
                    
                    <ul className={styles.notificationList}>
                        {currentNotifications.length === 0 ? (
                            <li>No notifications.</li>
                        ) : (
                            currentNotifications.map(n => (
                                <li key={n.notificationId || n.id} className={n.read ? styles.read : styles.unread}>
                                    <div className={styles.title}>{n.title || n.type || 'Notifications'}</div>
                                    <div className={styles.content}>{n.content || n.message}</div>
                                    <div className={styles.time}>{new Date(n.createdAt || n.timestamp || n.date || n.created_date).toLocaleString()}</div>
                                    <button className={styles.deleteOneBtn} onClick={() => handleDeleteOne(n.notificationId || n.id)}>Clear</button>
                                </li>
                            ))
                        )}
                    </ul>
                    
                    {renderPagination()}
                </>
            )}
        </div>
    );
};

export default NotificationPage; 