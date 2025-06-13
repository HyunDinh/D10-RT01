import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Kiểm tra xem người dùng đã đăng nhập chưa bằng cách gọi một API bảo mật
                // Ví dụ: /api/user/current hoặc /api/auth/me
                const response = await axios.get('/api/user/current', { withCredentials: true });
                setUser(response.data); // Giả sử response.data chứa thông tin người dùng (bao gồm id, role)
            } catch (error) {
                console.error('Failed to fetch current user', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axios.post('/logout', {}, { withCredentials: true }); // Gọi API logout của backend
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}; 