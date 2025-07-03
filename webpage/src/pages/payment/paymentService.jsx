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
            throw error.response?.data || 'Error creating payment';
        }
    },

    getPayment: async (orderCode) => {
        try {
            const response = await axios.get(`${API_URL}/${orderCode}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Error getting payment information';
        }
    },

    getUserPayments: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Error getting payment list';
        }
    },

    cancelPayment: async (orderCode) => {
        try {
            const response = await axios.put(
                `${API_URL}/${orderCode}/cancel`,
                {}, // empty body
                { withCredentials: true } // add this line!
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Error cancelling payment';
        }
    },

    getUserTransactions: async () => {
        try {
            const response = await axios.get(`${API_URL}/transactions`, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Error getting transaction history';
        }
    }
}; 