import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

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

const VerifyChild = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState(t('verify_verifying', 'Verifying...'));

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            axios.get(`http://localhost:8080/api/auth/verify-child?token=${token}`)
                .then(response => {
                    setMessage(response.data);
                    setTimeout(() => navigate('/hocho/login'), 2000);
                })
                .catch(error => {
                    setMessage(error.response?.data || t('verify_failed', 'Verification failed.'));
                });
        } else {
            setMessage(t('verify_invalid_token', 'Invalid token.'));
        }
    }, [searchParams, navigate, t]);

    return (
        <>
            <style>{styles}</style>
            <div className="verify-container">
                <h2 className="verify-heading">{t('verify_child_title', 'Verify child account')}</h2>
                <p className={message.toLowerCase().includes('success') || message.toLowerCase().includes('thành công') ? 'verify-success' : 'verify-error'}>
                    {message}
                </p>
            </div>
        </>
    );
};

export default VerifyChild;