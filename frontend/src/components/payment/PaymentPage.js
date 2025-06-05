import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { Card, Spin, message } from 'antd'; // Xóa import antd
import PaymentForm from './PaymentForm';
import axios from 'axios';
import './Payment.css';

const PaymentPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null); // Thêm state cho lỗi

    useEffect(() => {
        const fetchData = async () => {
            setErrorMessage(null); // Reset lỗi trước khi fetch
            try {
                // Lấy thông tin khóa học
                const courseResponse = await axios.get(`http://localhost:8080/api/courses/${courseId}`);
                setCourse(courseResponse.data);

                // Lấy thông tin người dùng từ localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    // Thay thế message.error bằng cập nhật state
                    setErrorMessage('Vui lòng đăng nhập để thanh toán');
                    // message.error('Vui lòng đăng nhập để thanh toán'); // Xóa message antd
                    navigate('/login');
                    return;
                }
                setUserId(user.id);
            } catch (error) {
                 // Thay thế message.error bằng cập nhật state
                setErrorMessage('Lỗi khi tải thông tin khóa học');
                // message.error('Lỗi khi tải thông tin khóa học'); // Xóa message antd
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, navigate]);

    if (loading) {
        return (
            <div className="loading-container"> {/* Thay thế style antd bằng class */}
                <p>Đang tải...</p> {/* Thay thế Spin antd bằng text */}
            </div>
        );
    }

     if (errorMessage) { // Hiển thị lỗi nếu có
        return <div className="error-message">{errorMessage}</div>;
    }

    if (!course) {
        return <div className="error-message">Không tìm thấy thông tin khóa học.</div>; // Hiển thị thông báo nếu không tìm thấy khóa học
    }

    return (
        <div className="payment-page"> {/* Thay thế Card antd bằng div */}
            <h2>Thanh toán khóa học</h2> {/* Thêm tiêu đề thủ công */}
            {/* <Card title="Thanh toán khóa học"> */}
                <PaymentForm
                    courseId={course.id}
                    courseName={course.name}
                    amount={course.price}
                    userId={userId}
                />
            {/* </Card> */}
        </div>
    );
};

export default PaymentPage; 