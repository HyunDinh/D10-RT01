import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HandlePayosReturn = () => {
    const { orderCode } = useParams(); // Lấy orderCode từ URL
    const navigate = useNavigate();

    useEffect(() => {
        const handleReturn = async () => {
            if (orderCode) {
                try {
                    // Gọi API backend để xử lý logic return URL và cập nhật database
                    await axios.get(`http://localhost:8080/api/payments/return/${orderCode}`);
                    // console.log('Backend processing successful, redirecting to cart.');
                    // Chuyển hướng người dùng đến trang giỏ hàng
                    navigate('/hocho/parent/cart');
                } catch (err) {
                    console.error("Lỗi khi xử lý PayOS return:", err);
                    // Xử lý lỗi: có thể chuyển hướng đến trang giỏ hàng với thông báo lỗi hoặc trang lỗi chung
                    navigate('/hocho/parent/cart?payment_error=true'); // Ví dụ: thêm query param báo lỗi
                }
            } else {
                // Không có orderCode trong URL, chuyển hướng về giỏ hàng
                navigate('/hocho/parent/cart');
            }
        };

        handleReturn();

    }, [orderCode, navigate]); // Dependencies

    // Có thể hiển thị một thông báo tải hoặc rỗng trong khi chờ chuyển hướng
    return (
        <div className="handle-payos-return">
            <p>Đang xử lý thanh toán...</p>
            {/* Hoặc hiển thị spinner */}
        </div>
    );
};

export default HandlePayosReturn; 