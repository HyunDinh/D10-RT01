import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {paymentService} from '../payment/paymentService.jsx';
import styles from '../../styles/cart/CartParent.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faFileInvoice} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const ParentCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState(null);
    const [calculatedPayableItems, setCalculatedPayableItems] = useState([]);
    const [calculatedTotalAmount, setCalculatedTotalAmount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                    withCredentials: true,
                });
                const parentId = userResponse.data.id;

                const cartResponse = await axios.get(`http://localhost:8080/api/parent-cart/${parentId}`, {
                    withCredentials: true,
                });
                const fetchedCartItems = cartResponse.data;
                setCartItems(fetchedCartItems);

                const payableItems = fetchedCartItems.filter(item => item.statusByParent && (item.statusByParent.trim() === 'ACCEPTED' || item.statusByParent.trim() === 'DIRECTLY_ADDED' || item.statusByParent.trim() === 'ADDED_DIRECTLY'));
                const totalAmount = payableItems.reduce((sum, item) => sum + (item.course.price || 0), 0);
                setCalculatedPayableItems(payableItems);
                setCalculatedTotalAmount(totalAmount);

                setLoading(false);
            } catch (err) {
                setError(t('cart_parent_error_load'));
                setLoading(false);
            }
        };

        fetchCart();

        const params = new URLSearchParams(location.search);
        const orderCode = params.get('orderCode');
        if (orderCode && window.lastCancelledOrderCode !== orderCode) {
            window.lastCancelledOrderCode = orderCode;
            paymentService.cancelPayment(orderCode).catch(err => {
                console.error('Error when cancelling payment:', err);
            });
        }
    }, [location.search]);

    const handleApprove = async (cartItemId) => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            const parentId = userResponse.data.id;

            await axios.post(`http://localhost:8080/api/parent-cart/${parentId}/approve/${cartItemId}`, {}, {
                withCredentials: true,
            });
            alert(t('cart_parent_approve_success'));
            const cartResponse = await axios.get(`http://localhost:8080/api/parent-cart/${parentId}`, {
                withCredentials: true,
            });
            const fetchedCartItems = cartResponse.data;
            setCartItems(fetchedCartItems);
            const payableItems = fetchedCartItems.filter(item => item.statusByParent && (item.statusByParent.trim() === 'ACCEPTED' || item.statusByParent.trim() === 'ADDED_DIRECTLY'));
            const totalAmount = payableItems.reduce((sum, item) => sum + (item.course.price || 0), 0);
            setCalculatedPayableItems(payableItems);
            setCalculatedTotalAmount(totalAmount);
        } catch (err) {
            setError(t('cart_parent_approve_error'));
        }
    };

    const handleReject = async (cartItemId) => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            const parentId = userResponse.data.id;

            await axios.post(`http://localhost:8080/api/parent-cart/${parentId}/reject/${cartItemId}`, {}, {
                withCredentials: true,
            });
            alert(t('cart_parent_reject_success'));
            const cartResponse = await axios.get(`http://localhost:8080/api/parent-cart/${parentId}`, {
                withCredentials: true,
            });
            const fetchedCartItems = cartResponse.data;
            setCartItems(fetchedCartItems);
            const payableItems = fetchedCartItems.filter(item => item.statusByParent && (item.statusByParent.trim() === 'ACCEPTED' || item.statusByParent.trim() === 'DIRECTLY_ADDED'));
            const totalAmount = payableItems.reduce((sum, item) => sum + (item.course.price || 0), 0);
            setCalculatedPayableItems(payableItems);
            setCalculatedTotalAmount(totalAmount);
        } catch (err) {
            setError(t('cart_parent_reject_error'));
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            const parentId = userResponse.data.id;

            await axios.delete(`http://localhost:8080/api/parent-cart/${parentId}/remove/${cartItemId}`, {
                withCredentials: true,
            });
            alert(t('cart_parent_remove_success'));
            const cartResponse = await axios.get(`http://localhost:8080/api/parent-cart/${parentId}`, {
                withCredentials: true,
            });
            const fetchedCartItems = cartResponse.data;
            setCartItems(fetchedCartItems);
            const payableItems = fetchedCartItems.filter(item => item.statusByParent && (item.statusByParent.trim() === 'ACCEPTED' || item.statusByParent.trim() === 'ADDED_DIRECTLY'));
            const totalAmount = payableItems.reduce((sum, item) => sum + (item.course.price || 0), 0);
            setCalculatedPayableItems(payableItems);
            setCalculatedTotalAmount(totalAmount);
        } catch (err) {
            setError(t('cart_parent_remove_error'));
        }
    };

    const handleCheckout = async () => {
        if (calculatedPayableItems.length === 0) {
            alert(t('cart_parent_no_items_to_pay'));
            return;
        }

        try {
            setPaymentLoading(true);
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            const userId = userResponse.data.id;

            const description = 'Pay for selected courses';
            const cartItemIds = calculatedPayableItems.map(item => item.cartId);

            const payment = await paymentService.createPayment(userId, cartItemIds, description);

            let paymentObject = payment;
            if (typeof payment === 'string') {
                try {
                    paymentObject = JSON.parse(payment);
                } catch (e) {
                    console.error('Failed to parse payment JSON:', e);
                    setError(t('cart_parent_payment_url_error'));
                    return;
                }
            }

            if (paymentObject && typeof paymentObject.paymentUrl === 'string' && paymentObject.paymentUrl) {
                window.location.href = paymentObject.paymentUrl;
            } else {
                setError(t('cart_parent_payment_url_error'));
            }
        } catch (err) {
            setError(t('cart_parent_create_payment_error', { error: err.response?.data || err.message }));
        } finally {
            setPaymentLoading(false);
        }
    };

    const getCourseImageUrl = (courseImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!courseImageUrl || courseImageUrl === 'none') {
            return '/avaBack.jpg';
        }
        const fileName = courseImageUrl.split('/').pop();
        return `${baseUrl}/api/courses/image/${fileName}?t=${new Date().getTime()}`;
    };

    const totalCoursePrice = cartItems.reduce((sum, item) => sum + (item.course.price || 0), 0);

    if (loading) return <div className={`${styles.loading} loading`}>{t('cart_loading')}</div>;
    if (error) return <div className={`${styles.error} error`}>{error}</div>;

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('cart_parent_title')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration='800' data-aos='fade-up'
                    data-aos-delay='500'>
                    <li>
                        <a href='/hocho/home'>{t('cart_breadcrumb_home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('cart_parent_breadcrumb')}</li>
                </ul>
            </div>
        </section>

        <div className={styles.cartLayout}>

            <div className={styles.cartLeft}>
                {cartItems.length === 0 ? (<div className={styles.emptyCart}>{t('cart_empty')}</div>) : (
                    <div className={`${styles.cartGrid} ${cartItems.length === 1 ? styles.singleItem : ''}`}
                         aria-live='polite'>
                        {cartItems.map(item => (<div key={item.cartId} className={styles.cartItem}>
                            <div className={styles.cartCard}>
                                <div className={styles.cartCardInner}>
                                    <div className={styles.cartImageWrapper}>
                                        <img
                                            src={getCourseImageUrl(item.course.courseImageUrl)}
                                            alt={item.course.title}
                                            className={styles.cartImage}
                                        />
                                    </div>
                                    <div className={styles.cartBody}>
                                        <h5 className={styles.cartTitleItem}>{item.course.title}</h5>
                                        <p className={styles.cartPrice}>{item.course.price.toLocaleString('vi-VN')} VNĐ</p>
                                        <p className={styles.cartDesc}>{item.course.description}</p>
                                        <p className={styles.childName}>{t('cart_parent_child_label', { name: item.child.fullName })}</p>
                                        <p className={styles.cartStatus}>
                                            {t('cart_parent_status_label')}{' '}
                                            {item.statusByParent === 'PENDING_APPROVAL' ? (<span
                                                className={styles.statusBadgePending}>{t('cart_status_pending_approval')}</span>) : item.statusByParent && item.statusByParent.trim() === 'ACCEPTED' ? (
                                                <span className={styles.statusBadgeAccepted}>{t('cart_status_accepted')}</span>) : item.statusByParent && item.statusByParent.trim() === 'REJECTED' ? (
                                                <span className={styles.statusBadgeRejected}>{t('cart_status_rejected')}</span>) : item.statusByParent && item.statusByParent.trim() === 'DIRECTLY_ADDED' ? (
                                                <span className={styles.statusBadgeDirect}>{t('cart_status_directly_added')}</span>) : (<span
                                                className={styles.statusBadgeUnknown}>{item.statusByParent || t('cart_status_unknown')}</span>)}
                                        </p>
                                        <div className={styles.cartBtnGroup}>
                                            {item.statusByParent === 'PENDING_APPROVAL' && (<>
                                                <button
                                                    className={`${styles.cartBtn} ${styles.approve}`}
                                                    onClick={() => handleApprove(item.cartId)}
                                                    disabled={paymentLoading}
                                                    aria-label={t('cart_parent_approve_aria', { title: item.course.title, name: item.child.fullName })}
                                                >
                                                    <i className={styles.iconCheck}></i> {t('cart_parent_approve_btn')}
                                                </button>
                                                <button
                                                    className={`${styles.cartBtn} ${styles.reject}`}
                                                    onClick={() => handleReject(item.cartId)}
                                                    disabled={paymentLoading}
                                                    aria-label={t('cart_parent_reject_aria', { title: item.course.title, name: item.child.fullName })}
                                                >
                                                    <i className={styles.iconReject}></i> {t('cart_parent_reject_btn')}
                                                </button>
                                            </>)}
                                            <button
                                                className={`${styles.cartBtn} ${styles.remove}`}
                                                onClick={() => handleRemoveItem(item.cartId)}
                                                disabled={paymentLoading}
                                                aria-label={t('cart_parent_remove_aria', { title: item.course.title })}
                                            >
                                                <i className={styles.iconTrash}></i> {t('cart_remove_btn')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>))}
                    </div>)}
            </div>
            <div className={styles.cartRight}>
                {cartItems.length > 0 && (<div className={styles.cartSummary}>

                    <div className={styles.totalCourses}
                         aria-label={t('cart_parent_total_aria', { price: totalCoursePrice.toLocaleString('vi-VN') })}>
                        {t('cart_parent_total_label')}: <span
                            className={styles.totalCoursesValue}>{totalCoursePrice.toLocaleString('vi-VN')} {t('cart_currency')}</span>
                    </div>
                    <div className={styles.checkoutWrapper}>
                        <button
                            className={`${styles.cartBtn} ${styles.checkout}`}
                            onClick={handleCheckout}
                            disabled={paymentLoading || calculatedPayableItems.length === 0}
                            aria-label={t('cart_parent_checkout_aria')}
                        >
                            {paymentLoading ? t('cart_parent_processing_payment') : t('cart_parent_checkout_btn')}
                        </button>
                        <button className={`${styles.cartBtn}`}
                        >
                            <Link to='/hocho/payment/history' className={styles.backLink}>
                                <FontAwesomeIcon icon={faFileInvoice}/>
                            </Link>
                        </button>
                    </div>
                </div>)}
                <div className={styles.courseList} aria-label='List of courses in cart'>
                    <h4 className={styles.courseListTitle}>{t('cart_parent_courses_in_cart')}</h4>
                    {cartItems.length === 0 ? (< >
                        <p className={styles.noCourses}>{t('cart_parent_no_courses')}</p>
                        <div style={{display:'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%'}}>
                            <p className={styles.historyPayment}>{t('cart_parent_history_payment_hint')}</p>
                            <button className={`${styles.cartBtn}`}
                            >
                                <Link to='/hocho/payment/history' className={styles.backLink}>
                                    <FontAwesomeIcon icon={faFileInvoice}/>
                                </Link>
                            </button>
                        </div>
                    </>) : (<div className={styles.courseGrid}>
                        {cartItems.map(item => (<div key={item.cartId} className={styles.courseItem}>
                            <div className={styles.courseCard}>
                                <img
                                    src={getCourseImageUrl(item.course.courseImageUrl)}
                                    alt={item.course.title}
                                    className={styles.courseImage}
                                />
                                <div className={styles.courseBody}>
                                    <h5 className={styles.courseTitle}>{item.course.title}</h5>
                                    <p className={styles.coursePrice}>{item.course.price.toLocaleString('vi-VN')} VNĐ</p>
                                </div>
                            </div>
                        </div>))}
                    </div>)}
                </div>
            </div>
        </div>
        <Footer/>
    </>);
};

export default ParentCart;