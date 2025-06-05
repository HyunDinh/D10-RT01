import axios from 'axios';

const API_URL = 'http://localhost:8080/api/payments';

export const paymentService = {
    createPayment: async (userId, cartItemIds, description) => {
        try {
            const response = await axios.post(`${API_URL}/create`, {
                userId,
                cartItemIds,
                description
            }, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Lỗi khi tạo thanh toán';
        }
    },

    getPayment: async (orderCode) => {
        try {
            const response = await axios.get(`${API_URL}/${orderCode}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Lỗi khi lấy thông tin thanh toán';
        }
    },

    getUserPayments: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Lỗi khi lấy danh sách thanh toán';
        }
    },

    cancelPayment: async (orderCode) => {
        try {
            const response = await axios.put(`${API_URL}/${orderCode}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Lỗi khi hủy thanh toán';
        }
    },

    getUserTransactions: async () => {
        try {
            const response = await axios.get(`${API_URL}/transactions`, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Lỗi khi lấy lịch sử giao dịch';
        }
    }
}; 