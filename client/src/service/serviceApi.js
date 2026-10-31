import axiosClient from './axiosClient';

// Admin CRUD for the services offered (admin / manager / operational manager).
export const serviceApi = {
    list: () => axiosClient.get('/api/admin/services'),
    get: (id) => axiosClient.get(`/api/admin/services/${id}`),
    create: (payload) => axiosClient.post('/api/admin/services', payload),
    update: (id, payload) => axiosClient.put(`/api/admin/services/${id}`, payload),
    remove: (id) => axiosClient.delete(`/api/admin/services/${id}`),
};

// 90 -> "1 hr 30 min", 45 -> "45 min", 120 -> "2 hr"
export const formatDuration = (minutes) => {
    const total = Number(minutes);
    if (!Number.isFinite(total) || total <= 0) return '—';
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h && m) return `${h} hr ${m} min`;
    if (h) return `${h} hr`;
    return `${m} min`;
};

export const formatPrice = (price) => {
    const n = Number(price);
    if (!Number.isFinite(n)) return '—';
    return `₹${n.toLocaleString('en-IN')}`;
};
