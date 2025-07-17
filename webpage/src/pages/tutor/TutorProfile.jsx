import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/tutor/TutorProfile.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const TutorProfile = () => {
    const { t } = useTranslation();
    const { userId } = useParams();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTutor();
    }, [userId]);

    const fetchTutor = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/tutors/profile/${userId}`, {
                withCredentials: true,
            });
            setTutor(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('tutor_profile_error_load'));
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/hocho/tutors');
    };

    const getTutorAvatarUrl = () => {
        const baseUrl = 'http://localhost:8080';
        if (!tutor.user.avatarUrl || tutor.user.avatarUrl === 'none') {
            return `${baseUrl}/api/hocho/profile/default.png?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${tutor.user.avatarUrl}?t=${new Date().getTime()}`;
    };

    if (loading) return <div className={`${styles.loadingMessage} ${styles.fadeIn}`}>{t('tutor_profile_loading')}</div>;
    if (error) return <div className={`${styles.errorMessage} ${styles.fadeIn}`}>{error}</div>;
    if (!tutor) return null;

    return (
        <>
            <Header />
            <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={styles.headerInfo}>
                    <p>{t('tutor_profile_title')}</p>
                    <ul className={styles.breadcrumbItems} data-aos="fade-up" data-aos-duration="800" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">{t('tutor_breadcrumb_home')}</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>
                            <a href="/hocho/tutors">{t('tutor_breadcrumb_list')}</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>{t('tutor_profile_breadcrumb')}</li>
                    </ul>
                </div>
            </section>
            <div className={styles.tutorProfileContainer}>
                <div className={styles.backButtonContainer}>
                    <button
                        className={`${styles.backButton} ${styles.buttonHover}`}
                        onClick={handleBack}
                        title={t('tutor_profile_back_title')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> {t('tutor_profile_back_btn')}
                    </button>
                </div>
                <h2 className={`${styles.tutorTitle} ${styles.fadeIn}`}>{t('tutor_profile_heading')}</h2>
                <div className={`${styles.tutorCard} ${styles.cardHover} ${styles.animateSlideIn}`}>
                    <div className={styles.tutorCardAvatar}>
                        <img
                            src={getTutorAvatarUrl()}
                            alt={`${tutor.user.fullName}'s avatar`}
                            className={`${styles.avatarImage} ${styles.avatarZoom}`}
                            onError={e => { e.target.src = 'http://localhost:8080/api/hocho/profile/default.png'; }}
                        />
                    </div>
                    <div className={styles.tutorCardContent}>
                        <h4 className={styles.tutorCardTitle}>{tutor.user.fullName}</h4>
                        <p className={styles.tutorCardText}><b>{t('tutor_label_email')}</b> {tutor.user.email}</p>
                        <p className={styles.tutorCardText}><b>{t('tutor_label_phone')}</b> {tutor.user.phoneNumber}</p>
                        <p className={styles.tutorCardText}><b>{t('tutor_label_specialization')}</b> {tutor.specialization}</p>
                        <p className={styles.tutorCardText}><b>{t('tutor_label_experience')}</b> {tutor.experience} {t('tutor_label_years')}</p>
                        <p className={styles.tutorCardText}><b>{t('tutor_label_education')}</b> {tutor.education}</p>
                        <p className={styles.tutorCardText}><b>{t('tutor_label_introduction')}</b> {tutor.introduction}</p>
                        <p className={styles.tutorCardText}>
                            <b>{t('tutor_label_status')}</b>{' '}
                            {tutor.status === 'APPROVED' ? (
                                <span className={`${styles.tutorBadge} ${styles.approved} ${styles.badgePulse}`}>{t('tutor_status_approved')}</span>
                            ) : tutor.status === 'REJECTED' ? (
                                <span className={`${styles.tutorBadge} ${styles.rejected} ${styles.badgePulse}`}>{t('tutor_status_rejected')}</span>
                            ) : (
                                <span className={`${styles.tutorBadge} ${styles.pending} ${styles.badgePulse}`}>{t('tutor_status_pending')}</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TutorProfile;