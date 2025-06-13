import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Welcome() {
    const [data, setData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/api/hocho/welcome', { withCredentials: true })
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching welcome data:', error));
    }, []);

    const handleLogout = async () => {
        try {
            // Gửi yêu cầu logout và không tự động theo dõi redirect
            await axios.post('http://localhost:8080/logout', {}, {
                withCredentials: true,
                maxRedirects: 0 // Ngăn trình duyệt tự động redirect
            });
            // Chuyển hướng thủ công sang trang login
            navigate('/hocho/login?logout');
        } catch (err) {
            console.error('Logout error:', err);
            // Nếu có lỗi (bao gồm 302), vẫn chuyển hướng thủ công
            navigate('/hocho/login?logout');
            // Hiển thị thông báo lỗi nếu cần
            if (err.response) {
                console.log('Server response:', err.response.status, err.response.data);
            } else {
                console.log('Network error:', err.message);
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
            <div className="welcome-container" style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <h2>Hello {data.username || ''}!</h2>
                <p>Welcome to the application.</p>
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default Welcome;