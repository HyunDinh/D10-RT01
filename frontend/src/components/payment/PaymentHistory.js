import React, { useState, useEffect } from 'react';
import { paymentService } from './paymentService';
// import { Table, Tag, Button, message, Space } from 'antd'; // Xóa import antd
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const PaymentHistory = ({ userId }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const navigate = useNavigate();

    const fetchTransactions = async () => {
        setMessage(null);
        setMessageType(null);
        try {
            setLoading(true);
            const data = await paymentService.getUserTransactions();
            setTransactions(data);
            console.log("Fetched transactions:", data);
        } catch (error) {
            setMessage('Lỗi khi tải lịch sử giao dịch');
            setMessageType('error');
            console.error('Fetch transactions error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchTransactions();
        }
    }, [userId]);

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

    const columns = [
        { title: 'Mã giao dịch', dataIndex: 'transactionId' },
        { title: 'Mã PayOS', dataIndex: 'payosTransactionId' },
        { title: 'Mã đơn hàng', dataIndex: 'order' },
        { title: 'Số tiền', dataIndex: 'amount' },
        { title: 'Trạng thái', dataIndex: 'status' },
        { title: 'Ngày giao dịch', dataIndex: 'transactionDate' },
    ];

    return (
        <div className="payment-history">
            <h2>Lịch sử giao dịch</h2>
            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index}>{col.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <tr key={transaction.transactionId}>
                                    <td>{transaction.transactionId}</td>
                                    <td>{transaction.payosTransactionId}</td>
                                    <td>{transaction.orderCode ? transaction.orderCode : 'N/A'}</td>
                                    <td>{transaction.amount ? transaction.amount.toLocaleString('vi-VN') + ' VNĐ' : ''}</td>
                                    <td>
                                        <span className={`status-tag ${getStatusClassName(transaction.status)}`}>
                                            {transaction.status === 'COMPLETED' ? 'Hoàn thành' :
                                             transaction.status === 'PENDING' ? 'Đang xử lý' :
                                             transaction.status === 'CANCELLED' ? 'Đã hủy' :
                                             transaction.status === 'FAILED' ? 'Thất bại' : transaction.status}
                                        </span>
                                    </td>
                                    <td>{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleString('vi-VN') : ''}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length}>Không có lịch sử giao dịch nào</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PaymentHistory; 