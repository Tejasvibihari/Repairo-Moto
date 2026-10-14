import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, LoaderCircle, MapPin, Pencil, Phone, Save, UserRound, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { leadApi, leadError, leadStatuses } from '../../service/leadApi';
import axiosClient from '../../service/axiosClient';

// Convert an ISO date to the local "YYYY-MM-DDTHH:mm" value a datetime-local input expects.
const toLocalInput = (iso) => { if (!iso) return ''; const d = new Date(iso); if (Number.isNaN(d.getTime())) return ''; const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

const input = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';
const SOURCES = [['phone', 'Phone'], ['whatsapp', 'WhatsApp'], ['website', 'Website'], ['meta', 'Meta'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['google', 'Google'], ['referral', 'Referral'], ['other', 'Other']];
const digits = (value) => String(value || '').replace(/\D/g, '').slice(-10);

// Form values for the "Edit details" panel, taken from the saved lead
const toDetailsForm = (lead) => ({
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
});

export default function TelecallerLeadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');

    // Edit lead details (name, phone, vehicle, location...)
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(null);
    const [savingDetails, setSavingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const [detailsSaved, setDetailsSaved] = useState(false);
    const [brands, setBrands] = useState([]);

    const load = useCallback(async () => {
        try {
            const response = await leadApi.get(id);
            setLead(response.data);
            setStatus(response.data.status);
            setFollowUpDate(toLocalInput(response.data.followUp?.date));
        } catch (err) {
            setError(leadError(err, 'Could not load this lead.'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    // Brands/models for the dropdowns (same source as the "Add a lead" form)
    useEffect(() => {
        let active = true;
        axiosClient.get('/api/admin/brands/getBrands')
            .then((res) => { if (active) setBrands(Array.isArray(res.data) ? res.data : []); })
            .catch(() => { /* dropdowns fall back to plain text boxes */ });
        return () => { active = false; };
    }, []);

    const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const models = useMemo(() => brands.find((b) => b.brandName === form?.brand)?.models || [], [brands, form?.brand]);

    const startEditing = () => {
        setForm(toDetailsForm(lead));
        setDetailsError('');
        setDetailsSaved(false);
        setEditing(true);
    };

    const saveDetails = async (event) => {
        event.preventDefault();
        if (!form.name.trim()) { setDetailsError('Customer name is required.'); return; }
        if (!/^[6-9]\d{9}$/.test(digits(form.phone))) { setDetailsError('Enter a valid 10-digit mobile number.'); return; }
        setDetailsError('');
        setSavingDetails(true);
        try {
            await leadApi.update(id, {
                customer: { name: form.name.trim(), phone: digits(form.phone) },
                vehicle: { brand: form.brand.trim(), model: form.model.trim(), registrationNumber: form.registrationNumber.trim() },
                location: { city: form.city.trim(), address: form.address.trim(), googleMapLink: form.googleMapLink.trim() },
                source: form.source,
                serviceInterest: form.serviceInterest.split(',').map((value) => value.trim()).filter(Boolean),
            });
            await load();
            setEditing(false);
            setDetailsSaved(true);
        } catch (err) {
            setDetailsError(leadError(err, 'Could not update the lead details.'));
        } finally {
            setSavingDetails(false);
        }
    };

    const save = async () => {
        if (status === 'follow_up' && !followUpDate) { setError('Please choose a follow-up date and time.'); return; }
        setError('');
        setBusy(true);
        try {
            const payload = { status, remarks: note.trim() ? [...(lead.remarks || []), { text: note.trim() }] : undefined };
            if (status === 'follow_up') payload.followUp = { ...(lead.followUp?.note ? { note: lead.followUp.note } : {}), date: new Date(followUpDate).toISOString() };
            await leadApi.update(id, payload);
            navigate('/employee/leads');
        } catch (err) {
            setError(leadError(err, 'Could not update this lead.'));
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="animate-spin text-primary" /></div>;
    if (!lead) return <div className="rounded-2xl bg-red-50 p-6 text-red-700">{error || 'Lead not found.'}</div>;

    const detailRows = [
        ['Phone', lead.customer?.phone],
        ['Vehicle', [lead.vehicle?.brand, lead.vehicle?.model].filter(Boolean).join(' ')],
        ['Registration', lead.vehicle?.registrationNumber],
        ['Location', [lead.location?.address, lead.location?.city].filter(Boolean).join(', ')],
        ['Source', SOURCES.find(([key]) => key === lead.source)?.[1] || lead.source],
        ['Services', (lead.serviceInterest || []).join(', ')],
    ];

    return (
        <div className="mx-auto max-w-4xl space-y-5">
            <Link to="/employee/leads" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-secondary"><ArrowLeft size={16} /> Back to leads</Link>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Lead details</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-secondary">{lead.customer?.name}</h1>
                    <a href={`tel:${lead.customer?.phone}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-500"><Phone size={15} /> {lead.customer?.phone}</a>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold capitalize text-amber-700">{lead.status?.replace('_', ' ')}</span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-bold text-secondary">Customer and vehicle</h2>
                            {!editing && (
                                <button type="button" onClick={startEditing} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-secondary hover:bg-gray-50">
                                    <Pencil size={13} /> Edit details
                                </button>
                            )}
                        </div>

                        {detailsSaved && !editing && (
                            <p className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"><Check size={13} /> Details updated</p>
                        )}

                        {!editing ? (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {detailRows.map(([label, value]) => (
                                        <div key={label} className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
                                            <p className="mt-1 text-sm font-semibold text-secondary">{value || 'Not added'}</p>
                                        </div>
                                    ))}
                                </div>
                                {lead.location?.googleMapLink && (
                                    <a href={lead.location.googleMapLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"><MapPin size={14} /> Open in Google Maps</a>
                                )}
                            </>
                        ) : (
                            <form onSubmit={saveDetails} className="space-y-4">
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

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="text-sm font-semibold text-gray-600">City
                                        <input className={input} value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="Patna" />
                                    </label>
                                    <label className="text-sm font-semibold text-gray-600">Source
                                        <select className={input} value={form.source} onChange={(e) => setField('source', e.target.value)}>
                                            {!SOURCES.some(([key]) => key === form.source) && <option value={form.source}>{form.source}</option>}
                                            {SOURCES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
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

                                {detailsError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{detailsError}</p>}

                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setEditing(false)} disabled={savingDetails} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60"><X size={15} /> Cancel</button>
                                    <button type="submit" disabled={savingDetails} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-secondary disabled:opacity-60">
                                        {savingDetails ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} Save details
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div>
                        <h2 className="mb-3 text-lg font-bold text-secondary">Conversation history</h2>
                        <div className="space-y-3">
                            {(lead.remarks || []).length ? lead.remarks.map((remark, index) => (
                                <div key={`${remark.createdAt || index}`} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                                    <UserRound size={16} className="mt-0.5 text-primary" />
                                    <div>
                                        <p className="text-sm text-gray-700">{remark.text}</p>
                                        <p className="mt-1 text-xs text-gray-400">{remark.createdAt ? new Date(remark.createdAt).toLocaleString('en-IN') : 'Recorded note'}</p>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-gray-500">No notes recorded yet.</p>}
                        </div>
                    </div>
                </section>

                <section className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-secondary">Update outcome</h2>
                    <label className="block text-sm font-semibold text-gray-600">Status
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary">
                            {leadStatuses.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </label>
                    {status === 'follow_up' && (
                        <label className="block text-sm font-semibold text-gray-600">Follow-up date &amp; time
                            <input type="datetime-local" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} required className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary" />
                        </label>
                    )}
                    <label className="block text-sm font-semibold text-gray-600">Add note
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 min-h-28 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary" placeholder="Record the customer's response" />
                    </label>
                    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    <button onClick={save} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary disabled:opacity-60">
                        {busy ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />} Save outcome
                    </button>
                </section>
            </div>
        </div>
    );
}
