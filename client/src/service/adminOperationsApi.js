import axiosClient from './axiosClient';

export const adminOperationsApi = {
    leadOverview: (range = 'all') => axiosClient.get('/api/lead/overview', { params: { range } }),
    leads: (params) => axiosClient.get('/api/lead', { params }),
    attendance: (from, to) => axiosClient.get('/api/admin/attendance/report', { params: { from, to } }),
    staffOverview: (position, from, to) => axiosClient.get('/api/admin/staff-overview', { params: { position, from, to } }),
    shopStatus: () => axiosClient.get('/api/admin-settings/shop-status'),
    updateShopStatus: (payload) => axiosClient.put('/api/admin-settings/shop-status', payload),
    whatsapp: async () => {
        const response = await axiosClient.get('/api/admin-settings/whatsapp');
        return { ...response, data: { ...response.data, enabled: response.data?.orderStatusEnabled !== false } };
    },
    updateWhatsapp: (payload) => axiosClient.put('/api/admin-settings/whatsapp', { orderStatusEnabled: payload.enabled !== false }),
    banners: () => axiosClient.get('/api/admin/banner'),
    deleteBanner: (id) => axiosClient.delete(`/api/admin/banner/${id}`),
    coupons: () => axiosClient.get('/api/admin/coupons/all'),
    createCoupon: (payload) => axiosClient.post('/api/admin/coupons/create', payload),
    updateCoupon: (id, payload) => axiosClient.put(`/api/admin/coupons/${id}`, payload),
    deleteCoupon: (id) => axiosClient.delete(`/api/admin/coupons/${id}`),
    toggleCoupon: (id) => axiosClient.patch(`/api/admin/coupons/${id}/toggle`),
    notifications: () => axiosClient.get('/api/admin/notifications/campaigns'),
    createNotification: (payload) => axiosClient.post('/api/admin/notifications/campaigns', payload),
};

export const apiError = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
