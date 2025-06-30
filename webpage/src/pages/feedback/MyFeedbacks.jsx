import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEye, 
    faClock, 
    faSpinner, 
    faCheckCircle, 
    faTimesCircle,
    faExclamationTriangle,
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/Feedback.module.css';

const MyFeedbacks = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/feedback/my-feedbacks', {
                withCredentials: true,
            });
            setFeedbacks(response.data);
        } catch (err) {
            setError('Could not fetch feedbacks. Please try again later.');
            console.error('Error fetching feedbacks:', err);
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
            default:
                return <FontAwesomeIcon icon={faInfoCircle} className={styles.statusIconDefault} />;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': 'Pending',
            'IN_PROGRESS': 'In progres',
            'RESOLVED': 'Resolved',
            'CLOSED': 'Closed'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': '#ffc107',
            'IN_PROGRESS': '#17a2b8',
            'RESOLVED': '#28a745',
            'CLOSED': '#6c757d'
        };
        return colors[status] || '#6c757d';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'BUG_REPORT': 'Bug report',
            'FEATURE_REQUEST': 'Feature request',
            'GENERAL': 'General',
            'TECHNICAL_SUPPORT': 'Technical support',
        };
        return labels[category] || category;
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            'LOW': 'LOW',
            'MEDIUM': 'MEDIUM',
            'HIGH': 'HIGH',
            'URGENT': 'URGENT'
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

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading feedback list...</p>
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
                        <h1 className={styles.title}>My Feedbacks</h1>
                        <button
                            onClick={() => navigate('/hocho/feedback/submit')}
                            className={styles.newFeedbackButton}
                        >
                            <FontAwesomeIcon icon={faPlus} className={styles.plusIcon} />
                            Send new feedback
                        </button>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
                            {error}
                        </div>
                    )}

                    {feedbacks.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </div>
                            <h3>No feedbacks available</h3>
                            <p>You have not submitted any comments yet. Start by submitting your first one!</p>
                            <button
                                onClick={() => navigate('/hocho/feedback/submit')}
                                className={styles.emptyStateButton}
                            >
                                <FontAwesomeIcon icon={faPlus} className={styles.plusIcon} />
                                Send your first feedback
                            </button>
                        </div>
                    ) : (
                        <div className={styles.feedbackList}>
                            {feedbacks.map(feedback => (
                                <div key={feedback.feedbackId} className={styles.feedbackCard}>
                                    <div className={styles.feedbackHeader}>
                                        <div className={styles.feedbackTitle}>
                                            <h3>{feedback.subject}</h3>
                                            <div className={styles.feedbackMeta}>
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
                                            <h4>Admin's response:</h4>
                                            <p>{feedback.adminResponse}</p>
                                            {feedback.responseDate && (
                                                <small className={styles.responseDate}>
                                                    Reply time: {formatDate(feedback.responseDate)}
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
                                            View details
                                        </button>
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
                                    <strong>Category:</strong> {getCategoryLabel(selectedFeedback.category)}
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Priority:</strong>
                                    <span 
                                        className={styles.priorityBadge}
                                        style={{ backgroundColor: getPriorityColor(selectedFeedback.priority) }}
                                    >
                                        {getPriorityLabel(selectedFeedback.priority)}
                                    </span>
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Status:</strong>
                                    <span 
                                        className={styles.statusLabel}
                                        style={{ color: getStatusColor(selectedFeedback.status) }}
                                    >
                                        {getStatusIcon(selectedFeedback.status)}
                                        {getStatusLabel(selectedFeedback.status)}
                                    </span>
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Send date:</strong> {formatDate(selectedFeedback.createdAt)}
                                </div>
                            </div>

                            <div className={styles.modalContent}>
                                <h4>Content:</h4>
                                <p>{selectedFeedback.content}</p>
                            </div>

                            {selectedFeedback.adminResponse && (
                                <div className={styles.modalResponse}>
                                    <h4>Admin's response:</h4>
                                    <p>{selectedFeedback.adminResponse}</p>
                                    {selectedFeedback.responseDate && (
                                        <small className={styles.responseDate}>
                                            Responded time: {formatDate(selectedFeedback.responseDate)}
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default MyFeedbacks; 