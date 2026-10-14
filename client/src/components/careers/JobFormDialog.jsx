import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { careerApi, careerError, JOB_TYPES, JOB_STATUSES } from '../../service/careerApi';

const field = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
const label = 'block text-xs font-semibold text-gray-600 mb-1';

const blank = {
    title: '', department: '', location: 'Patna', jobType: 'Full-time', experience: '',
    salary: '', openings: 1, description: '', requirements: '', lastDate: '', status: 'open',
};

export default function JobFormDialog({ open, job, onClose, onSaved }) {
    const [form, setForm] = useState(blank);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        setError('');
        setForm(
            job
                ? { ...blank, ...job, lastDate: job.lastDate ? String(job.lastDate).slice(0, 10) : '' }
                : blank
        );
    }, [open, job]);

    if (!open) return null;

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            title: form.title, department: form.department, location: form.location,
            jobType: form.jobType, experience: form.experience, salary: form.salary,
            openings: Number(form.openings) || 1, description: form.description,
            requirements: form.requirements, lastDate: form.lastDate || null, status: form.status,
        };
        try {
            setSaving(true);
            const data = job ? await careerApi.updateJob(job._id, payload) : await careerApi.createJob(payload);
            onSaved(data.message || 'Saved');
        } catch (err) {
            setError(careerError(err, 'Failed to save job.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <form
                onSubmit={submit}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{job ? 'Edit Job' : 'Post a New Job'}</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className={label}>Job title *</label>
                        <input className={field} value={form.title} onChange={set('title')} required placeholder="e.g. Bike Mechanic" />
                    </div>
                    <div>
                        <label className={label}>Department</label>
                        <input className={field} value={form.department} onChange={set('department')} placeholder="e.g. Operations" />
                    </div>
                    <div>
                        <label className={label}>Location</label>
                        <input className={field} value={form.location} onChange={set('location')} />
                    </div>
                    <div>
                        <label className={label}>Job type</label>
                        <select className={field} value={form.jobType} onChange={set('jobType')}>
                            {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={label}>Experience</label>
                        <input className={field} value={form.experience} onChange={set('experience')} placeholder="e.g. 1-3 years" />
                    </div>
                    <div>
                        <label className={label}>Salary</label>
                        <input className={field} value={form.salary} onChange={set('salary')} placeholder="e.g. ₹15,000 - ₹25,000 / month" />
                    </div>
                    <div>
                        <label className={label}>Openings</label>
                        <input className={field} type="number" min={1} value={form.openings} onChange={set('openings')} />
                    </div>
                    <div>
                        <label className={label}>Last date to apply</label>
                        <input className={field} type="date" value={form.lastDate} onChange={set('lastDate')} />
                    </div>
                    <div>
                        <label className={label}>Status</label>
                        <select className={field} value={form.status} onChange={set('status')}>
                            {JOB_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label}>Description *</label>
                        <textarea className={field} rows={5} value={form.description} onChange={set('description')} required placeholder="What the person will do…" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label}>Requirements</label>
                        <textarea className={field} rows={4} value={form.requirements} onChange={set('requirements')} placeholder="One per line works well" />
                    </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">Only jobs with status “Open” (and a last date that has not passed) appear on the website.</p>
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                <div className="flex justify-end gap-3 mt-5">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={saving} className="px-5 py-2 rounded bg-primary text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60">
                        {saving ? 'Saving…' : job ? 'Save Changes' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    );
}
