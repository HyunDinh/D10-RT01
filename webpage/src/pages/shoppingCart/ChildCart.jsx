import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/cart/Cart.module.css';
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from 'react-i18next';

const ChildCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Lấy giỏ hàng
    const fetchCart = async () => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            const childId = userResponse.data.id;

            const response = await axios.get(`http://localhost:8080/api/child-cart/${childId}`, {
                withCredentials: true,
            });
            setCartItems(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('cart_child_error_load'));
            setLoading(false);
        }
    };

    // Xử lý xóa khóa học khỏi giỏ hàng
    const handleRemoveItem = async (courseId) => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            const childId = userResponse.data.id;

            await axios.delete(`http://localhost:8080/api/child-cart/${childId}/remove/${courseId}`, {
                withCredentials: true,
            });
            alert(t('cart_child_remove_success'));
            fetchCart(); // Làm mới giỏ hàng
        } catch (err) {
            setError(t('cart_child_remove_error'));
        }
    };

    // Xử lý gửi yêu cầu đến phụ huynh
    const handleSendToParent = async () => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            const childId = userResponse.data.id;

            await axios.post(`http://localhost:8080/api/child-cart/${childId}/send-to-parent`, {}, {
                withCredentials: true,
            });
            alert(t('cart_child_send_success'));
            fetchCart(); // Làm mới giỏ hàng
        } catch (err) {
            setError(t('cart_child_send_error'));
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

    useEffect(() => {
        fetchCart();
    }, []);

    return (<>
        <Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('cart_child_title')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                    data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">{t('cart_breadcrumb_home')}</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('cart_child_title')}</li>
                </ul>
            </div>
        </section>

        <div className={styles.cartContainer}>
            {loading ? (<div className={styles.loading}>{t('cart_loading')}</div>) : error ? (
                <div className={styles.error}>{error}</div>) : cartItems.length === 0 ? (
                <div className={styles.emptyCart}>{t('cart_empty')}</div>) : (<>
                    <table className={styles.cartTable}>
                        <thead>
                        <tr>
                            <th className={styles.tableHeader}></th>
                            <th className={styles.tableHeader}>{t('cart_table_title')}</th>
                            <th className={styles.tableHeader}>{t('cart_table_price')}</th>
                            <th className={styles.tableHeader}>{t('cart_table_description')}</th>
                            <th className={styles.tableHeader}>{t('cart_table_status')}</th>
                            <th className={styles.tableHeader}>{t('cart_table_action')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cartItems.map((item) => (<tr key={item.requestCartId} className={styles.cartRow}>
                                <td className={styles.tableCell}>
                                    <div className={styles.imageContainer}>
                                        <img
                                            src={getCourseImageUrl(item.course.courseImageUrl)}
                                            alt={item.course.title}
                                            className={styles.cartImage}
                                        />
                                    </div>
                                </td>
                                <td className={styles.tableCell}>
                                    <h5 className={styles.cartTitleItem}>{item.course.title}</h5>
                                </td>
                                <td className={styles.tableCell}>
                                    <p className={styles.cartPrice}>
                                        {item.course.price.toLocaleString('vi-VN')} {t('cart_currency')}
                                    </p>
                                </td>
                                <td className={styles.tableCell}>
                                    <p className={styles.cartDesc}>{item.course.description}</p>
                                </td>
                                <td className={styles.tableCell}>
                                    <p className={styles.cartStatus}>
                                        {' '}
                                        <span className={styles.statusBadge}>
                                            {item.status || t('cart_status_pending')}
                                        </span>
                                    </p>
                                </td>
                                <td className={styles.tableCell}>
                                    <div className={styles.cartBtnGroup}>
                                        <button
                                            className={`${styles.cartBtn} ${styles.remove}`}
                                            onClick={() => handleRemoveItem(item.course.courseId)}
                                        >
                                            <i className="bi bi-trash"></i> {t('cart_remove_btn')}
                                        </button>
                                    </div>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>
                    <div className={styles.checkoutContainer}>
                        <button
                            className={`${styles.cartBtn} ${styles.checkout}`}
                            onClick={handleSendToParent}
                        >
                            <i className="bi bi-send"></i> {t('cart_child_send_request_btn')}
                        </button>
                    </div>
                </>)}
        </div>
        <Footer/>
    </>);
};

export default ChildCart;