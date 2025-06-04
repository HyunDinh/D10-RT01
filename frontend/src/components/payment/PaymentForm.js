import React, { useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';
// import { Button, Form, Input, InputNumber, message } from 'antd'; // Xóa import antd
import './Payment.css';

const PaymentForm = ({ courseId, courseName, amount, userId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Thêm state để xử lý lỗi
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault(); // Ngăn chặn reload trang khi submit form HTML
        setError(null); // Reset lỗi trước khi submit
        try {
            setLoading(true);
            const description = `Thanh toán khóa học: ${courseName}`;
            const payment = await paymentService.createPayment(userId, amount, description);
            
            // Chuyển hướng đến trang thanh toán PayOS
            window.location.href = payment.paymentUrl;
        } catch (error) {
            // Sử dụng alert hoặc cập nhật state để hiển thị lỗi thay vì antd message
            setError(error.toString());
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-form">
            <h2>Thanh toán khóa học</h2>
            {error && <div className="error-message">{error}</div>} {/* Hiển thị lỗi nếu có */}
            <form onSubmit={handleSubmit}> {/* Thay thế Form của antd bằng form HTML */}
                <div className="form-item"> {/* Thay thế Form.Item bằng div */}
                    <label>Tên khóa học</label>
                    <input type="text" value={courseName} disabled /> {/* Thay thế Input antd */}
                </div>

                <div className="form-item"> {/* Thay thế Form.Item bằng div */}
                    <label>Số tiền (VNĐ)</label>
                    <input 
                        type="text" // Sử dụng type text để hiển thị định dạng
                        value={amount ? amount.toLocaleString() : ''} // Định dạng số tiền
                        disabled 
                    /> {/* Thay thế InputNumber antd */}
                </div>

                <div className="form-item"> {/* Thêm div cho button */}
                    <button type="submit" disabled={loading}> {/* Thay thế Button antd */}
                        {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm; 