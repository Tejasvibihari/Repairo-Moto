import React, { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Save, X } from 'lucide-react';
import { leadApi, leadError, leadStatuses } from '../service/leadApi';
import axiosClient from '../service/axiosClient';

const input = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';
const SOURCES = [['phone', 'Phone'], ['whatsapp', 'WhatsApp'], ['website', 'Website'], ['meta', 'Meta'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['google', 'Google'], ['referral', 'Referral'], ['other', 'Other']];
const digits = (value) => String(value || '').replace(/\D/g, '').slice(-10);

/**
 * Edit a lead's details (name, phone, vehicle, location, source, services, status).
 * Used from the admin / manager Leads table. Saves with PUT /api/lead/:id.
 */
export default function LeadEditModal({ lead, onClose, onSaved }) {
    const [form, setForm] = useState(() => ({
        name: lead.customer?.name || '',
        phone: lead.customer?.phone || '',
        brand: lead.vehicle?.brand || '',
        model: lead.vehicle?.model || '',
        registrationNumber: lead.vehicle?.registrationNumber || '',
        city: lead.location?.city || '',
        address: lead.location?.address || '',
        googleMapLink: lead.location?.googleMapLink || '',
        source: lead.source || 'other',
        serviceInterest: (lead.serviceInterest || []).join(', '),
        status: lead.status || 'new',
    }));
    const [brands, setBrands] = useState([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        axiosClient.get('/api/admin/brands/getBrands')
            .then((res) => { if (active) setBrands(Array.isArray(res.data) ? res.data : []); })
            .catch(() => { /* dropdowns fall back to plain text boxes */ });
        return () => { active = false; };
    }, []);

    const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const models = useMemo(() => brands.find((b) => b.brandName === form.brand)?.models || [], [brands, form.brand]);

    const submit = async (event) => {
        event.preventDefault();
        if (!form.name.trim()) { setError('Customer name is required.'); return; }
        if (!/^[6-9]\d{9}$/.test(digits(form.phone))) { setError('Enter a valid 10-digit mobile number.'); return; }
        setError('');
        setBusy(true);
        try {
            const payload = {
                customer: { name: form.name.trim(), phone: digits(form.phone) },
                vehicle: { brand: form.brand.trim(), model: form.model.trim(), registrationNumber: form.registrationNumber.trim() },
                location: { city: form.city.trim(), address: form.address.trim(), googleMapLink: form.googleMapLink.trim() },
                source: form.source,
                serviceInterest: form.serviceInterest.split(',').map((value) => value.trim()).filter(Boolean),
            };
            if (form.status !== lead.status) payload.status = form.status;
            await leadApi.update(lead._id, payload);
            onSaved();
        } catch (err) {
            setError(leadError(err, 'Could not update this lead.'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
            <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-secondary">Edit lead</h2>
                        <p className="text-xs text-gray-500">Created by {lead.leadBy || 'unknown'}</p>
                    </div>
                    <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-gray-600">Customer name
                        <input className={input} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Full name" />
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Mobile number
                        <input className={input} value={form.phone} onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="9876543210" />
                    </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm font-semibold text-gray-600">Brand
                        {brands.length ? (
                            <select className={input} value={form.brand} onChange={(e) => setForm((current) => ({ ...current, brand: e.target.value, model: '' }))}>
                                <option value="">Select brand</option>
                                {form.brand && !brands.some((b) => b.brandName === form.brand) && <option value={form.brand}>{form.brand}</option>}
                                {brands.map((b) => <option key={b._id} value={b.brandName}>{b.brandName}</option>)}
                            </select>
                        ) : (
                            <input className={input} value={form.brand} onChange={(e) => setField('brand', e.target.value)} placeholder="Brand" />
                        )}
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Model
                        {brands.length ? (
                            <select className={input} value={form.model} onChange={(e) => setField('model', e.target.value)} disabled={!form.brand}>
                                <option value="">{form.brand ? 'Select model' : 'Select brand first'}</option>
                                {form.model && !models.some((m) => m.name === form.model) && <option value={form.model}>{form.model}</option>}
                                {models.map((m) => <option key={m._id || m.name} value={m.name}>{m.name}</option>)}
                            </select>
                        ) : (
                            <input className={input} value={form.model} onChange={(e) => setField('model', e.target.value)} placeholder="Model" />
                        )}
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Registration
                        <input className={input} value={form.registrationNumber} onChange={(e) => setField('registrationNumber', e.target.value)} placeholder="BR01AB1234" />
                    </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm font-semibold text-gray-600">City
                        <input className={input} value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="Patna" />
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Source
                        <select className={input} value={form.source} onChange={(e) => setField('source', e.target.value)}>
                            {!SOURCES.some(([key]) => key === form.source) && <option value={form.source}>{form.source}</option>}
                            {SOURCES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Status
                        <select className={input} value={form.status} onChange={(e) => setField('status', e.target.value)}>
                            {!leadStatuses.some(([key]) => key === form.status) && <option value={form.status}>{form.status.replace('_', ' ')}</option>}
                            {leadStatuses.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </label>
                </div>

                <label className="block text-sm font-semibold text-gray-600">Address
                    <input className={input} value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Customer address" />
                </label>
                <label className="block text-sm font-semibold text-gray-600">Google Maps link
                    <input className={input} value={form.googleMapLink} onChange={(e) => setField('googleMapLink', e.target.value)} placeholder="https://maps.google.com/..." />
                </label>
                <label className="block text-sm font-semibold text-gray-600">Services interested in
                    <input className={input} value={form.serviceInterest} onChange={(e) => setField('serviceInterest', e.target.value)} placeholder="Service, pickup, repair" />
                </label>

                {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                    <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-secondary disabled:opacity-60">
                        {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} Save changes
                    </button>
                </div>
            </form>
        </div>
    );
}
