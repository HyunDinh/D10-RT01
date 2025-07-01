import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faReply, 
    faClock, 
    faSpinner, 
    faCheckCircle, 
    faTimesCircle,
    faExclamationTriangle,
    faInfoCircle,
    faFilter,
    faChartBar
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/AdminFeedback.module.css';

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({});
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [responseData, setResponseData] = useState({
        response: '',
        status: 'IN_PROGRESS'
    });

    useEffect(() => {
        fetchFeedbacks();
        fetchStats();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/admin/feedbacks', {
                withCredentials: true,
            });
            setFeedbacks(response.data);
        } catch (err) {
            setError('Có lỗi xảy ra khi tải danh sách phản hồi.');
            console.error('Error fetching feedbacks:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/feedbacks/stats', {
                withCredentials: true,
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchFeedbacksByStatus = async (status) => {
        try {
            setLoading(true);
            if (status === 'ALL') {
                await fetchFeedbacks();
            } else {
                const response = await axios.get(`http://localhost:8080/api/admin/feedbacks/status/${status}`, {
                    withCredentials: true,
                });
                setFeedbacks(response.data);
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tải danh sách phản hồi.');
            console.error('Error fetching feedbacks by status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedFeedback(null);
        setResponseData({ response: '', status: 'IN_PROGRESS' });
    };

    const handleResponseChange = (e) => {
        const { name, value } = e.target;
        setResponseData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRespondToFeedback = async () => {
        if (!responseData.response.trim()) {
            alert('Vui lòng nhập phản hồi');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/admin/feedbacks/${selectedFeedback.feedbackId}/respond`,
                responseData,
                { withCredentials: true }
            );
            
            // Update the feedback in the list
            setFeedbacks(prev => prev.map(f => 
                f.feedbackId === selectedFeedback.feedbackId ? response.data : f
            ));
            
            closeModal();
            fetchStats(); // Refresh stats
            alert('Phản hồi đã được gửi thành công!');
        } catch (err) {
            alert(err.response?.data || 'Có lỗi xảy ra khi gửi phản hồi.');
        }
    };

    const handleStatusChange = async (feedbackId, newStatus) => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/admin/feedbacks/${feedbackId}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            
            // Update the feedback in the list
            setFeedbacks(prev => prev.map(f => 
                f.feedbackId === feedbackId ? response.data : f
            ));
            
            fetchStats(); // Refresh stats
        } catch (err) {
            alert(err.response?.data || 'Có lỗi xảy ra khi cập nhật trạng thái.');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <FontAwesomeIcon icon={faClock} className={styles.statusIconPending} />;
            case 'IN_PROGRESS':
                return <FontAwesomeIcon icon={faSpinner} className={styles.statusIconInProgress} />;
            case 'RESOLVED':
                return <FontAwesomeIcon icon={faCheckCircle} className={styles.statusIconResolved} />;
            case 'CLOSED':
                return <FontAwesomeIcon icon={faTimesCircle} className={styles.statusIconClosed} />;
            case 'REJECTED':
                return <FontAwesomeIcon icon={faExclamationTriangle} className={styles.statusIconRejected} />;
            default:
                return <FontAwesomeIcon icon={faInfoCircle} className={styles.statusIconDefault} />;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': 'Chờ xử lý',
            'IN_PROGRESS': 'Đang xử lý',
            'RESOLVED': 'Đã giải quyết',
            'CLOSED': 'Đã đóng',
            'REJECTED': 'Đã từ chối',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#ffc107',
            'IN_PROGRESS': '#17a2b8',
            'RESOLVED': '#28a745',
            'CLOSED': '#6c757d',
            'REJECTED': '#dc3545',
        };
        return colors[status] || '#6c757d';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'BUG_REPORT': 'Báo lỗi',
            'FEATURE_REQUEST': 'Yêu cầu tính năng',
            'GENERAL': 'Phản hồi chung',
            'TECHNICAL_SUPPORT': 'Hỗ trợ kỹ thuật'
        };
        return labels[category] || category;
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            'LOW': 'Thấp',
            'MEDIUM': 'Trung bình',
            'HIGH': 'Cao',
            'URGENT': 'Khẩn cấp'
        };
        return labels[priority] || priority;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': '#28a745',
            'MEDIUM': '#ffc107',
            'HIGH': '#fd7e14',
            'URGENT': '#dc3545'
        };
        return colors[priority] || '#6c757d';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (filterStatus === 'ALL') return true;
        return feedback.status === filterStatus;
    });

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải danh sách phản hồi...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Quản lý phản hồi</h1>
                    </div>

                    {/* Statistics */}
                    <div className={styles.statsContainer}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <FontAwesomeIcon icon={faChartBar} />
                            </div>
                            <div className={styles.statContent}>
                                <h3>{stats.total || 0}</h3>
                                <p>Tổng số phản hồi</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ color: '#ffc107' }}>
                                <FontAwesomeIcon icon={faClock} />
                            </div>
                            <div className={styles.statContent}>
                                <h3>{stats.pending || 0}</h3>
                                <p>Chờ xử lý</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ color: '#17a2b8' }}>
                                <FontAwesomeIcon icon={faSpinner} />
                            </div>
                            <div className={styles.statContent}>
                                <h3>{stats.inProgress || 0}</h3>
                                <p>Đang xử lý</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ color: '#28a745' }}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <div className={styles.statContent}>
                                <h3>{stats.resolved || 0}</h3>
                                <p>Đã giải quyết</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className={styles.filterContainer}>
                        <div className={styles.filterGroup}>
                            <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    fetchFeedbacksByStatus(e.target.value);
                                }}
                                className={styles.filterSelect}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="IN_PROGRESS">Đang xử lý</option>
                                <option value="RESOLVED">Đã giải quyết</option>
                                <option value="CLOSED">Đã đóng</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
                            {error}
                        </div>
                    )}

                    {filteredFeedbacks.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </div>
                            <h3>Không có phản hồi nào</h3>
                            <p>Không có phản hồi nào với trạng thái đã chọn.</p>
                        </div>
                    ) : (
                        <div className={styles.feedbackList}>
                            {filteredFeedbacks.map(feedback => (
                                <div key={feedback.feedbackId} className={styles.feedbackCard}>
                                    <div className={styles.feedbackHeader}>
                                        <div className={styles.feedbackTitle}>
                                            <h3>{feedback.subject}</h3>
                                            <div className={styles.feedbackMeta}>
                                                <span className={styles.userInfo}>
                                                    <strong>Người gửi:</strong> {feedback.user?.fullName || feedback.user?.username}
                                                </span>
                                                <span className={styles.feedbackDate}>
                                                    {formatDate(feedback.createdAt)}
                                                </span>
                                                <span 
                                                    className={styles.priorityBadge}
                                                    style={{ backgroundColor: getPriorityColor(feedback.priority) }}
                                                >
                                                    {getPriorityLabel(feedback.priority)}
                                                </span>
                                                <span className={styles.categoryBadge}>
                                                    {getCategoryLabel(feedback.category)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.feedbackStatus}>
                                            {getStatusIcon(feedback.status)}
                                            <span 
                                                className={styles.statusLabel}
                                                style={{ color: getStatusColor(feedback.status) }}
                                            >
                                                {getStatusLabel(feedback.status)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.feedbackContent}>
                                        <p className={styles.feedbackPreview}>
                                            {feedback.content.length > 150 
                                                ? `${feedback.content.substring(0, 150)}...` 
                                                : feedback.content
                                            }
                                        </p>
                                    </div>

                                    {feedback.adminResponse && (
                                        <div className={styles.adminResponse}>
                                            <h4>Phản hồi của admin:</h4>
                                            <p>{feedback.adminResponse}</p>
                                            {feedback.responseDate && (
                                                <small className={styles.responseDate}>
                                                    Phản hồi lúc: {formatDate(feedback.responseDate)}
                                                </small>
                                            )}
                                        </div>
                                    )}

                                    <div className={styles.feedbackActions}>
                                        <button
                                            onClick={() => handleViewFeedback(feedback)}
                                            className={styles.viewButton}
                                        >
                                            <FontAwesomeIcon icon={faEye} className={styles.viewIcon} />
                                            Xem chi tiết
                                        </button>
                                        {feedback.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleStatusChange(feedback.feedbackId, 'IN_PROGRESS')}
                                                className={styles.actionButton}
                                                style={{ backgroundColor: '#17a2b8' }}
                                            >
                                                <FontAwesomeIcon icon={faSpinner} />
                                                Bắt đầu xử lý
                                            </button>
                                        )}
                                        {feedback.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => handleStatusChange(feedback.feedbackId, 'RESOLVED')}
                                                className={styles.actionButton}
                                                style={{ backgroundColor: '#28a745' }}
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                Đánh dấu đã giải quyết
                                            </button>
                                        )}
                                        {feedback.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => handleStatusChange(feedback.feedbackId, 'CLOSED')}
                                                className={styles.actionButton}
                                                style={{ backgroundColor: '#6c757d' }}
                                            >
                                                <FontAwesomeIcon icon={faTimesCircle} />
                                                Đóng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Feedback Detail Modal */}
            {showModal && selectedFeedback && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedFeedback.subject}</h2>
                            <button onClick={closeModal} className={styles.closeButton}>
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <div className={styles.modalMeta}>
                                <div className={styles.metaItem}>
                                    <strong>Người gửi:</strong> {selectedFeedback.user?.fullName || selectedFeedback.user?.username}
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Email:</strong> {selectedFeedback.user?.email}
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Danh mục:</strong> {getCategoryLabel(selectedFeedback.category)}
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Mức độ ưu tiên:</strong> 
                                    <span 
                                        className={styles.priorityBadge}
                                        style={{ backgroundColor: getPriorityColor(selectedFeedback.priority) }}
                                    >
                                        {getPriorityLabel(selectedFeedback.priority)}
                                    </span>
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Trạng thái:</strong>
                                    <span 
                                        className={styles.statusLabel}
                                        style={{ color: getStatusColor(selectedFeedback.status) }}
                                    >
                                        {getStatusIcon(selectedFeedback.status)}
                                        {getStatusLabel(selectedFeedback.status)}
                                    </span>
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Ngày gửi:</strong> {formatDate(selectedFeedback.createdAt)}
                                </div>
                            </div>

                            <div className={styles.modalContent}>
                                <h4>Nội dung phản hồi:</h4>
                                <p>{selectedFeedback.content}</p>
                            </div>

                            {selectedFeedback.adminResponse && (
                                <div className={styles.modalResponse}>
                                    <h4>Phản hồi của admin:</h4>
                                    <p>{selectedFeedback.adminResponse}</p>
                                    {selectedFeedback.responseDate && (
                                        <small className={styles.responseDate}>
                                            Phản hồi lúc: {formatDate(selectedFeedback.responseDate)}
                                        </small>
                                    )}
                                </div>
                            )}

                            {/* Response Form */}
                            <div className={styles.responseForm}>
                                <h4>Phản hồi:</h4>
                                <textarea
                                    name="response"
                                    value={responseData.response}
                                    onChange={handleResponseChange}
                                    className={styles.responseTextarea}
                                    placeholder="Nhập phản hồi của bạn..."
                                    rows={4}
                                />
                                <div className={styles.responseActions}>
                                    <select
                                        name="status"
                                        value={responseData.status}
                                        onChange={handleResponseChange}
                                        className={styles.statusSelect}
                                    >
                                        <option value="IN_PROGRESS">Đang xử lý</option>
                                        <option value="RESOLVED">Đã giải quyết</option>
                                        <option value="CLOSED">Đã đóng</option>
                                        <option value="REJECTED">Đã từ chối</option>
                                    </select>
                                    <button
                                        onClick={handleRespondToFeedback}
                                        className={styles.respondButton}
                                    >
                                        <FontAwesomeIcon icon={faReply} />
                                        Gửi phản hồi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default AdminFeedback; 