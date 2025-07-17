import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import PaymentHistory from './PaymentHistory.jsx';
import styles from '../../styles/payment/PaymentPage.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { useTranslation } from 'react-i18next';

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { t } = useTranslation();

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
                    <p>{t('payment_history_title')}</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">{t('payment_breadcrumb_home')}</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>{t('payment_history_title')}</li>
                    </ul>
                </div>
            </section>
            <div className={styles.historyLayout}>
                <div className={styles.historyCard} aria-label="Transaction history">
                    <div className={styles.historyHeader}>
                        <h2 className={styles.historyTitle}>{t('payment_history_title')}</h2>
                        <button
                            className={`${styles.cartBtn} ${styles.backButton}`}
                            onClick={handleBack}
                            aria-label={t('payment_history_back_aria')}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon}/> {t('payment_history_back_btn')}
                        </button>
                    </div>
                    <div className={styles.historyBody} aria-live="polite">
                        {isLoggedIn ? (
                            <PaymentHistory/>
                        ) : (
                            <div className={styles.loginPrompt}>
                                {t('payment_history_login_prompt')}
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