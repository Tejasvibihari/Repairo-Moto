import axiosClient from './axiosClient';

export const chatApi = {
    orders: async () => (await axiosClient.get('/api/chat/admin/orders')).data,
    // markRead=false: just load, don't flag the customer's messages as read (see markRead below)
    messages: async (orderId) => (await axiosClient.get(`/api/chat/admin/${orderId}/messages`, { params: { markRead: false } })).data,
    // the chat is really on screen -> customer messages count as read
    markRead: async (orderId) => (await axiosClient.post(`/api/chat/admin/${orderId}/read`)).data,
    unreadCounts: async () => (await axiosClient.get('/api/chat/admin/unread-counts')).data,
    send: async (orderId, message) => (await axiosClient.post(`/api/chat/admin/${orderId}/messages`, { message })).data,
    suggestions: async (orderId) => (await axiosClient.get(`/api/chat/admin/${orderId}/suggestions`)).data,
};