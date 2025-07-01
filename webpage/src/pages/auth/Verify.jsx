import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const styles = `
    .verify-container {
        max-width: 384px;
        margin: 0 auto;
        padding: 16px;
        text-align: center;
    }
    .verify-heading {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
    }
    .verify-success {
        color: #15803d;
    }
    .verify-error {
        color: #dc2626;
    }
`;

const Verify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            axios.get(`http://localhost:8080/api/auth/verify?token=${token}`)
                .then(response => {
                    setMessage(response.data);
                    setTimeout(() => navigate('/hocho/login'), 2000); // Chuyển hướng sau 2 giây
                })
                .catch(error => {
                    setMessage(error.response?.data || 'Verification failed.');
                });
        } else {
            setMessage('Invalid token.');
        }
    }, [searchParams, navigate]);

    return (
        <>
            <style>{styles}</style>
            <div className="verify-container">
                <h2 className="verify-heading">Verify account</h2>
                <p className={message.includes('thành công') ? 'verify-success' : 'verify-error'}>
                    {message}
                </p>
            </div>
        </>
    );

};

export default Verify;