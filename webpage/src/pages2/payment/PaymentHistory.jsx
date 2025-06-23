import React, { useState, useEffect } from 'react';
import { paymentService } from './paymentService.jsx';
import { useNavigate } from 'react-router-dom';

const PaymentHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const data = await paymentService.getUserTransactions();
                setTransactions(data);
            } catch (error) {
                setError('Lỗi khi tải lịch sử giao dịch');
                console.error('Fetch transactions error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const handleToggleDetails = (transactionId) => {
        setExpandedRow(expandedRow === transactionId ? null : transactionId);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã PayOS</th>
                        <th>Mã Đơn Hàng</th>
                        <th>Số Tiền</th>
                        <th>Trạng Thái</th>
                        <th>Ngày Giao Dịch</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                            <React.Fragment key={transaction.transactionId}>
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{transaction.payosTransactionId}</td>
                                    <td>{transaction.orderId || 'N/A'}</td>
                                    <td>{transaction.amount ? transaction.amount.toLocaleString('vi-VN') + ' VNĐ' : ''}</td>
                                    <td>{transaction.status}</td>
                                    <td>{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleString('vi-VN') : ''}</td>
                                    <td>
                                        <button onClick={() => handleToggleDetails(transaction.transactionId)}>
                                            {expandedRow === transaction.transactionId ? 'Ẩn chi tiết' : 'Xem Chi Tiết'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === transaction.transactionId && (
                                    <tr>
                                        <td colSpan="7">
                                            <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
                                                <h4>Chi tiết đơn hàng</h4>
                                                <ul>
                                                    {transaction.items && transaction.items.map((item, itemIndex) => (
                                                        <li key={itemIndex}>
                                                            <strong>Khóa học:</strong> {item.courseTitle} <br />
                                                            <strong>Giá:</strong> {item.price.toLocaleString('vi-VN')} VNĐ <br />
                                                            <strong>Dành cho con:</strong> {item.childFullName}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">Không có lịch sử giao dịch nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentHistory; 