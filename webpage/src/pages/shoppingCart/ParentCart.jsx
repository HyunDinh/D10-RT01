import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../payment/paymentService.jsx';
import styles from '../../styles/cart/Cart.module.css';

const ParentCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // State to store calculation results
    const [calculatedPayableItems, setCalculatedPayableItems] = useState([]);
    const [calculatedTotalAmount, setCalculatedTotalAmount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchCart();
        const params = new URLSearchParams(location.search);
        const orderCode = params.get('orderCode');
        if (orderCode) {
            if (window.lastCancelledOrderCode !== orderCode) {
                window.lastCancelledOrderCode = orderCode;
                paymentService.cancelPayment(orderCode)
                    .catch(err => {
                        console.error('Error when cancelling payment:', err);
                    });
            }
        }
    }, [location.search]);

    const fetchCart = async () => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
            const parentId = userResponse.data.id;

            const response = await axios.get(`http://localhost:8080/api/parent-cart/${parentId}`, {
                withCredentials: true
            });
            const fetchedCartItems = response.data;
            setCartItems(fetchedCartItems);

            const payableItemsAfterFetch = fetchedCartItems.filter(item => item.statusByParent && (item.statusByParent.trim() === 'ACCEPTED' || item.statusByParent.trim() === 'ADDED_DIRECTLY'));
            const totalAmountAfterFetch = payableItemsAfterFetch.reduce((sum, item) => sum + (item.course.price || 0), 0);
            
            setCalculatedPayableItems(payableItemsAfterFetch);
            setCalculatedTotalAmount(totalAmountAfterFetch);

            setLoading(false);
        } catch (err) {
            setError('Cannot load cart');
            setLoading(false);
        }
    };

    const handleApprove = async (cartItemId) => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
            const parentId = userResponse.data.id;

            await axios.post(`http://localhost:8080/api/parent-cart/${parentId}/approve/${cartItemId}`, {}, {
                withCredentials: true
            });
            alert('Request accepted');
            fetchCart(); // Fetch cart again to update status and recalculate total amount
        } catch (err) {
            setError('Cannot accept request');
        }
    };

    const handleReject = async (cartItemId) => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
            const parentId = userResponse.data.id;

            await axios.post(`http://localhost:8080/api/parent-cart/${parentId}/reject/${cartItemId}`, {}, {
                withCredentials: true
            });
            alert('Request rejected');
            fetchCart(); // Fetch cart again
        } catch (err) {
            setError('Cannot reject request');
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
            const parentId = userResponse.data.id;

            await axios.delete(`http://localhost:8080/api/parent-cart/${parentId}/remove/${cartItemId}`, {
                withCredentials: true
            });
            alert('Course removed from cart');
            fetchCart(); // Fetch cart again
        } catch (err) {
            setError('Cannot remove course from cart');
        }
    };

    // Sử dụng state đã tính toán cho hiển thị và logic
    const handleCheckout = async () => {
        // Sử dụng state đã tính toán cho điều kiện kiểm tra
        if (calculatedPayableItems.length === 0) {
            alert('No items in the cart can be paid for.');
            return;
        }

        try {
            setPaymentLoading(true);
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
             const userId = userResponse.data.id;

            const description = "Pay for selected courses";
            const cartItemIds = calculatedPayableItems.map(item => item.cartId);

            const payment = await paymentService.createPayment(userId, cartItemIds, description);

            let paymentObject = payment;
            if (typeof payment === 'string') {
              try {
                paymentObject = JSON.parse(payment);
              } catch (e) {
                console.error("Failed to parse payment JSON:", e);
                setError('Did not receive a valid payment URL from backend.');
                return;
              }
            }

            if (paymentObject && typeof paymentObject.paymentUrl === 'string' && paymentObject.paymentUrl) {
              window.location.href = paymentObject.paymentUrl;
            } else {
              setError('Did not receive a valid payment URL from backend.');
            }

        } catch (err) {
            setError('Cannot create payment request: ' + (err.response?.data || err.message));
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

    if (loading) return <div className={styles.loading + " loading"}>Loading cart...</div>;
    if (error) return <div className={styles.error + " error"}>{error}</div>;

    return (
        <div className={styles.cartContainer + " container mt-5"}>
            <h2 className={styles.cartTitle + " text-primary mb-4 text-center"}>My Cart</h2>
            {loading ? (
                <div className={styles.loading + " alert alert-info text-center"}>Loading cart...</div>
            ) : error ? (
                <div className={styles.error + " alert alert-danger text-center"}>{error}</div>
            ) : cartItems.length === 0 ? (
                <div className={styles.emptyCart + " alert alert-warning text-center"}>Cart is empty</div>
            ) : (
                <div className={styles.cartGrid + " row g-4"}>
                    {cartItems.map(item => (
                        <div key={item.cartId} className="col-md-6">
                            <div className={styles.cartCard + " card shadow-sm h-100"}>
                                <div className="row g-0 align-items-center">
                                    <div className="col-4">
                                        <img
                                            src={getCourseImageUrl(item.course.courseImageUrl)}
                                            alt={item.course.title}
                                            className={styles.cartImage + " img-fluid rounded-start"}
                                            style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className={styles.cartBody + " card-body"}>
                                            <h5 className={styles.cartTitleItem + " card-title"}>{item.course.title}</h5>
                                            <p className={styles.cartPrice + " card-text text-success fw-bold"}>
                                                {item.course.price.toLocaleString('vi-VN')} VNĐ
                                            </p>
                                            <p className={styles.cartDesc + " card-text"}>{item.course.description}</p>
                                            <p className="card-text child-name">Child: {item.child.fullName}</p>
                                            <p className={styles.cartStatus + " card-text status"}>
                                                Status: {item.statusByParent === 'PENDING_APPROVAL' ? (
                                                    <span className="badge bg-warning text-dark">Pending approval</span>
                                                ) : item.statusByParent && item.statusByParent.trim() === 'ACCEPTED' ? (
                                                    <span className="badge bg-success">Accepted</span>
                                                ) : item.statusByParent && item.statusByParent.trim() === 'REJECTED' ? (
                                                    <span className="badge bg-danger">Rejected</span>
                                                ) : item.statusByParent && item.statusByParent.trim() === 'DIRECTLY_ADDED' ? (
                                                    <span className="badge bg-primary">Directly added</span>
                                                ) : (
                                                    <span className="badge bg-secondary">{item.statusByParent || 'Unknown'}</span>
                                                )}
                                            </p>
                                            <div className={styles.cartBtnGroup + " d-flex gap-2 flex-wrap mt-2"}>
                                                {item.statusByParent === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <button
                                                            className={styles.cartBtn + ' ' + styles.approve + " btn btn-outline-success btn-sm"}
                                                            onClick={() => handleApprove(item.cartId)}
                                                            disabled={paymentLoading}
                                                        >
                                                            <i className="bi bi-check-circle"></i> Accept
                                                        </button>
                                                        <button
                                                            className={styles.cartBtn + ' ' + styles.reject + " btn btn-outline-danger btn-sm"}
                                                            onClick={() => handleReject(item.cartId)}
                                                            disabled={paymentLoading}
                                                        >
                                                            <i className="bi bi-x-circle"></i> Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className={styles.cartBtn + ' ' + styles.remove + " btn btn-outline-secondary btn-sm"}
                                                    onClick={() => handleRemoveItem(item.cartId)}
                                                    disabled={paymentLoading}
                                                >
                                                    <i className="bi bi-trash"></i> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {cartItems.length > 0 && ( 
                <div className={styles.cartSummary + " cart-summary mt-4"}>
                    <h4 className="text-end">Total amount: {calculatedTotalAmount.toLocaleString('vi-VN')} VNĐ</h4>
                    <div className="d-grid gap-2">
                        <button 
                            className={styles.cartBtn + ' ' + styles.checkout + " btn btn-success btn-lg"}
                            onClick={handleCheckout}
                            disabled={paymentLoading || calculatedPayableItems.length === 0}
                        >
                            {paymentLoading ? 'Processing payment...' : 'Checkout cart'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentCart; 