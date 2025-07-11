import React, {useEffect, useState} from 'react';
import {paymentService} from './paymentService.jsx';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/payment/PaymentHistory.module.css';
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
        <div className={styles.transactionContainer} aria-live="polite">
            <div className={styles.transactionTable}>
                <div className={styles.tableHeader}>
                    <div className={styles.tableCell}>#</div>
                    <div className={styles.tableCell}>PayOS ID</div>
                    <div className={styles.tableCell}>Order ID</div>
                    <div className={styles.tableCell}>Amount</div>
                    <div className={styles.tableCell}>Status</div>
                    <div className={styles.tableCell}>Transaction Date</div>
                    <div className={styles.tableCell}>Action</div>
                </div>
                <div className={styles.tableBody}>
                    {transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                            <React.Fragment key={transaction.transactionId}>
                                <div className={styles.tableRow}>
                                    <div className={styles.tableCell}>{index + 1}</div>
                                    <div className={styles.tableCell}>{transaction.payosTransactionId}</div>
                                    <div className={styles.tableCell}>{transaction.orderId || 'N/A'}</div>
                                    <div className={styles.tableCell}>
                                        {transaction.amount ? `${transaction.amount.toLocaleString('vi-VN')} VNĐ` : ''}
                                    </div>
                                    <div className={styles.tableCell}>{transaction.status}</div>
                                    <div className={styles.tableCell}>
                                        {transaction.transactionDate
                                            ? new Date(transaction.transactionDate).toLocaleString('vi-VN')
                                            : ''}
                                    </div>
                                    <div className={styles.tableCell}>
                                        <button
                                            className={`${styles.tableButton} ${styles.actionButton}`}
                                            onClick={() => handleToggleDetails(transaction.transactionId)}
                                            aria-label={
                                                expandedRow === transaction.transactionId
                                                    ? `Hide details for transaction ${transaction.payosTransactionId}`
                                                    : `View details for transaction ${transaction.payosTransactionId}`
                                            }
                                        >
                                            {expandedRow === transaction.transactionId ? 'Hide Details' : 'View Details'}
                                        </button>
                                    </div>
                                </div>
                                {expandedRow === transaction.transactionId && (
                                    <div className={styles.detailsRow}>
                                        <div className={styles.detailsContent}>
                                            <h4 className={styles.detailsTitle}>Order Details</h4>
                                            <ul className={styles.detailsList}>
                                                {transaction.items && transaction.items.length > 0 ? (
                                                    transaction.items.map((item, itemIndex) => (
                                                        <li key={itemIndex} className={styles.detailsItem}>
                                                            <strong>Course:</strong> {item.courseTitle} <br/>
                                                            <strong>Price:</strong> {item.price.toLocaleString('vi-VN')} VNĐ <br/>
                                                            <strong>For child:</strong> {item.childFullName}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className={styles.noDetails}>No items in this transaction</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <div className={styles.noTransactions}>No transaction history</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory; 