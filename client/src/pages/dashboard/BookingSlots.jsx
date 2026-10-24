import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, Wand2, X, Eye, Info } from 'lucide-react';
import { bookingSlotApi, formatSlotTime } from '../../service/bookingSlotApi';
import { apiError } from '../../service/adminOperationsApi';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const INTERVALS = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1 hour 30 min' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
];

const REASON_TEXT = {
    SLOT_PAST: 'Time has passed',
    SLOT_FULL: 'Fully booked',
    STORE_CLOSED: 'Store closed',
    DAILY_LIMIT_REACHED: 'Daily limit reached',
};

const todayYmd = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the browser's timezone
const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const emptyForm = { startTime: '09:00', endTime: '10:00', label: '', maxBookings: '', isActive: true };
const inputCls = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary';

function Switch({ checked, onChange, disabled, label }) {
    return (
        <label className="relative inline-flex cursor-pointer items-center" title={label}>
            <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-label={label} />
            <span className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-emerald-500 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
        </label>
    );
}

export default function BookingSlots() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busyId, setBusyId] = useState(null);

    // quick setup
    const [gen, setGen] = useState({ startTime: '08:00', endTime: '15:00', intervalMinutes: 60, maxBookings: '', replaceExisting: false });
    const [generating, setGenerating] = useState(false);
    const [confirmReplace, setConfirmReplace] = useState(false);

    // add / edit dialog
    const [dialog, setDialog] = useState(null); // null | { id?: string, form }
    const [saving, setSaving] = useState(false);
    const [dialogError, setDialogError] = useState('');

    // delete
    const [toDelete, setToDelete] = useState(null);

    // customer preview
    const [previewDate, setPreviewDate] = useState(todayYmd());
    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const flash = (message) => { setNotice(message); setError(''); };
    const fail = (err, fallback) => { setError(apiError(err, fallback)); setNotice(''); };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await bookingSlotApi.list();
            setSlots(res.data?.slots || []);
            setError('');
        } catch (err) {
            fail(err, 'Could not load time slots.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPreview = useCallback(async () => {
        if (!previewDate) return;
        setPreviewLoading(true);
        try {
            const res = await bookingSlotApi.forDate(previewDate);
            setPreview(res.data || null);
        } catch (err) {
            setPreview({ error: apiError(err, 'Could not load the preview.') });
        } finally {
            setPreviewLoading(false);
        }
    }, [previewDate]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { loadPreview(); }, [loadPreview, slots]);

    const enabled = useMemo(() => slots.filter((s) => s.isActive), [slots]);
    const bookingWindow = useMemo(() => {
        if (!enabled.length) return null;
        const first = enabled[0];
        const last = enabled.reduce((a, b) => (toMinutes(b.endTime || b.startTime) > toMinutes(a.endTime || a.startTime) ? b : a));
        return `${formatSlotTime(first.startTime)} – ${formatSlotTime(last.endTime || last.startTime)}`;
    }, [enabled]);

    // ── quick setup ────────────────────────────────────────────────────────
    const genCount = useMemo(() => {
        if (!gen.startTime || !gen.endTime || toMinutes(gen.endTime) <= toMinutes(gen.startTime)) return 0;
        return Math.ceil((toMinutes(gen.endTime) - toMinutes(gen.startTime)) / Number(gen.intervalMinutes));
    }, [gen]);

    const runGenerate = async () => {
        setGenerating(true);
        setConfirmReplace(false);
        try {
            const res = await bookingSlotApi.generate({
                startTime: gen.startTime,
                endTime: gen.endTime,
                intervalMinutes: Number(gen.intervalMinutes),
                maxBookings: gen.maxBookings === '' ? null : Number(gen.maxBookings),
                replaceExisting: gen.replaceExisting,
            });
            setSlots(res.data?.slots || []);
            const { created = 0, skipped = 0, removed = 0 } = res.data || {};
            flash(`${created} slot${created === 1 ? '' : 's'} created${skipped ? `, ${skipped} already existed` : ''}${removed ? `, ${removed} old slot${removed === 1 ? '' : 's'} removed` : ''}.`);
        } catch (err) {
            fail(err, 'Could not generate slots.');
        } finally {
            setGenerating(false);
        }
    };

    const onGenerateClick = () => {
        setNotice(''); setError('');
        if (!genCount) { setError('Closing time must be after opening time.'); return; }
        if (gen.replaceExisting && slots.length) setConfirmReplace(true);
        else runGenerate();
    };

    // ── row actions ────────────────────────────────────────────────────────
    const toggle = async (slot, next) => {
        setBusyId(slot._id);
        try {
            const res = await bookingSlotApi.toggle(slot._id, next);
            setSlots((cur) => cur.map((s) => (s._id === slot._id ? res.data.slot : s)));
            flash(`${formatSlotTime(slot.startTime)} slot ${next ? 'enabled' : 'disabled'}.`);
        } catch (err) {
            fail(err, 'Could not update the slot.');
        } finally {
            setBusyId(null);
        }
    };

    const confirmDelete = async () => {
        const slot = toDelete;
        setToDelete(null);
        if (!slot) return;
        setBusyId(slot._id);
        try {
            await bookingSlotApi.remove(slot._id);
            setSlots((cur) => cur.filter((s) => s._id !== slot._id));
            flash('Time slot deleted.');
        } catch (err) {
            fail(err, 'Could not delete the slot.');
        } finally {
            setBusyId(null);
        }
    };

    // ── add / edit ─────────────────────────────────────────────────────────
    const openAdd = () => { setDialogError(''); setDialog({ form: { ...emptyForm } }); };
    const openEdit = (slot) => {
        setDialogError('');
        setDialog({
            id: slot._id,
            form: { startTime: slot.startTime, endTime: slot.endTime || '', label: slot.label || '', maxBookings: slot.maxBookings ?? '', isActive: slot.isActive },
        });
    };
    const setForm = (patch) => setDialog((d) => ({ ...d, form: { ...d.form, ...patch } }));

    const saveDialog = async (e) => {
        e.preventDefault();
        const f = dialog.form;
        if (!f.startTime) { setDialogError('Start time is required.'); return; }
        if (f.endTime && toMinutes(f.endTime) <= toMinutes(f.startTime)) { setDialogError('End time must be after the start time.'); return; }
        const payload = {
            startTime: f.startTime,
            endTime: f.endTime || '',
            label: f.label.trim(),
            maxBookings: f.maxBookings === '' ? null : Number(f.maxBookings),
            isActive: f.isActive,
        };
        setSaving(true);
        setDialogError('');
        try {
            if (dialog.id) {
                const res = await bookingSlotApi.update(dialog.id, payload);
                setSlots((cur) => cur.map((s) => (s._id === dialog.id ? res.data.slot : s)).sort((a, b) => a.startTime.localeCompare(b.startTime)));
                flash('Time slot updated.');
            } else {
                const res = await bookingSlotApi.create(payload);
                setSlots((cur) => [...cur, res.data.slot].sort((a, b) => a.startTime.localeCompare(b.startTime)));
                flash('Time slot added.');
            }
            setDialog(null);
        } catch (err) {
            setDialogError(apiError(err, 'Could not save the slot.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Operations</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-secondary">Booking slots</h1>
                    <p className="mt-1 text-sm text-gray-500">Choose the times customers can book. Changes apply to the app and website straight away.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="rounded-xl border border-gray-200 bg-white p-2.5" title="Refresh"><RefreshCw size={17} /></button>
                    <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-secondary"><Plus size={17} /> Add slot</button>
                </div>
            </div>

            {(error || notice) && (
                <p className={`rounded-xl p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || notice}</p>
            )}

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Customers can book</p>
                    <p className="mt-2 text-lg font-extrabold text-secondary">{bookingWindow || (slots.length ? 'Nothing – all slots disabled' : 'Any time (no slots set)')}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Enabled slots</p>
                    <p className="mt-2 text-lg font-extrabold text-secondary">{enabled.length} <span className="text-sm font-semibold text-gray-400">of {slots.length}</span></p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency repair</p>
                    <p className="mt-2 text-sm font-semibold text-gray-600">Not tied to slots. It follows the service hours in Shop Status.</p>
                </div>
            </div>

            {!loading && slots.length === 0 && (
                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    <p>No slots are set up, so customers can currently pick any time. Use <b>Quick setup</b> below (for example 8:00 AM to 3:00 PM) to limit bookings to fixed slots.</p>
                </div>
            )}

            {/* Quick setup */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <Wand2 className="text-primary" size={21} />
                    <div>
                        <h2 className="text-lg font-bold text-secondary">Quick setup</h2>
                        <p className="text-sm text-gray-500">Create all slots for a working day in one go. Changing hours later (say 9 AM – 6 PM)? Run it again with “replace”.</p>
                    </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-sm font-semibold text-gray-600">Opens at
                        <input type="time" value={gen.startTime} onChange={(e) => setGen({ ...gen, startTime: e.target.value })} className={inputCls} />
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Closes at
                        <input type="time" value={gen.endTime} onChange={(e) => setGen({ ...gen, endTime: e.target.value })} className={inputCls} />
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Slot length
                        <select value={gen.intervalMinutes} onChange={(e) => setGen({ ...gen, intervalMinutes: Number(e.target.value) })} className={inputCls}>
                            {INTERVALS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-semibold text-gray-600">Max bookings per slot
                        <input type="number" min="1" max="1000" placeholder="Unlimited" value={gen.maxBookings} onChange={(e) => setGen({ ...gen, maxBookings: e.target.value })} className={inputCls} />
                    </label>
                </div>
                <label className="mt-4 flex items-center gap-3 text-sm font-bold text-secondary">
                    <input type="checkbox" checked={gen.replaceExisting} onChange={(e) => setGen({ ...gen, replaceExisting: e.target.checked })} className="h-5 w-5 accent-amber-500" />
                    Replace all existing slots
                </label>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button onClick={onGenerateClick} disabled={generating || !genCount} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-secondary disabled:opacity-50">
                        {generating ? <LoaderCircle size={17} className="animate-spin" /> : <Wand2 size={17} />} Generate slots
                    </button>
                    <p className="text-sm text-gray-500">
                        {genCount ? `Creates ${genCount} slot${genCount === 1 ? '' : 's'}, ${formatSlotTime(gen.startTime)} to ${formatSlotTime(gen.endTime)}.` : 'Closing time must be after opening time.'}
                        {!gen.replaceExisting && slots.length > 0 && ' Times that already exist are kept as they are.'}
                    </p>
                </div>
            </section>

            {/* Slot list */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 p-6">
                    <Clock3 className="text-primary" size={21} />
                    <h2 className="text-lg font-bold text-secondary">All slots</h2>
                </div>
                {loading ? (
                    <div className="flex justify-center py-14"><LoaderCircle className="animate-spin text-primary" /></div>
                ) : slots.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-500">No slots yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-4 py-3">Label</th>
                                    <th className="px-4 py-3">Max / day</th>
                                    <th className="px-4 py-3">Enabled</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {slots.map((slot) => (
                                    <tr key={slot._id} className={slot.isActive ? '' : 'bg-gray-50/70 text-gray-400'}>
                                        <td className="px-6 py-4 font-bold text-secondary">{slot.endTime ? `${formatSlotTime(slot.startTime)} – ${formatSlotTime(slot.endTime)}` : formatSlotTime(slot.startTime)}</td>
                                        <td className="px-4 py-4">{slot.label || '—'}</td>
                                        <td className="px-4 py-4">{slot.maxBookings ?? 'Unlimited'}</td>
                                        <td className="px-4 py-4"><Switch checked={slot.isActive} disabled={busyId === slot._id} onChange={(next) => toggle(slot, next)} label={`${slot.isActive ? 'Disable' : 'Enable'} ${formatSlotTime(slot.startTime)}`} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(slot)} disabled={busyId === slot._id} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-primary" title="Edit"><Pencil size={15} /></button>
                                                <button onClick={() => setToDelete(slot)} disabled={busyId === slot._id} className="rounded-lg border border-gray-200 p-2 text-red-500 hover:border-red-300" title="Delete"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Customer preview */}
            <section className="rounded-2xl border border-amber-200 bg-[#fff3d6] p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-secondary"><Eye size={17} /> What customers see</div>
                    <input type="date" value={previewDate} onChange={(e) => setPreviewDate(e.target.value)} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm" />
                </div>
                <div className="mt-4 rounded-2xl bg-white p-4">
                    {previewLoading ? (
                        <div className="flex justify-center py-6"><LoaderCircle className="animate-spin text-primary" /></div>
                    ) : preview?.error ? (
                        <p className="text-sm text-red-600">{preview.error}</p>
                    ) : !preview?.enforced ? (
                        <p className="text-sm text-gray-500">No slots are set up – customers can choose any time.</p>
                    ) : preview.dateAvailability && !preview.dateAvailability.available ? (
                        <p className="text-sm font-semibold text-red-600">{preview.dateAvailability.message || 'Bookings are closed for this date.'}</p>
                    ) : preview.slots.length === 0 ? (
                        <p className="text-sm text-gray-500">All slots are disabled – customers cannot book a scheduled repair.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {preview.slots.map((s) => (
                                <span key={s._id} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${s.available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-100 text-gray-400 line-through'}`} title={s.available ? '' : REASON_TEXT[s.unavailableReason]}>
                                    {s.displayLabel}
                                    {s.available && s.remaining != null ? ` · ${s.remaining} left` : ''}
                                    {!s.available && REASON_TEXT[s.unavailableReason] ? ` · ${REASON_TEXT[s.unavailableReason]}` : ''}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Add / edit dialog */}
            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setDialog(null)} />
                    <form onSubmit={saveDialog} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-secondary">{dialog.id ? 'Edit time slot' : 'Add time slot'}</h2>
                            <button type="button" onClick={() => setDialog(null)} className="rounded-lg p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-semibold text-gray-600">Start time
                                <input required type="time" value={dialog.form.startTime} onChange={(e) => setForm({ startTime: e.target.value })} className={inputCls} />
                            </label>
                            <label className="text-sm font-semibold text-gray-600">End time <span className="font-normal text-gray-400">(optional)</span>
                                <input type="time" value={dialog.form.endTime} onChange={(e) => setForm({ endTime: e.target.value })} className={inputCls} />
                            </label>
                        </div>
                        <label className="mt-4 block text-sm font-semibold text-gray-600">Label <span className="font-normal text-gray-400">(optional)</span>
                            <input value={dialog.form.label} maxLength={40} onChange={(e) => setForm({ label: e.target.value })} placeholder="e.g. Morning" className={inputCls} />
                        </label>
                        <label className="mt-4 block text-sm font-semibold text-gray-600">Max bookings per day <span className="font-normal text-gray-400">(empty = unlimited)</span>
                            <input type="number" min="1" max="1000" value={dialog.form.maxBookings} onChange={(e) => setForm({ maxBookings: e.target.value })} className={inputCls} />
                        </label>
                        <label className="mt-4 flex items-center gap-3 text-sm font-bold text-secondary">
                            <input type="checkbox" checked={dialog.form.isActive} onChange={(e) => setForm({ isActive: e.target.checked })} className="h-5 w-5 accent-amber-500" />
                            Enabled (customers can book it)
                        </label>
                        {dialogError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{dialogError}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setDialog(null)} disabled={saving} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600">Cancel</button>
                            <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-secondary disabled:opacity-50">
                                {saving && <LoaderCircle size={16} className="animate-spin" />} {dialog.id ? 'Save changes' : 'Add slot'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!toDelete}
                title="Delete this time slot?"
                message={toDelete ? `${formatSlotTime(toDelete.startTime)} will no longer be offered to customers. Existing bookings keep their time. To hide it temporarily, disable it instead.` : ''}
                confirmText="Delete"
                cancelText="Keep it"
                isDangerous
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
            <ConfirmationModal
                isOpen={confirmReplace}
                title="Replace all slots?"
                message={`All ${slots.length} existing slot${slots.length === 1 ? '' : 's'} will be removed and ${genCount} new one${genCount === 1 ? '' : 's'} created. Existing bookings keep their time.`}
                confirmText="Replace"
                cancelText="Cancel"
                isDangerous
                onConfirm={runGenerate}
                onCancel={() => setConfirmReplace(false)}
            />
        </div>
    );
}
