import axiosClient from './axiosClient';

export const careerApi = {
    // Public
    listOpen: async () => (await axiosClient.get('/api/careers')).data,
    getOpen: async (id) => (await axiosClient.get(`/api/careers/${id}`)).data,
    apply: async (id, formData) =>
        (await axiosClient.post(`/api/careers/${id}/apply`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000,
        })).data,

    // Admin
    adminJobs: async () => (await axiosClient.get('/api/admin/careers/jobs')).data,
    createJob: async (payload) => (await axiosClient.post('/api/admin/careers/jobs', payload)).data,
    updateJob: async (id, payload) => (await axiosClient.put(`/api/admin/careers/jobs/${id}`, payload)).data,
    deleteJob: async (id) => (await axiosClient.delete(`/api/admin/careers/jobs/${id}`)).data,

    applications: async (params = {}) =>
        (await axiosClient.get('/api/admin/careers/applications', { params })).data,
    updateApplication: async (id, payload) =>
        (await axiosClient.patch(`/api/admin/careers/applications/${id}`, payload)).data,
    deleteApplication: async (id) =>
        (await axiosClient.delete(`/api/admin/careers/applications/${id}`)).data,

    // Resumes are admin-only, so they have to be fetched with the auth header and saved as a blob.
    downloadResume: async (id, fileName = 'resume') => {
        const res = await axiosClient.get(`/api/admin/careers/applications/${id}/resume`, {
            responseType: 'blob',
            timeout: 60000,
        });
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },
};

export const careerError = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
export const JOB_STATUSES = [
    ['open', 'Open'],
    ['draft', 'Draft'],
    ['closed', 'Closed'],
];
export const APPLICATION_STATUSES = [
    ['new', 'New'],
    ['reviewed', 'Reviewed'],
    ['shortlisted', 'Shortlisted'],
    ['rejected', 'Rejected'],
    ['hired', 'Hired'],
];

export const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
