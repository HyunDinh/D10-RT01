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
            })
            .catch(err => {
                setError('Không thể tải thông báo.');
                setLoading(false);
            });
    }, [userId, role, filter, dateRange]);

    // Xóa toàn bộ thông báo: (nếu backend chưa có API xóa all, có thể cần bổ sung)
    const handleDeleteAll = () => {
        if (!window.confirm('Bạn có chắc muốn xóa toàn bộ thông báo?')) return;
        axios.delete(`http://localhost:8080/api/notifications?userId=${userId}&role=${role}`, { withCredentials: true })
            .then(() => setNotifications([]))
            .catch(() => setError('Không thể xóa thông báo.'));
    };

    const handleDeleteOne = (notificationId) => {
        if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;
        axios.delete(`http://localhost:8080/api/notifications/${notificationId}`, { withCredentials: true })
            .then(() => setNotifications(notifications.filter(n => (n.notificationId || n.id) !== notificationId)))
            .catch(() => setError('Không thể xóa thông báo.'));
    };

    const handleFilterChange = (e) => setFilter(e.target.value);
    const handleDateChange = (e) => setDateRange({ ...dateRange, [e.target.name]: e.target.value });

    return (
        <div className={styles.notificationPage}>
            <h2>Thông báo của tôi</h2>
            <div className={styles.filterBar}>
                <label>
                    Lọc trạng thái:
                    <select value={filter} onChange={handleFilterChange}>
                        <option value="all">Tất cả</option>
                        <option value="unread">Chưa đọc</option>
                    </select>
                </label>
                <label>
                    Từ ngày:
                    <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} />
                </label>
                <label>
                    Đến ngày:
                    <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} />
                </label>
                <button onClick={handleDeleteAll} className={styles.deleteAllBtn}>Xóa toàn bộ</button>
            </div>
            {loading ? <div>Đang tải...</div> : error ? <div className={styles.error}>{error}</div> : (
                <ul className={styles.notificationList}>
                    {notifications.length === 0 ? <li>Không có thông báo nào.</li> : notifications.map(n => (
                        <li key={n.notificationId || n.id} className={n.read ? styles.read : styles.unread}>
                            <div className={styles.title}>{n.title || n.type || 'Thông báo'}</div>
                            <div className={styles.content}>{n.content || n.message}</div>
                            <div className={styles.time}>{new Date(n.createdAt || n.timestamp || n.date || n.created_date).toLocaleString()}</div>
                            <button className={styles.deleteOneBtn} onClick={() => handleDeleteOne(n.notificationId || n.id)}>Xóa</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationPage; 