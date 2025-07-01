import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Card, message } from 'antd'; // Xóa import antd
import PaymentHistory from './PaymentHistory.jsx';
import './Payment.css';

const PaymentHistoryPage = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
            setIsLoggedIn(true);
        } else {
            navigate('/hocho/login');
        }
    }, [navigate]);

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0">Transaction History</h2>
                </div>
                <div className="card-body">
                    {isLoggedIn ? (
                        <PaymentHistory />
                    ) : (
                        <div className="alert alert-warning">Please log in to view history.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentHistoryPage; 