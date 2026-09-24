import axiosClient from './axiosClient';

const BASE = '/api/manual-invoices';

/**
 * Manual invoices are the replacement for the old "manual order" flow.
 * Orders are now created only by customers from the mobile app; anything
 * billed off-app (walk-in, phone lead, cash job) is recorded here as a
 * standalone invoice instead of a fake order.
 */

export const listManualInvoices = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            query.append(key, value);
        }
    });
    return axiosClient.get(`${BASE}?${query.toString()}`);
};

export const getManualInvoice = (id) => axiosClient.get(`${BASE}/${id}`);

export const createManualInvoice = (payload) => axiosClient.post(BASE, payload);

export const updateManualInvoice = (id, payload) => axiosClient.put(`${BASE}/${id}`, payload);

export const deleteManualInvoice = (id) => axiosClient.delete(`${BASE}/${id}`);

export const getAdminSettings = () => axiosClient.get('/api/admin-settings');

// ── Shared money helpers ─────────────────────────────────────────────────────
// Kept here so the create form, the list and the printable invoice all agree
// on how a line item, a discount and GST are calculated. These mirror the
// console app exactly — the server stores whatever we send, so the two
// clients must not drift apart.

export const toNumber = (value) => {
    const num = parseFloat(value);
    return Number.isNaN(num) ? 0 : num;
};

/** Unit price after the per-line discount is applied. */
export const effectiveUnitPrice = (item) => {
    const price = toNumber(item.price);
    const disc = toNumber(item.discountPrice);
    if (disc <= 0 || price <= 0) return price;
    return item.discountType === 'percent'
        ? price * (1 - disc / 100)
        : Math.max(price - disc, 0);
};

export const lineTotal = (item) => {
    const qty = toNumber(item.quantity) || 0;
    const unit = item.effectivePrice !== undefined && item.effectivePrice !== null
        ? toNumber(item.effectivePrice)
        : effectiveUnitPrice(item);
    return qty * unit;
};

export const calcSubTotal = (parts = [], services = []) =>
    [...parts, ...services].reduce((sum, item) => sum + lineTotal(item), 0);

/**
 * GST here is *inclusive*: the amount after discount already contains tax,
 * so the base is back-calculated out of it. Changing this would silently
 * change every invoice total, so keep it in step with the console app.
 */
export const calcTotals = ({ parts, services, discount, discountType, sgstRate, cgstRate }) => {
    const subTotal = calcSubTotal(parts, services);
    const discVal = toNumber(discount);

    let afterDiscount = discountType === 'percent'
        ? subTotal * (1 - discVal / 100)
        : subTotal - discVal;
    afterDiscount = Math.max(afterDiscount, 0);

    const sgstRateNum = toNumber(sgstRate);
    const cgstRateNum = toNumber(cgstRate);
    const totalTaxRate = sgstRateNum + cgstRateNum;

    let baseAmount = afterDiscount;
    let sgst = 0;
    let cgst = 0;

    if (totalTaxRate > 0) {
        baseAmount = afterDiscount / (1 + totalTaxRate / 100);
        sgst = baseAmount * (sgstRateNum / 100);
        cgst = baseAmount * (cgstRateNum / 100);
    }

    return {
        subTotal,
        discount: discVal,
        discountType: discVal > 0 ? discountType : undefined,
        sgst,
        cgst,
        sgstRate: sgstRateNum,
        cgstRate: cgstRateNum,
        baseAmount,
        total: afterDiscount,
        finalPayable: afterDiscount,
    };
};

export const formatMoney = (value) =>
    `₹${toNumber(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const PAYMENT_METHODS = ['cash', 'upi', 'card', 'razorpay', 'bank_transfer'];
export const INVOICE_STATUSES = ['paid', 'unpaid', 'draft', 'cancelled'];
