import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/tutor/TutorProfile.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const TutorProfile = () => {
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
            setError('Cannot load tutor information');
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/hocho/tutors');
    };

    if (loading) return <div className={`${styles.loadingMessage} ${styles.fadeIn}`}>Loading tutor information...</div>;
    if (error) return <div className={`${styles.errorMessage} ${styles.fadeIn}`}>{error}</div>;
    if (!tutor) return null;

    return (
        <>
            <Header />
            <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={styles.headerInfo}>
                    <p>Tutor Profile</p>
                    <ul className={styles.breadcrumbItems} data-aos="fade-up" data-aos-duration="800" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>
                            <a href="/hocho/tutors">Tutors</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>Profile</li>
                    </ul>
                </div>
            </section>
            <div className={styles.tutorProfileContainer}>
                <div className={styles.backButtonContainer}>
                    <button
                        className={`${styles.backButton} ${styles.buttonHover}`}
                        onClick={handleBack}
                        title="Back to Tutors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>
                </div>
                <h2 className={`${styles.tutorTitle} ${styles.fadeIn}`}>Tutor Information</h2>
                <div className={`${styles.tutorCard} ${styles.cardHover} ${styles.animateSlideIn}`}>
                    <div className={styles.tutorCardAvatar}>
                        <img
                            src={tutor.user.avatarUrl || '/avatar.png'}
                            alt={`${tutor.user.fullName}'s avatar`}
                            className={`${styles.avatarImage} ${styles.avatarZoom}`}
                        />
                    </div>
                    <div className={styles.tutorCardContent}>
                        <h4 className={styles.tutorCardTitle}>{tutor.user.fullName}</h4>
                        <p className={styles.tutorCardText}><b>Email:</b> {tutor.user.email}</p>
                        <p className={styles.tutorCardText}><b>Phone Number:</b> {tutor.user.phoneNumber}</p>
                        <p className={styles.tutorCardText}><b>Specialization:</b> {tutor.specialization}</p>
                        <p className={styles.tutorCardText}><b>Experience:</b> {tutor.experience} years</p>
                        <p className={styles.tutorCardText}><b>Education:</b> {tutor.education}</p>
                        <p className={styles.tutorCardText}><b>Introduction:</b> {tutor.introduction}</p>
                        <p className={styles.tutorCardText}>
                            <b>Status:</b>{' '}
                            {tutor.status === 'APPROVED' ? (
                                <span className={`${styles.tutorBadge} ${styles.approved} ${styles.badgePulse}`}>Approved</span>
                            ) : tutor.status === 'REJECTED' ? (
                                <span className={`${styles.tutorBadge} ${styles.rejected} ${styles.badgePulse}`}>Rejected</span>
                            ) : (
                                <span className={`${styles.tutorBadge} ${styles.pending} ${styles.badgePulse}`}>Pending</span>
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