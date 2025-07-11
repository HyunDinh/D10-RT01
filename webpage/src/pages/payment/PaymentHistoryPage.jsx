import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import PaymentHistory from './PaymentHistory.jsx';
import styles from '../../styles/payment/PaymentPage.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
            setIsLoggedIn(true);
        } else {
            navigate('/hocho/login');
        }
    }, [navigate]);

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Transaction History</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Transaction History</li>
                    </ul>
                </div>
            </section>
            <div className={styles.historyLayout}>
                <div className={styles.historyCard} aria-label="Transaction history">
                    <div className={styles.historyHeader}>
                        <h2 className={styles.historyTitle}>Transaction History</h2>
                        <button
                            className={`${styles.cartBtn} ${styles.backButton}`}
                            onClick={handleBack}
                            aria-label="Go back to previous page"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon}/> Back
                        </button>
                    </div>
                    <div className={styles.historyBody} aria-live="polite">
                        {isLoggedIn ? (
                            <PaymentHistory/>
                        ) : (
                            <div className={styles.loginPrompt}>
                                Please log in to view your transaction history.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default PaymentHistoryPage;