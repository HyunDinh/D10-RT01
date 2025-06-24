import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.module.css'; // Giả định file CSS giống ParentCart

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
        <div className="container cart mt-5">
            <h2 className="text-primary mb-4 text-center">Giỏ hàng của tôi</h2>
            {loading ? (
                <div className="alert alert-info text-center">Đang tải giỏ hàng...</div>
            ) : error ? (
                <div className="alert alert-danger text-center">{error}</div>
            ) : cartItems.length === 0 ? (
                <div className="alert alert-warning text-center">Giỏ hàng trống</div>
            ) : (
                <>
                    <div className="row g-4">
                        {cartItems.map((item) => (
                            <div key={item.requestCartId} className="col-md-6">
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
                                                <p className="card-text status">
                                                    Trạng thái:{' '}
                                                    <span className="badge bg-warning text-dark">{item.status || 'Chờ gửi'}</span>
                                                </p>
                                                <div className="d-flex gap-2 flex-wrap mt-2">
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
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
                        <button className="btn btn-primary btn-lg" onClick={handleSendToParent}>
                            <i className="bi bi-send"></i> Gửi yêu cầu cho phụ huynh
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChildCart;