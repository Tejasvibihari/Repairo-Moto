import mongoose from 'mongoose';
import Service from '../Models/serviceModel.js';

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const CASE_INSENSITIVE = { locale: 'en', strength: 2 };

// Validates the editable fields. Returns { error } or { data } holding only what was sent.
// partial=false (create): name, price and estimatedMinutes are required.
const parseServiceBody = (body = {}, { partial = false } = {}) => {
    const data = {};

    if (body.name !== undefined || !partial) {
        const name = String(body.name ?? '').trim();
        if (!name) return { error: 'Service name is required.' };
        if (name.length > 120) return { error: 'Service name can be at most 120 characters.' };
        data.name = name;
    }

    if (body.description !== undefined) {
        const description = String(body.description ?? '').trim();
        if (description.length > 2000) return { error: 'Description can be at most 2000 characters.' };
        data.description = description;
    }

    if (body.price !== undefined || !partial) {
        const price = Number(body.price);
        if (body.price === undefined || body.price === null || body.price === '' || !Number.isFinite(price) || price < 0) {
            return { error: 'Price is required and must be a number (0 or more).' };
        }
        data.price = price;
    }

    if (body.priority !== undefined) {
        const priority = Number(body.priority);
        if (body.priority === null || body.priority === '' || !Number.isInteger(priority) || priority < 0) {
            return { error: 'Priority must be a whole number (0 or more).' };
        }
        data.priority = priority;
    }

    if (body.estimatedMinutes !== undefined || !partial) {
        const minutes = Number(body.estimatedMinutes);
        if (body.estimatedMinutes === undefined || body.estimatedMinutes === null || body.estimatedMinutes === '' || !Number.isFinite(minutes) || minutes < 1) {
            return { error: 'Approximate time is required and must be at least 1 minute.' };
        }
        data.estimatedMinutes = Math.round(minutes);
    }

    return { data };
};

const isDuplicateKey = (err) => err?.code === 11000;

// GET /  — all services, ordered by priority (lowest first), then name.
export const listServices = async (req, res) => {
    try {
        const services = await Service.find()
            .collation(CASE_INSENSITIVE)
            .sort({ priority: 1, name: 1 })
            .lean();
        return res.status(200).json({ success: true, count: services.length, services });
    } catch (error) {
        console.error('listServices error:', error);
        return fail(res, 500, 'Server error');
    }
};

// GET /:id
export const getService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return fail(res, 400, 'Invalid service id.');
        const service = await Service.findById(id).lean();
        if (!service) return fail(res, 404, 'Service not found.');
        return res.status(200).json({ success: true, service });
    } catch (error) {
        console.error('getService error:', error);
        return fail(res, 500, 'Server error');
    }
};

// POST /
export const createService = async (req, res) => {
    try {
        const { error, data } = parseServiceBody(req.body);
        if (error) return fail(res, 400, error);

        const service = await Service.create({
            ...data,
            createdBy: {
                id: req.user?._id,
                model: req.user?.model,
                name: req.user?.leadBy,
            },
        });
        return res.status(201).json({ success: true, message: 'Service created successfully.', service });
    } catch (error) {
        if (isDuplicateKey(error)) return fail(res, 409, 'A service with this name already exists.');
        if (error.name === 'ValidationError') return fail(res, 400, error.message);
        console.error('createService error:', error);
        return fail(res, 500, 'Server error');
    }
};

// PUT /:id  — send only the fields to change.
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return fail(res, 400, 'Invalid service id.');

        const { error, data } = parseServiceBody(req.body, { partial: true });
        if (error) return fail(res, 400, error);
        if (Object.keys(data).length === 0) return fail(res, 400, 'Nothing to update.');

        const service = await Service.findByIdAndUpdate(id, { $set: data }, {
            new: true,
            runValidators: true,
        });
        if (!service) return fail(res, 404, 'Service not found.');
        return res.status(200).json({ success: true, message: 'Service updated successfully.', service });
    } catch (error) {
        if (isDuplicateKey(error)) return fail(res, 409, 'A service with this name already exists.');
        if (error.name === 'ValidationError') return fail(res, 400, error.message);
        console.error('updateService error:', error);
        return fail(res, 500, 'Server error');
    }
};

// DELETE /:id
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return fail(res, 400, 'Invalid service id.');
        const service = await Service.findByIdAndDelete(id);
        if (!service) return fail(res, 404, 'Service not found.');
        return res.status(200).json({ success: true, message: 'Service deleted successfully.' });
    } catch (error) {
        console.error('deleteService error:', error);
        return fail(res, 500, 'Server error');
    }
};
