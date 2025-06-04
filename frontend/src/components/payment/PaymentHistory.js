import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
// import { Table, Tag, Button, message, Space } from 'antd'; // Xóa import antd
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const PaymentHistory = ({ userId }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // Thêm state cho message
    const [messageType, setMessageType] = useState(null); // Thêm state cho loại message (success/error)
    const navigate = useNavigate();

    const fetchPayments = async () => {
        setMessage(null); // Reset message
        setMessageType(null);
        try {
            setLoading(true);
            const data = await paymentService.getUserPayments(userId);
            setPayments(data);
        } catch (error) {
            setMessage('Lỗi khi tải lịch sử thanh toán');
            setMessageType('error');
            console.error('Fetch payments error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [userId]);

    const handleCancel = async (orderCode) => {
        setMessage(null); // Reset message
        setMessageType(null);
        try {
            await paymentService.cancelPayment(orderCode);
            setMessage('Hủy thanh toán thành công');
            setMessageType('success');
            fetchPayments();
        } catch (error) {
            setMessage('Lỗi khi hủy thanh toán');
            setMessageType('error');
            console.error('Cancel payment error:', error);
        }
    };

    const getStatusClassName = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'status-completed';
            case 'PENDING':
                return 'status-pending';
            case 'CANCELLED':
                return 'status-cancelled';
            case 'FAILED':
                return 'status-failed';
            default:
                return 'status-default';
        }
    };

    // Định nghĩa cột thủ công cho bảng HTML
    const columns = [
        { title: 'Mã đơn hàng', dataIndex: 'orderCode' },
        { title: 'Số tiền', dataIndex: 'amount' },
        { title: 'Mô tả', dataIndex: 'description' },
        { title: 'Trạng thái', dataIndex: 'status' },
        { title: 'Ngày tạo', dataIndex: 'createdAt' },
        { title: 'Thao tác', key: 'action' },
    ];

    return (
        <div className="payment-history">
            <h2>Lịch sử thanh toán</h2>
            {/* Hiển thị message */}
            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            {/* Hiển thị loading */}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table> {/* Thay thế Table antd bằng table HTML */}
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index}>{col.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? (
                            payments.map((payment) => (
                                <tr key={payment.paymentId}> {/* Sử dụng paymentId làm key */}
                                    <td>{payment.orderCode}</td>
                                    <td>{payment.amount ? payment.amount.toLocaleString('vi-VN') + ' VNĐ' : ''}</td> {/* Định dạng số tiền */}
                                    <td>{payment.description}</td>
                                    <td> {/* Thay thế Tag antd */}
                                        <span className={`status-tag ${getStatusClassName(payment.status)}`}>
                                            {payment.status === 'COMPLETED' ? 'Hoàn thành' :
                                             payment.status === 'PENDING' ? 'Đang xử lý' :
                                             payment.status === 'CANCELLED' ? 'Đã hủy' :
                                             payment.status === 'FAILED' ? 'Thất bại' : payment.status}
                                        </span>
                                    </td>
                                    <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleString('vi-VN') : ''}</td> {/* Định dạng ngày */}
                                    <td> {/* Thay thế Space antd và Button antd */}
                                        {payment.status === 'PENDING' && (
                                            <button 
                                                className="action-button cancel-button"
                                                onClick={() => handleCancel(payment.orderCode)}
                                                disabled={loading} // Vô hiệu hóa button khi đang loading
                                            >
                                                Hủy
                                            </button>
                                        )}
                                        {payment.status === 'PENDING' && (
                                            <button 
                                                className="action-button pay-button"
                                                onClick={() => window.location.href = payment.paymentUrl}
                                                disabled={loading} // Vô hiệu hóa button khi đang loading
                                            >
                                                Thanh toán
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length}>Không có lịch sử thanh toán</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PaymentHistory; 