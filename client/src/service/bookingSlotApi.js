import axiosClient from './axiosClient';

// Admin CRUD for the bookable time slots + the public per-date lookup the
// booking forms use. The native apps call the same public endpoint.
export const bookingSlotApi = {
    // admin (admin / operational manager)
    list: () => axiosClient.get('/api/admin/booking-slots'),
    create: (payload) => axiosClient.post('/api/admin/booking-slots', payload),
    update: (id, payload) => axiosClient.put(`/api/admin/booking-slots/${id}`, payload),
    toggle: (id, isActive) => axiosClient.patch(`/api/admin/booking-slots/${id}/toggle`, typeof isActive === 'boolean' ? { isActive } : {}),
    remove: (id) => axiosClient.delete(`/api/admin/booking-slots/${id}`),
    generate: (payload) => axiosClient.post('/api/admin/booking-slots/generate', payload),

    // public - enabled slots (no date = just the list + whether slots are configured)
    enabled: () => axiosClient.get('/api/booking-slots'),
    // public - enabled slots with availability for a date (YYYY-MM-DD)
    forDate: (date) => axiosClient.get('/api/booking-slots', { params: { date } }),
};

// "08:00" -> "08:00 AM"
export const formatSlotTime = (t) => {
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return t || '';
    const [h, m] = t.split(':').map(Number);
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
