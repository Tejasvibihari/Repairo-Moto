import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2, Wrench, X } from 'lucide-react';
import { serviceApi, formatDuration, formatPrice } from '../../service/serviceApi';
import { apiError } from '../../service/adminOperationsApi';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ServiceDescriptionEditor from '../../components/ServiceDescriptionEditor';
import { descriptionToHtml, htmlToLine, normalizeDescription } from '../../utils/richText';

const inputCls = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary';
// Matches the server limit. The description is stored as HTML, so tags count too.
const MAX_DESCRIPTION = 2000;
const emptyForm = { name: '', description: '', price: '', priority: '', estimatedMinutes: '' };

const byPriority = (a, b) => (a.priority - b.priority) || a.name.localeCompare(b.name);

// Shared by the admin panel (/manage-services) and the manager panel
// (/employee/manager-services). The server only allows Admin, Manager and
// Operational Manager.
export default function ManageServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busyId, setBusyId] = useState(null);
    const [query, setQuery] = useState('');

    const [dialog, setDialog] = useState(null); // null | { id?: string, form }
    const [saving, setSaving] = useState(false);
    const [dialogError, setDialogError] = useState('');
    const [toDelete, setToDelete] = useState(null);

    const flash = (message) => { setNotice(message); setError(''); };
    const fail = (err, fallback) => { setError(apiError(err, fallback)); setNotice(''); };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await serviceApi.list();
            setServices(res.data?.services || []);
            setError('');
        } catch (err) {
            fail(err, 'Could not load services.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return services;
        return services.filter((s) => s.name.toLowerCase().includes(q) || htmlToLine(s.description).toLowerCase().includes(q));
    }, [services, query]);

    // ── add / edit ─────────────────────────────────────────────────────────
    const openAdd = () => { setDialogError(''); setDialog({ form: { ...emptyForm } }); };
    const openEdit = (s) => {
        setDialogError('');
        setDialog({
            id: s._id,
            form: {
                name: s.name,
                description: descriptionToHtml(s.description),
                price: s.price,
                priority: s.priority,
                estimatedMinutes: s.estimatedMinutes,
            },
        });
    };
    const setForm = (patch) => setDialog((d) => ({ ...d, form: { ...d.form, ...patch } }));

    const saveDialog = async (e) => {
        e.preventDefault();
        const f = dialog.form;
        const name = f.name.trim();
        if (!name) { setDialogError('Service name is required.'); return; }
        if (f.price === '' || Number(f.price) < 0) { setDialogError('Enter a valid price (0 or more).'); return; }
        if (f.estimatedMinutes === '' || Number(f.estimatedMinutes) < 1) { setDialogError('Approx. time must be at least 1 minute.'); return; }
        if (f.priority !== '' && (!Number.isInteger(Number(f.priority)) || Number(f.priority) < 0)) { setDialogError('Priority must be a whole number (0 or more).'); return; }

        const description = normalizeDescription(f.description);
        if (description.length > MAX_DESCRIPTION) { setDialogError(`Description is too long (${description.length}/${MAX_DESCRIPTION} characters including formatting). Please shorten it.`); return; }

        const payload = {
            name,
            description,
            price: Number(f.price),
            estimatedMinutes: Number(f.estimatedMinutes),
        };
        if (f.priority !== '') payload.priority = Number(f.priority);

        setSaving(true);
        setDialogError('');
        try {
            if (dialog.id) {
                const res = await serviceApi.update(dialog.id, payload);
                setServices((cur) => cur.map((s) => (s._id === dialog.id ? res.data.service : s)).sort(byPriority));
                flash('Service updated.');
            } else {
                const res = await serviceApi.create(payload);
                setServices((cur) => [...cur, res.data.service].sort(byPriority));
                flash('Service added.');
            }
            setDialog(null);
        } catch (err) {
            setDialogError(apiError(err, 'Could not save the service.'));
        } finally {
            setSaving(false);
        }
    };

    // ── delete ─────────────────────────────────────────────────────────────
    const confirmDelete = async () => {
        const svc = toDelete;
        setToDelete(null);
        if (!svc) return;
        setBusyId(svc._id);
        try {
            await serviceApi.remove(svc._id);
            setServices((cur) => cur.filter((s) => s._id !== svc._id));
            flash('Service deleted.');
        } catch (err) {
            fail(err, 'Could not delete the service.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Operations</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-secondary">Services</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage the services you offer: price, description, display order and the approximate time to complete each one.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="rounded-xl border border-gray-200 bg-white p-2.5" title="Refresh"><RefreshCw size={17} /></button>
                    <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-secondary"><Plus size={17} /> Add service</button>
                </div>
            </div>

            {(error || notice) && (
                <p className={`rounded-xl p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || notice}</p>
            )}

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-6">
                    <div className="flex items-center gap-3">
                        <Wrench className="text-primary" size={21} />
                        <h2 className="text-lg font-bold text-secondary">All services <span className="text-sm font-semibold text-gray-400">({services.length})</span></h2>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services" className="w-60 rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-14"><LoaderCircle className="animate-spin text-primary" /></div>
                ) : visible.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-500">{services.length ? 'No services match your search.' : 'No services yet. Click “Add service” to create the first one.'}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-4 py-3">Service</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Approx. time</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visible.map((s) => (
                                    <tr key={s._id}>
                                        <td className="px-6 py-4 font-bold text-secondary">{s.priority}</td>
                                        <td className="px-4 py-4">
                                            <p className="font-bold text-secondary">{s.name}</p>
                                            {s.description && <p className="mt-0.5 max-w-md truncate text-xs text-gray-500" title={htmlToLine(s.description)}>{htmlToLine(s.description)}</p>}
                                        </td>
                                        <td className="px-4 py-4 font-semibold">{formatPrice(s.price)}</td>
                                        <td className="px-4 py-4">{formatDuration(s.estimatedMinutes)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(s)} disabled={busyId === s._id} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-primary" title="Edit"><Pencil size={15} /></button>
                                                <button onClick={() => setToDelete(s)} disabled={busyId === s._id} className="rounded-lg border border-gray-200 p-2 text-red-500 hover:border-red-300" title="Delete"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Add / edit dialog */}
            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setDialog(null)} />
                    <form onSubmit={saveDialog} className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-secondary">{dialog.id ? 'Edit service' : 'Add service'}</h2>
                            <button type="button" onClick={() => setDialog(null)} className="rounded-lg p-1 text-gray-400 hover:text-gray-700"><X size={18} /></button>
                        </div>

                        <label className="mt-5 block text-sm font-semibold text-gray-600">Service name
                            <input required maxLength={120} value={dialog.form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="e.g. General service" className={inputCls} />
                        </label>
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
                                <span>Description <span className="font-normal text-gray-400">(optional)</span></span>
                                {(() => {
                                    const len = normalizeDescription(dialog.form.description).length;
                                    return <span className={`text-xs font-medium ${len > MAX_DESCRIPTION ? 'text-red-600' : 'text-gray-400'}`}>{len}/{MAX_DESCRIPTION}</span>;
                                })()}
                            </div>
                            {/* keyed so opening another service loads its own text */}
                            <ServiceDescriptionEditor
                                key={dialog.id || 'new'}
                                initialValue={dialog.form.description}
                                onChange={(html) => setForm({ description: html })}
                            />
                            <p className="mt-1.5 text-xs text-gray-500">Use bold, bullet points or links to explain what is included. The full text is shown here; lists and invoice pickers show a one-line preview.</p>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <label className="text-sm font-semibold text-gray-600">Price (₹)
                                <input required type="number" min="0" step="any" value={dialog.form.price} onChange={(e) => setForm({ price: e.target.value })} className={inputCls} />
                            </label>
                            <label className="text-sm font-semibold text-gray-600">Approx. time (min)
                                <input required type="number" min="1" step="1" value={dialog.form.estimatedMinutes} onChange={(e) => setForm({ estimatedMinutes: e.target.value })} className={inputCls} />
                            </label>
                            <label className="text-sm font-semibold text-gray-600">Priority
                                <input type="number" min="0" step="1" value={dialog.form.priority} onChange={(e) => setForm({ priority: e.target.value })} placeholder="0" className={inputCls} />
                            </label>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {Number(dialog.form.estimatedMinutes) >= 1 && <>Shown as <b>{formatDuration(dialog.form.estimatedMinutes)}</b>. </>}
                            Priority is the display order: a lower number is shown first.
                        </p>

                        {dialogError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{dialogError}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setDialog(null)} disabled={saving} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600">Cancel</button>
                            <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-secondary disabled:opacity-50">
                                {saving && <LoaderCircle size={16} className="animate-spin" />} {dialog.id ? 'Save changes' : 'Add service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!toDelete}
                title="Delete this service?"
                message={toDelete ? `“${toDelete.name}” will be permanently removed. This cannot be undone.` : ''}
                confirmText="Delete"
                cancelText="Keep it"
                isDangerous
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </div>
    );
}
