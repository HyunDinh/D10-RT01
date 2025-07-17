import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from '../../styles/NotificationPage.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faTrash} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState({from: '', to: ''});
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [notificationsPerPage] = useState(10);

    const { t } = useTranslation();

    // Fetch userId and role
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const profileRes = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
                setUserId(profileRes.data.id);
                const roleRes = await axios.get('http://localhost:8080/api/hocho/role', {withCredentials: true});
                const cleanRole = (roleRes.data?.role || '').replace('ROLE_', '');
                setRole(cleanRole);
            } catch {
                setUserId(null);
                setRole(null);
            }
        };
        fetchUser();
    }, []);

    // Fetch notifications
    useEffect(() => {
        if (!userId || !role) return;
        setLoading(true);
        let url = `http://localhost:8080/api/notifications?userId=${userId}&role=${role}`;
        if (filter === 'unread') url = `http://localhost:8080/api/notifications/unread?userId=${userId}&role=${role}`;
        axios
            .get(url, {withCredentials: true})
            .then((res) => {
                let data = res.data;
                if (dateRange.from && dateRange.to) {
                    const from = new Date(dateRange.from);
                    const to = new Date(dateRange.to);
                    data = data.filter((n) => {
                        const created = new Date(n.createdAt || n.timestamp || n.date || n.created_date);
                        return created >= from && created <= to;
                    });
                }
                data.sort((a, b) => {
                    if (a.read === b.read) {
                        return new Date(b.createdAt || b.timestamp || b.date || b.created_date) - new Date(a.createdAt || a.timestamp || a.date || a.created_date);
                    }
                    return a.read ? 1 : -1;
                });
                setNotifications(data);
                setLoading(false);
                setCurrentPage(1);
            })
            .catch((err) => {
                setError(t('notification_error_load'));
                setLoading(false);
            });
    }, [userId, role, filter, dateRange]);

    // Pagination
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
    const totalPages = Math.ceil(notifications.length / notificationsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteAll = () => {
        if (!window.confirm(t('notification_confirm_clear_all'))) return;
        axios
            .delete(`http://localhost:8080/api/notifications?userId=${userId}&role=${role}`, {withCredentials: true})
            .then(() => {
                setNotifications([]);
                setCurrentPage(1);
            })
            .catch(() => setError(t('notification_error_delete_all')));
    };

    const handleDeleteOne = (notificationId) => {
        if (!window.confirm(t('notification_confirm_clear_one'))) return;
        axios
            .delete(`http://localhost:8080/api/notifications/${notificationId}`, {withCredentials: true})
            .then(() => {
                const updatedNotifications = notifications.filter((n) => (n.notificationId || n.id) !== notificationId);
                setNotifications(updatedNotifications);
                const newTotalPages = Math.ceil(updatedNotifications.length / notificationsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
            })
            .catch(() => setError(t('notification_error_delete_one')));
    };

    const handleFilterChange = (e) => setFilter(e.target.value);
    const handleDateChange = (e) => setDateRange({...dateRange, [e.target.name]: e.target.value});

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

        return (<div className={styles.pagination}>
            <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={styles.pageButton}
                aria-label={t('pagination_first_page')}
            >
                « First
            </button>
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.pageButton}
                aria-label={t('pagination_previous_page')}
            >
                ‹ Previous
            </button>
            {startPage > 1 && (<>
                <button onClick={() => handlePageChange(1)} className={styles.pageButton} aria-label={t('pagination_page_1')}>
                    1
                </button>
                {startPage > 2 && <span className={styles.pageEllipsis}>...</span>}
            </>)}
            {pageNumbers.map((number) => (<button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ''}`}
                aria-label={t('pagination_page', {number})}
            >
                {number}
            </button>))}
            {endPage < totalPages && (<>
                {endPage < totalPages - 1 && <span className={styles.pageEllipsis}>...</span>}
                <button
                    onClick={() => handlePageChange(totalPages)}
                    className={styles.pageButton}
                    aria-label={t('pagination_last_page', {totalPages})}
                >
                    {totalPages}
                </button>
            </>)}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.pageButton}
                aria-label={t('pagination_next_page')}
            >
                Next ›
            </button>
            <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={styles.pageButton}
                aria-label={t('pagination_last_page', {totalPages})}
            >
                Last »
            </button>
        </div>);
    };

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('notification_title')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                    data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">{t('notification_home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('notification_title')}</li>
                </ul>
            </div>
        </section>
        <div className={styles.notificationPage}>
            <div className={styles.headerRow}>
                <h2 className={styles.pageTitle}>{t('notification_title')}</h2>
                <div className={styles.filters}>
                    <select value={filter} onChange={handleFilterChange} className={styles.filterSelect}
                            aria-label={t('notification_filter_aria')}>
                        <option value="all">{t('notification_filter_all')}</option>
                        <option value="unread">{t('notification_filter_unread')}</option>
                    </select>
                    <div className={styles.dateRange}>
                        <input
                            type="date"
                            name="from"
                            value={dateRange.from}
                            onChange={handleDateChange}
                            className={styles.dateInput}
                            aria-label={t('notification_date_from')}
                        />
                        <input
                            type="date"
                            name="to"
                            value={dateRange.to}
                            onChange={handleDateChange}
                            className={styles.dateInput}
                            aria-label={t('notification_date_to')}
                        />
                    </div>
                    <button
                        onClick={handleDeleteAll}
                        className={`${styles.btn} ${styles.btnDanger}`}
                        aria-label={t('notification_clear_all_aria')}
                    >
                        <FontAwesomeIcon icon={faTrash}/> {t('notification_clear_all')}
                    </button>
                </div>
            </div>
            {loading ? (<div className={styles.loading}>{t('notification_loading')}</div>) : error ? (
                <div className={styles.error}>{error}</div>) : (<>
                <div className={styles.notificationInfo}>
                    <p>
                        {t('notification_display', {from: indexOfFirstNotification + 1, to: Math.min(indexOfLastNotification, notifications.length), total: notifications.length})}
                    </p>
                </div>
                <ul className={styles.notificationList}>
                    {currentNotifications.length === 0 ? (<li className={styles.noNotifications}>{t('notification_empty')}</li>) : (currentNotifications.map((n) => (<li
                        key={n.notificationId || n.id}
                        className={`${styles.notificationItem} ${n.read ? styles.read : styles.unread}`}
                    >
                        <div>
                            <div className={styles.title}>{n.title || n.type || t('notification_item_default_title')}</div>
                            <div className={styles.content}>{n.content || n.message}</div>
                            <div className={styles.time}>
                                {new Date(n.createdAt || n.timestamp || n.date || n.created_date).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <button
                                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                onClick={() => handleDeleteOne(n.notificationId || n.id)}
                                aria-label={t('notification_clear_one_aria', {title: n.title || n.type || t('notification_item_default_title')})}
                            >
                                <FontAwesomeIcon icon={faTrash}/>
                            </button>
                        </div>
                    </li>)))}
                </ul>
                {renderPagination()}
            </>)}
        </div>
        <Footer/>
    </>);
};

export default NotificationPage;