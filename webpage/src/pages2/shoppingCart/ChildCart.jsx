import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/cart/Cart.module.css';

const ChildCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
            setError('Không thể tải giỏ hàng');
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
            alert('Đã xóa khóa học khỏi giỏ hàng');
            fetchCart(); // Làm mới giỏ hàng
        } catch (err) {
            setError('Không thể xóa khóa học khỏi giỏ hàng');
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
            alert('Đã gửi yêu cầu cho phụ huynh');
            fetchCart(); // Làm mới giỏ hàng
        } catch (err) {
            setError('Không thể gửi yêu cầu cho phụ huynh');
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <div className={styles.cartContainer + " container mt-5"}>
            <h2 className={styles.cartTitle + " text-primary mb-4 text-center"}>Giỏ hàng của tôi</h2>
            {loading ? (
                <div className={styles.loading + " alert alert-info text-center"}>Đang tải giỏ hàng...</div>
            ) : error ? (
                <div className={styles.error + " alert alert-danger text-center"}>{error}</div>
            ) : cartItems.length === 0 ? (
                <div className={styles.emptyCart + " alert alert-warning text-center"}>Giỏ hàng trống</div>
            ) : (
                <>
                    <div className={styles.cartGrid + " row g-4"}>
                        {cartItems.map((item) => (
                            <div key={item.requestCartId} className="col-md-6">
                                <div className={styles.cartCard + " card shadow-sm h-100"}>
                                    <div className="row g-0 align-items-center">
                                        <div className="col-4">
                                            <img
                                                src={item.course.imageUrl || '/default-course.jpg'}
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
                                                <p className={styles.cartStatus + " card-text status"}>
                                                    Trạng thái:{' '}
                                                    <span className="badge bg-warning text-dark">{item.status || 'Chờ gửi'}</span>
                                                </p>
                                                <div className={styles.cartBtnGroup + " d-flex gap-2 flex-wrap mt-2"}>
                                                    <button
                                                        className={styles.cartBtn + ' ' + styles.remove + " btn btn-outline-danger btn-sm"}
                                                        onClick={() => handleRemoveItem(item.course.courseId)}
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
                    <div className="d-flex justify-content-center mt-4">
                        <button className={styles.cartBtn + ' ' + styles.checkout + " btn btn-primary btn-lg"} onClick={handleSendToParent}>
                            <i className="bi bi-send"></i> Gửi yêu cầu cho phụ huynh
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChildCart;