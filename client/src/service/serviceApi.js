import axiosClient from './axiosClient';

// Admin CRUD for the services offered (admin / manager / operational manager).
export const serviceApi = {
    list: () => axiosClient.get('/api/admin/services'),
    get: (id) => axiosClient.get(`/api/admin/services/${id}`),
    create: (payload) => axiosClient.post('/api/admin/services', payload),
    update: (id, payload) => axiosClient.put(`/api/admin/services/${id}`, payload),
    remove: (id) => axiosClient.delete(`/api/admin/services/${id}`),
};

// Brands and their models, for the brand / model pickers.
export const brandApi = {
    list: () => axiosClient.get('/api/admin/brands/getbrands'),
};

const norm = (v) => String(v ?? '').trim().toLowerCase();

/**
 * Services that belong to a bike, matched by brand / model NAME (the manual invoice
 * stores the vehicle as free text). Brand is matched first; the model is also matched
 * when the vehicle has one. `vehicle` = { brand, model, modelName }.
 */
export const servicesForVehicle = (services, vehicle = {}) => {
    const brand = norm(vehicle.brand);
    if (!brand) return [];
    const models = [vehicle.model, vehicle.modelName].map(norm).filter(Boolean);
    return services.filter((s) => norm(s.brandName) === brand && (!models.length || models.includes(norm(s.modelName))));
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
