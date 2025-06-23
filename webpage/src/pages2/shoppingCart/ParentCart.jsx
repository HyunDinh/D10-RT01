import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../payment/paymentService.jsx';
import './Cart.css';

const ParentCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // State để lưu kết quả tính toán
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
                        console.error('Lỗi khi hủy thanh toán:', err);
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
            setError('Không thể tải giỏ hàng');
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
            alert('Đã chấp nhận yêu cầu');
            fetchCart(); // Fetch lại giỏ hàng để cập nhật trạng thái và tính toán lại tổng tiền
        } catch (err) {
            setError('Không thể chấp nhận yêu cầu');
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
            alert('Đã từ chối yêu cầu');
            fetchCart(); // Fetch lại giỏ hàng
        } catch (err) {
            setError('Không thể từ chối yêu cầu');
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
            alert('Đã xóa khóa học khỏi giỏ hàng');
            fetchCart(); // Fetch lại giỏ hàng
        } catch (err) {
            setError('Không thể xóa khóa học khỏi giỏ hàng');
        }
    };

    // Sử dụng state đã tính toán cho hiển thị và logic
    const handleCheckout = async () => {
        // Sử dụng state đã tính toán cho điều kiện kiểm tra
        if (calculatedPayableItems.length === 0) {
            alert('Không có mặt hàng nào trong giỏ hàng có thể thanh toán.');
            return;
        }

        try {
            setPaymentLoading(true);
            const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
             const userId = userResponse.data.id;

            const description = "Thanh toán các khóa học đã chọn";
            const cartItemIds = calculatedPayableItems.map(item => item.cartId);

            const payment = await paymentService.createPayment(userId, cartItemIds, description);

            let paymentObject = payment;
            if (typeof payment === 'string') {
              try {
                paymentObject = JSON.parse(payment);
              } catch (e) {
                console.error("Failed to parse payment JSON:", e);
                setError('Không nhận được URL thanh toán hợp lệ từ backend.');
                return;
              }
            }

            if (paymentObject && typeof paymentObject.paymentUrl === 'string' && paymentObject.paymentUrl) {
              window.location.href = paymentObject.paymentUrl;
            } else {
              setError('Không nhận được URL thanh toán hợp lệ từ backend.');
            }

        } catch (err) {
            setError('Không thể tạo yêu cầu thanh toán: ' + (err.response?.data || err.message));
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) return <div className="loading">Đang tải giỏ hàng...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="container cart mt-5">
            <h2 className="text-primary mb-4 text-center">Giỏ hàng của tôi</h2>
            {loading ? (
                <div className="alert alert-info text-center">Đang tải giỏ hàng...</div>
            ) : error ? (
                <div className="alert alert-danger text-center">{error}</div>
            ) : cartItems.length === 0 ? (
                <div className="alert alert-warning text-center">Giỏ hàng trống</div>
            ) : (
                <div className="row g-4">
                    {cartItems.map(item => (
                        <div key={item.cartId} className="col-md-6">
                            <div className="card shadow-sm h-100">
                                <div className="row g-0 align-items-center">
                                    <div className="col-4">
                                        <img
                                            src={item.course.imageUrl || '/default-course.jpg'}
                                            alt={item.course.title}
                                            className="img-fluid rounded-start"
                                            style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body">
                                            <h5 className="card-title">{item.course.title}</h5>
                                            <p className="card-text text-success fw-bold">
                                                {item.course.price.toLocaleString('vi-VN')} VNĐ
                                            </p>
                                            <p className="card-text">{item.course.description}</p>
                                            <p className="card-text child-name">Con: {item.child.fullName}</p>
                                            <p className="card-text status">
                                                Trạng thái: {item.statusByParent === 'PENDING_APPROVAL' ? (
                                                    <span className="badge bg-warning text-dark">Chờ phê duyệt</span>
                                                ) : item.statusByParent && item.statusByParent.trim() === 'ACCEPTED' ? (
                                                    <span className="badge bg-success">Đã chấp nhận</span>
                                                ) : item.statusByParent && item.statusByParent.trim() === 'REJECTED' ? (
                                                    <span className="badge bg-danger">Đã từ chối</span>
                                                ) : item.statusByParent && item.statusByParent.trim() === 'DIRECTLY_ADDED' ? (
                                                    <span className="badge bg-primary">Đã thêm trực tiếp</span>
                                                ) : ( // Fallback nếu trạng thái không khớp
                                                    <span className="badge bg-secondary">{item.statusByParent || 'Không rõ'}</span>
                                                )}
                                            </p>
                                            <div className="d-flex gap-2 flex-wrap mt-2">
                                                {item.statusByParent === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <button
                                                            className="btn btn-outline-success btn-sm"
                                                            onClick={() => handleApprove(item.cartId)}
                                                            disabled={paymentLoading}
                                                        >
                                                            <i className="bi bi-check-circle"></i> Chấp nhận
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleReject(item.cartId)}
                                                            disabled={paymentLoading}
                                                        >
                                                            <i className="bi bi-x-circle"></i> Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => handleRemoveItem(item.cartId)}
                                                    disabled={paymentLoading}
                                                >
                                                    <i className="bi bi-trash"></i> Xóa
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
                <div className="cart-summary mt-4">
                    {/* Sử dụng state đã tính toán cho hiển thị tổng tiền */}
                    <h4 className="text-end">Tổng tiền: {calculatedTotalAmount.toLocaleString('vi-VN')} VNĐ</h4>
                    <div className="d-grid gap-2">
                        <button 
                            className="btn btn-success btn-lg" 
                            onClick={handleCheckout}
                            // Sử dụng state đã tính toán cho điều kiện disabled
                            disabled={paymentLoading || calculatedPayableItems.length === 0}
                        >
                            {paymentLoading ? 'Đang xử lý thanh toán...' : 'Thanh toán giỏ hàng'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentCart; 