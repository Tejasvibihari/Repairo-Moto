// Utils/estimatedCost.js
//
// Brand + model based service pricing used while booking.
//
//  - resolveBrandModel():   brand / model (ids or names) -> the Brand + model sub-document
//  - listServicesForBike(): the priced services admin configured for that brand + model
//  - buildEstimatedCost():  validates the services a customer picked and builds the
//                           `estimatedCost` snapshot stored on the Order
//
// The price is ALWAYS read from the Service collection here — the client never sends a price,
// so a tampered request cannot change the estimate. The stored value is only an ESTIMATE: the
// real bill is generated later (order.total) and may be higher or lower after the repair.
import mongoose from 'mongoose';
import Brand from '../Models/brandModel.js';
import Service from '../Models/serviceModel.js';

const CASE_INSENSITIVE = { locale: 'en', strength: 2 };
const norm = (v) => String(v ?? '').trim().toLowerCase();

// Accepts { brandId | brandName, modelId | modelName }. Returns { brand, model } (both lean docs /
// sub-docs) or null when the bike is not in the catalogue (e.g. the customer chose "Other").
export const resolveBrandModel = async ({ brandId, modelId, brandName, modelName } = {}) => {
    let brand = null;
    if (brandId && mongoose.isValidObjectId(brandId)) {
        brand = await Brand.findById(brandId).lean();
    } else if (String(brandName ?? '').trim()) {
        brand = await Brand.findOne({ brandName: String(brandName).trim() }).collation(CASE_INSENSITIVE).lean();
    }
    if (!brand) return null;

    const models = brand.models || [];
    let model = null;
    if (modelId && mongoose.isValidObjectId(modelId)) {
        model = models.find((m) => String(m._id) === String(modelId)) || null;
    } else if (String(modelName ?? '').trim()) {
        model = models.find((m) => norm(m.name) === norm(modelName)) || null;
    }
    if (!model) return null;

    return { brand, model };
};

// Services for one brand + model, lowest priority number first, then name.
export const listServicesForBike = async (bike) => {
    const resolved = await resolveBrandModel(bike);
    if (!resolved) return { resolved: null, services: [] };

    const services = await Service.find({ brand: resolved.brand._id, model: resolved.model._id })
        .collation(CASE_INSENSITIVE)
        .sort({ priority: 1, name: 1 })
        .select('name description price estimatedMinutes priority')
        .lean();

    return { resolved, services };
};

// Builds the `estimatedCost` snapshot for the services picked at booking time.
//
//   serviceIds    [Service _id]  the priced services the customer selected
//   selectedBrand / selectedModel  names, exactly as stored on the order
//
// Returns:
//   { estimatedCost: null }   nothing priced was selected (e.g. only a free-text "Other" service)
//   { estimatedCost: {...} }  snapshot to store on the order
//   { error: '...' }          a selected service does not exist for this bike any more
export const buildEstimatedCost = async ({ serviceIds, selectedBrand, selectedModel }) => {
    const ids = [...new Set((Array.isArray(serviceIds) ? serviceIds : []).map(String))];
    if (ids.length === 0) return { estimatedCost: null };

    if (ids.some((id) => !mongoose.isValidObjectId(id))) {
        return { error: 'One of the selected services is invalid. Please reselect your services.' };
    }

    const resolved = await resolveBrandModel({ brandName: selectedBrand, modelName: selectedModel });
    if (!resolved) {
        return { error: 'Prices are not available for this bike. Please reselect your bike and services.' };
    }

    const found = await Service.find({
        _id: { $in: ids },
        brand: resolved.brand._id,
        model: resolved.model._id,
    }).lean();

    const byId = new Map(found.map((s) => [String(s._id), s]));
    if (byId.size !== ids.length) {
        return { error: 'A selected service is no longer available for your bike. Please reselect your services.' };
    }

    // Keep the order the customer picked them in.
    const items = ids.map((id) => {
        const s = byId.get(id);
        return {
            serviceId: s._id,
            name: s.name,
            price: s.price,
            estimatedMinutes: s.estimatedMinutes,
        };
    });

    return {
        estimatedCost: {
            total: items.reduce((sum, i) => sum + i.price, 0),
            estimatedMinutes: items.reduce((sum, i) => sum + (i.estimatedMinutes || 0), 0),
            items,
            isEstimate: true,
            calculatedAt: new Date(),
        },
    };
};
