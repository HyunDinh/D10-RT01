import React from 'react';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const message = queryParams.get('message');

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Chào mừng đến với Dashboard</h2>
            {message && (
                <p className="mb-4 text-green-700">{decodeURIComponent(message)}</p>
            )}
            <p>Bạn đã đăng nhập thành công!</p>
        </div>
    );
};

export default Dashboard;