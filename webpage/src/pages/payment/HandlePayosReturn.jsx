import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HandlePayosReturn = () => {
    const { orderCode } = useParams(); // Get orderCode from URL
    const navigate = useNavigate();

    useEffect(() => {
        const handleReturn = async () => {
            if (orderCode) {
                try {
                    await axios.get(`http://localhost:8080/api/payments/return/${orderCode}`, {
                        withCredentials: true 
                    });
                    navigate('/hocho/parent/cart');
                } catch (err) {
                    console.error("Error handling PayOS return:", err);
                    navigate('/hocho/parent/cart?payment_error=true'); 
                }
            } else {
                navigate('/hocho/parent/cart');
            }
        };

        handleReturn();

    }, [orderCode, navigate]);

    return (
        <div className="handle-payos-return">
            <p>Processing payment...</p>
        </div>
    );
};

export default HandlePayosReturn; 