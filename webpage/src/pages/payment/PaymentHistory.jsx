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
                setError('Error loading transaction history');
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>PayOS ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction Date</th>
                        <th>Action</th>
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
                                    <td>{transaction.amount ? transaction.amount.toLocaleString('en-US') + ' VND' : ''}</td>
                                    <td>{transaction.status}</td>
                                    <td>{transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleString('vi-VN') : ''}</td>
                                    <td>
                                        <button onClick={() => handleToggleDetails(transaction.transactionId)}>
                                            {expandedRow === transaction.transactionId ? 'Hide details' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === transaction.transactionId && (
                                    <tr>
                                        <td colSpan="7">
                                            <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
                                                <h4>Order Details</h4>
                                                <ul>
                                                    {transaction.items && transaction.items.map((item, itemIndex) => (
                                                        <li key={itemIndex}>
                                                            <strong>Course:</strong> {item.courseTitle} <br />
                                                            <strong>Price:</strong> {item.price.toLocaleString('en-US')} VND <br />
                                                            <strong>For child:</strong> {item.childFullName}
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
                            <td colSpan="7">No transaction history.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentHistory; 