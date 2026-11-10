import mongoose from 'mongoose';
import Service from '../Models/serviceModel.js';
import Brand from '../Models/brandModel.js';
import { listServicesForBike } from '../Utils/estimatedCost.js';

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const CASE_INSENSITIVE = { locale: 'en', strength: 2 };

// Validates the editable fields. Returns { error } or { data } holding only what was sent.
// partial=false (create): brand, model, name, price and estimatedMinutes are required.
// Brand and model are always sent together (a model only makes sense under its brand);
// their names are looked up here and stored as a snapshot.
// createMany=true (create): brand/model are NOT read here; resolveTargets() handles the
// list of brands and models instead.
const parseServiceBody = async (body = {}, { partial = false, createMany = false } = {}) => {
    const data = {};

    if (!createMany && (body.brand !== undefined || body.model !== undefined || !partial)) {
        if (!mongoose.isValidObjectId(body.brand)) return { error: 'Brand is required.' };
        if (!mongoose.isValidObjectId(body.model)) return { error: 'Model is required.' };
        const brand = await Brand.findById(body.brand).lean();
        if (!brand) return { error: 'The selected brand no longer exists.' };
        const model = (brand.models || []).find((m) => String(m._id) === String(body.model));
        if (!model) return { error: `The selected model does not belong to ${brand.brandName}.` };
        data.brand = brand._id;
        data.brandName = brand.brandName;
        data.model = model._id;
        data.modelName = model.name;
    }

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

// Turns the create request's brand/model selection into a flat list of { brand, brandName, model, modelName }.
// Accepts targets: [{ brand, models: [modelId, ...] }, ...]  (or a single brand + model).
const resolveTargets = async (body = {}) => {
    let targets = body.targets;
    if (targets === undefined && body.brand !== undefined) targets = [{ brand: body.brand, models: [body.model] }];
    if (!Array.isArray(targets) || targets.length === 0) return { error: 'Select at least one brand and model.' };

    const brandIds = [...new Set(targets.map((t) => String(t?.brand ?? '')))];
    if (brandIds.some((id) => !mongoose.isValidObjectId(id))) return { error: 'Brand is required.' };
    const brands = await Brand.find({ _id: { $in: brandIds } }).lean();
    const brandMap = new Map(brands.map((b) => [String(b._id), b]));

    const seen = new Set();
    const list = [];
    for (const t of targets) {
        const brand = brandMap.get(String(t.brand));
        if (!brand) return { error: 'A selected brand no longer exists.' };
        const modelIds = Array.isArray(t.models) ? t.models : [];
        if (modelIds.length === 0) return { error: `Select at least one model for ${brand.brandName}.` };
        for (const modelId of modelIds) {
            const model = (brand.models || []).find((m) => String(m._id) === String(modelId));
            if (!model) return { error: `A selected model does not belong to ${brand.brandName}.` };
            const key = `${brand._id}:${model._id}`;
            if (seen.has(key)) continue; // same pair picked twice -> once
            seen.add(key);
            list.push({ brand: brand._id, brandName: brand.brandName, model: model._id, modelName: model.name });
        }
    }
    if (list.length > 500) return { error: 'Too many brand/model combinations at once (max 500).' };
    return { data: list };
};

const isDuplicateKey = (err) => err?.code === 11000;

// GET /  — services ordered by priority (lowest first), then name.
// Optional filters: ?brandId=  and  ?brandId=&modelId=  (a model needs its brand).
export const listServices = async (req, res) => {
    try {
        const { brandId, modelId } = req.query;
        const filter = {};
        if (brandId) {
            if (!mongoose.isValidObjectId(brandId)) return fail(res, 400, 'Invalid brand id.');
            filter.brand = brandId;
        }
        if (modelId) {
            if (!mongoose.isValidObjectId(modelId)) return fail(res, 400, 'Invalid model id.');
            filter.model = modelId;
        }
        const services = await Service.find(filter)
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

// POST /  — creates the service once for EVERY selected brand + model (same name, price,
// description, time and priority). Body: { targets: [{ brand, models: [modelId, ...] }], name, price, ... }
// Combinations that already have a service with this name are skipped and reported.
export const createService = async (req, res) => {
    try {
        const { error, data } = await parseServiceBody(req.body, { createMany: true });
        if (error) return fail(res, 400, error);
        const { error: targetError, data: targets } = await resolveTargets(req.body);
        if (targetError) return fail(res, 400, targetError);

        const existing = await Service.find({
            name: data.name,
            $or: targets.map((t) => ({ brand: t.brand, model: t.model })),
        }).collation(CASE_INSENSITIVE).select('brand model').lean();
        const taken = new Set(existing.map((e) => `${e.brand}:${e.model}`));
        const fresh = targets.filter((t) => !taken.has(`${t.brand}:${t.model}`));
        const skipped = targets
            .filter((t) => taken.has(`${t.brand}:${t.model}`))
            .map((t) => `${t.brandName} ${t.modelName}`);

        if (fresh.length === 0) {
            return fail(res, 409, `“${data.name}” already exists for ${skipped.length === 1 ? skipped[0] : 'all the selected brands and models'}.`);
        }

        const createdBy = { id: req.user?._id, model: req.user?.model, name: req.user?.leadBy };
        const services = await Service.insertMany(fresh.map((t) => ({ ...data, ...t, createdBy })));

        let message = services.length === 1 ? 'Service created successfully.' : `Service created for ${services.length} brand/model combinations.`;
        if (skipped.length) message += ` Skipped ${skipped.length} that already had it: ${skipped.join(', ')}.`;
        return res.status(201).json({ success: true, message, services, service: services[0], skipped });
    } catch (error) {
        if (isDuplicateKey(error)) return fail(res, 409, 'This service already exists for one of the selected brands and models.');
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

        const { error, data } = await parseServiceBody(req.body, { partial: true });
        if (error) return fail(res, 400, error);
        if (Object.keys(data).length === 0) return fail(res, 400, 'Nothing to update.');

        const service = await Service.findByIdAndUpdate(id, { $set: data }, {
            new: true,
            runValidators: true,
        });
        if (!service) return fail(res, 404, 'Service not found.');
        return res.status(200).json({ success: true, message: 'Service updated successfully.', service });
    } catch (error) {
        if (isDuplicateKey(error)) return fail(res, 409, 'This service already exists for the selected brand and model.');
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

// GET /api/services/pricing  — customer-facing price list for ONE bike, used by the booking flow.
// Query: ?brand=Hero&model=Splendor   (names, case-insensitive)
//    or: ?brandId=<id>&modelId=<id>
// A bike that is not in the catalogue (or has no services yet) answers 200 with an empty list,
// so the app can fall back to its generic service list instead of failing.
export const getServicePricing = async (req, res) => {
    try {
        const { brand, model, brandId, modelId } = req.query;
        if (!(brandId && modelId) && !(brand && model)) {
            return fail(res, 400, 'Brand and model are required.');
        }
        const { resolved, services } = await listServicesForBike({
            brandId, modelId, brandName: brand, modelName: model,
        });
        return res.status(200).json({
            success: true,
            brand: resolved ? { _id: resolved.brand._id, name: resolved.brand.brandName } : null,
            model: resolved ? { _id: resolved.model._id, name: resolved.model.name } : null,
            count: services.length,
            services,
        });
    } catch (error) {
        console.error('getServicePricing error:', error);
        return fail(res, 500, 'Server error');
    }
};
