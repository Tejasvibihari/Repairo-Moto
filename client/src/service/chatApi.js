import axiosClient from './axiosClient';

export const chatApi = {
    orders: async () => (await axiosClient.get('/api/chat/admin/orders')).data,
    messages: async (orderId) => (await axiosClient.get(`/api/chat/admin/${orderId}/messages`)).data,
    send: async (orderId, message) => (await axiosClient.post(`/api/chat/admin/${orderId}/messages`, { message })).data,
    suggestions: async (orderId) => (await axiosClient.get(`/api/chat/admin/${orderId}/suggestions`)).data,
};