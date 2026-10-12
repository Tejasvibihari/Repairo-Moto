import axiosClient from './axiosClient';

export const leadApi = {
    dashboard: async () => (await axiosClient.get('/api/employee/dashboard')).data,
    list: async (params = {}) => (await axiosClient.get('/api/lead', { params })).data,
    get: async (id) => (await axiosClient.get(`/api/lead/${id}`)).data,
    create: async (payload) => (await axiosClient.post('/api/lead/new', payload)).data,
    update: async (id, payload) => (await axiosClient.put(`/api/lead/${id}`, payload)).data,
};

export const leadError = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

export const leadStatuses = [
    ['new', 'New'],
    ['called', 'Called'],
    ['interested', 'Interested'],
    ['follow_up', 'Follow up'],
    ['booked', 'Booked'],
    ['not_reachable', 'Not reachable'],
    ['not_interested', 'Not interested'],
];
