import { useCallback, useEffect, useState } from 'react';
import { Download, Trash2, X, Mail, Phone, MapPin, Building2, Clock } from 'lucide-react';
import CircularLoading from '../ui/CircularLoading';
import ConfirmationModal from '../ui/ConfirmationModal';
import Pagination from '../ui/Pagination';
import { careerApi, careerError, formatDate, APPLICATION_STATUSES } from '../../service/careerApi';

const statusBadge = {
    new: 'bg-blue-100 text-blue-700',
    reviewed: 'bg-gray-100 text-gray-700',
    shortlisted: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-green-100 text-green-700',
};

const select = 'border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white';

export default function ApplicationsPanel({ notify, jobFilter, setJobFilter }) {
    const [jobs, setJobs] = useState([]);
    const [apps, setApps] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        careerApi.adminJobs().then((d) => setJobs(d.jobs || [])).catch(() => { });
    }, []);

    // debounce search box
    useEffect(() => {
        const t = setTimeout(() => { setQuery(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await careerApi.applications({ job: jobFilter || undefined, status: status || undefined, q: query || undefined, page, limit });
            setApps(data.applications || []);
            setTotal(data.total);
            setPages(data.pages);
            setStatusCounts(data.statusCounts || {});
        } catch (err) {
            notify(careerError(err, 'Failed to load applications.'), 'error');
        } finally {
            setLoading(false);
        }
    }, [jobFilter, status, query, page, limit, notify]);

    useEffect(() => { load(); }, [load]);

    const open = (app) => {
        setSelected(app);
        setNotes(app.adminNotes || '');
        // Opening a "new" application marks it as reviewed so the admin's "new" badge stays meaningful.
        if (app.status === 'new') patch(app._id, { status: 'reviewed' }, true);
    };

    const patch = async (id, payload, silent = false) => {
        try {
            const data = await careerApi.updateApplication(id, payload);
            setSelected((s) => (s && s._id === id ? data.application : s));
            setApps((list) => list.map((a) => (a._id === id ? data.application : a)));
            if (!silent) notify(data.message || 'Updated');
            if (payload.status) load();
        } catch (err) {
            notify(careerError(err, 'Failed to update application.'), 'error');
        }
    };

    const download = async (app) => {
        try {
            await careerApi.downloadResume(app._id, app.resume?.originalName || `${app.name}-resume`);
        } catch (err) {
            notify(careerError(err, 'Could not download resume.'), 'error');
        }
    };

    const confirmDelete = async () => {
        const app = toDelete;
        setToDelete(null);
        try {
            await careerApi.deleteApplication(app._id);
            notify('Application deleted');
            setSelected(null);
            load();
        } catch (err) {
            notify(careerError(err, 'Failed to delete application.'), 'error');
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-3 mb-4">
                <input
                    className={`${select} flex-1 min-w-[200px]`}
                    placeholder="Search name, email, phone or job…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className={select} value={jobFilter} onChange={(e) => { setJobFilter(e.target.value); setPage(1); }}>
                    <option value="">All jobs</option>
                    {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
                </select>
                <select className={select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                    <option value="">All statuses</option>
                    {APPLICATION_STATUSES.map(([v, l]) => <option key={v} value={v}>{l} ({statusCounts[v] || 0})</option>)}
                </select>
            </div>

            {loading ? (
                <CircularLoading />
            ) : apps.length === 0 ? (
                <div className="text-center text-gray-500 py-12 border border-dashed border-gray-300 rounded">No applications found.</div>
            ) : (
                <>
                    <div className="overflow-x-auto border border-gray-200 rounded bg-white">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Applicant</th>
                                    <th className="px-4 py-3 font-semibold">Applied For</th>
                                    <th className="px-4 py-3 font-semibold">Experience</th>
                                    <th className="px-4 py-3 font-semibold">Applied On</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Resume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {apps.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => open(app)}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{app.name}</p>
                                            <p className="text-xs text-gray-500">{app.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{app.jobTitle}</td>
                                        <td className="px-4 py-3 text-gray-600">{app.experience || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatDate(app.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusBadge[app.status]}`}>{app.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => download(app)} className="p-2 rounded hover:bg-gray-100" title="Download resume" aria-label="Download resume"><Download size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={page}
                        totalPages={pages}
                        totalItems={total}
                        itemsPerPage={limit}
                        onPageChange={setPage}
                        onLimitChange={(n) => { setLimit(n); setPage(1); }}
                    />
                </>
            )}

            {/* Detail drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
                    <aside className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{selected.name}</h3>
                                <p className="text-sm text-gray-500">Applied for {selected.jobTitle}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100" aria-label="Close"><X size={18} /></button>
                        </div>

                        <ul className="space-y-2 text-sm text-gray-700 mb-5">
                            <li className="flex items-center gap-2"><Mail size={15} className="text-gray-400" /><a className="hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></li>
                            <li className="flex items-center gap-2"><Phone size={15} className="text-gray-400" /><a className="hover:underline" href={`tel:${selected.phone}`}>{selected.phone}</a></li>
                            {selected.city && <li className="flex items-center gap-2"><MapPin size={15} className="text-gray-400" />{selected.city}</li>}
                            {selected.currentCompany && <li className="flex items-center gap-2"><Building2 size={15} className="text-gray-400" />{selected.currentCompany}</li>}
                            {selected.experience && <li className="flex items-center gap-2"><Clock size={15} className="text-gray-400" />{selected.experience} experience</li>}
                        </ul>

                        {selected.coverLetter && (
                            <div className="mb-5">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cover note</p>
                                <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded p-3">{selected.coverLetter}</p>
                            </div>
                        )}

                        <button onClick={() => download(selected)} className="w-full flex items-center justify-center gap-2 border border-primary text-primary font-semibold rounded py-2 mb-5 hover:bg-primary hover:text-white transition-colors">
                            <Download size={16} /> Download Resume
                        </button>

                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                        <select className={`${select} w-full mb-5`} value={selected.status} onChange={(e) => patch(selected._id, { status: e.target.value })}>
                            {APPLICATION_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>

                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Internal notes</label>
                        <textarea className={`${select} w-full`} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to admins" />
                        <button onClick={() => patch(selected._id, { adminNotes: notes })} className="mt-2 px-4 py-2 rounded bg-primary text-white text-sm font-semibold hover:bg-gray-800">Save Notes</button>

                        <button onClick={() => setToDelete(selected)} className="mt-8 flex items-center gap-1.5 text-red-500 text-sm hover:underline">
                            <Trash2 size={15} /> Delete application
                        </button>
                    </aside>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!toDelete}
                isDangerous
                title="Delete this application?"
                message={`${toDelete?.name}'s application and resume will be permanently deleted.`}
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </>
    );
}
