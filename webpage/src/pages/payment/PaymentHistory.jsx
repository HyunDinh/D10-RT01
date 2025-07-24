import React, {useEffect, useState} from 'react';
import {paymentService} from './paymentService.jsx';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import styles from '../../styles/payment/PaymentHistory.module.css';

const PaymentHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const navigate = useNavigate();
    const {t} = useTranslation();

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const data = await paymentService.getUserTransactions();
                setTransactions(data);
            } catch (error) {
                setError(t('payment_history_error_load'));
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

    if (loading) return <div>{t('payment_history_loading')}</div>;
    if (error) return <div>{error}</div>;

    return (<div className={styles.transactionContainer} aria-live="polite">
        <div className={styles.transactionTable}>
            <div className={styles.tableHeader}>
                <div className={styles.tableCell}>{t('payment_history_header_index')}</div>
                <div className={styles.tableCell}>{t('payment_history_header_payos_id')}</div>
                <div className={styles.tableCell}>{t('payment_history_header_order_id')}</div>
                <div className={styles.tableCell}>{t('payment_history_header_amount')}</div>
                <div className={styles.tableCell}>{t('payment_history_header_status')}</div>
                <div className={styles.tableCell}>{t('payment_history_header_date')}</div>
                <div className={styles.tableCell}>{t('payment_history_header_action')}</div>
            </div>
            <div className={styles.tableBody}>
                {transactions.length > 0 ? (transactions.map((transaction, index) => (
                    <React.Fragment key={transaction.transactionId}>
                        <div className={styles.tableRow}>
                            <div className={styles.tableCell}>{index + 1}</div>
                            <div className={styles.tableCell}>{transaction.payosTransactionId}</div>
                            <div
                                className={styles.tableCell}>{transaction.orderId || t('payment_history_na')}</div>
                            <div className={styles.tableCell}>
                                {transaction.amount ? `${transaction.amount.toLocaleString('vi-VN')} VNĐ` : ''}
                            </div>
                            <div className={styles.tableCell}>{transaction.status}</div>
                            <div className={styles.tableCell}>
                                {transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleString('vi-VN') : ''}
                            </div>
                            <div className={styles.tableCell}>
                                <button
                                    className={`${styles.tableButton} ${styles.actionButton}`}
                                    onClick={() => handleToggleDetails(transaction.transactionId)}
                                    aria-label={expandedRow === transaction.transactionId ? t('payment_history_hide_details_aria', {id: transaction.payosTransactionId}) : t('payment_history_view_details_aria', {id: transaction.payosTransactionId})}
                                >
                                    {expandedRow === transaction.transactionId ? t('payment_history_hide_details') : t('payment_history_view_details')}
                                </button>
                            </div>
                        </div>
                        {expandedRow === transaction.transactionId && (<div className={styles.detailsRow}>
                                <div className={styles.detailsContent}>
                                    <h4 className={styles.detailsTitle}>{t('payment_history_order_details')}</h4>
                                    <ul className={styles.detailsList}>
                                        {transaction.items && transaction.items.length > 0 ? (transaction.items.map((item, itemIndex) => (
                                                <li key={itemIndex} className={styles.detailsItem}>
                                                    <strong>{t('payment_history_course')}:</strong> {item.courseTitle}
                                                    <br/>
                                                    <strong>{t('payment_history_price')}:</strong> {item.price.toLocaleString('vi-VN')} VNĐ <br/>
                                                    <strong>{t('payment_history_for_child')}:</strong> {item.childFullName}
                                                </li>))) : (
                                            <li className={styles.noDetails}>{t('payment_history_no_items')}</li>)}
                                    </ul>
                                </div>
                            </div>)}
                    </React.Fragment>))) : (
                    <div className={styles.noData}>{t('payment_history_no_transactions')}</div>)}
            </div>
        </div>
    </div>);
};

export default PaymentHistory; 