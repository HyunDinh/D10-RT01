import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Card, message } from 'antd'; // Xóa import antd
import PaymentHistory from './PaymentHistory';
import './Payment.css';

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null); // Thêm state cho lỗi

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId'); // Đọc trực tiếp key 'userId'
        if (!storedUserId) { // Kiểm tra nếu không có storedUserId
            setErrorMessage('Vui lòng đăng nhập để xem lịch sử thanh toán');
            navigate('/hocho/login');
            return;
        }
        setUserId(storedUserId); // Set userId với giá trị đọc được
    }, [navigate]);

    if (!userId && !errorMessage) { // Chỉ return null nếu không có userId và không có lỗi cần hiển thị
        return null;
    }

    return (
        <div className="payment-history-page"> {/* Thay thế Card antd bằng div */}
            {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Hiển thị lỗi */}
            <h2>Lịch sử thanh toán</h2> {/* Thêm tiêu đề thủ công */}
            {userId && <PaymentHistory userId={userId} />} {/* Chỉ render PaymentHistory khi có userId */}
        </div>
    );
};

export default PaymentHistoryPage; 