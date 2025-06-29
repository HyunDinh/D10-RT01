import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/Feedback.module.css';

const FeedbackForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        category: '',
        priority: ''
    });
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchPriorities();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/feedback/categories', {
                withCredentials: true,
            });
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchPriorities = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/feedback/priorities', {
                withCredentials: true,
            });
            setPriorities(response.data);
        } catch (err) {
            console.error('Error fetching priorities:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:8080/api/feedback/submit', formData, {
                withCredentials: true,
            });
            
            setMessage('Feedback submitted successfully! You will be redirected to the feedback list shortly.');
            setFormData({
                subject: '',
                content: '',
                category: '',
                priority: ''
            });
            
            // Redirect to feedback list after 2 seconds
            setTimeout(() => {
                navigate('/hocho/feedback');
            }, 2000);
            
        } catch (err) {
            setError(err.response?.data || 'An error occurred while submitting your feedback. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
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
            'LOW': 'Low',
            'MEDIUM': 'Medium',
            'HIGH': 'High',
            'URGENT': 'Urgent'
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

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Send feedback</h1>
                        <p className={styles.subtitle}>
                            Please fill out the form below to share your thoughts, suggestions, or issues with us.
                        </p>
                    </div>

                    {message && (
                        <div className={styles.successMessage}>
                            <FontAwesomeIcon icon={faCheck} className={styles.successIcon} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorMessage}>
                            <FontAwesomeIcon icon={faTimes} className={styles.errorIcon} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="subject" className={styles.label}>
                                Title <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Enter your feedback subject..."
                                required
                                maxLength={200}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="category" className={styles.label}>
                                Category <span className={styles.required}>*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Choose a category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {getCategoryLabel(category)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="priority" className={styles.label}>
                                Priority <span className={styles.required}>*</span>
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Choose a priority</option>
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>
                                        {getPriorityLabel(priority)}
                                    </option>
                                ))}
                            </select>
                            {formData.priority && (
                                <div 
                                    className={styles.priorityIndicator}
                                    style={{ backgroundColor: getPriorityColor(formData.priority) }}
                                >
                                    {getPriorityLabel(formData.priority)}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="content" className={styles.label}>
                                Nội dung <span className={styles.required}>*</span>
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                className={styles.textarea}
                                placeholder="Describe your feedback content..."
                                required
                                rows={8}
                                maxLength={2000}
                            />
                            <div className={styles.charCount}>
                                {formData.content.length}/2000 ký tự
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                onClick={() => navigate('/hocho/feedback')}
                                className={styles.cancelButton}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPaperPlane} className={styles.submitIcon} />
                                        Send feedback
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default FeedbackForm; 