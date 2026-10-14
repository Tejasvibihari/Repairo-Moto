import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { careerApi, careerError } from '../../service/careerApi';

const MAX_SIZE = 5 * 1024 * 1024;
const input =
    'p-3 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none';

const empty = { name: '', email: '', phone: '', city: '', experience: '', currentCompany: '', coverLetter: '', website: '' };

export default function ApplyForm({ jobId }) {
    const [form, setForm] = useState(empty);
    const [resume, setResume] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const onFile = (e) => {
        const file = e.target.files?.[0];
        setError('');
        if (!file) return setResume(null);
        if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
            e.target.value = '';
            return setError('Resume must be a PDF, DOC or DOCX file.');
        }
        if (file.size > MAX_SIZE) {
            e.target.value = '';
            return setError('Resume must be 5 MB or smaller.');
        }
        setResume(file);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!resume) return setError('Please attach your resume.');

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append('resume', resume);

        try {
            setSubmitting(true);
            await careerApi.apply(jobId, fd);
            setDone(true);
        } catch (err) {
            setError(careerError(err, 'Failed to submit application.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className="text-center py-10">
                <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} />
                <h3 className="text-2xl font-bold mb-2">Application submitted</h3>
                <p className="text-gray-600">Thanks for applying. We will contact you if your profile is shortlisted.</p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className={input} placeholder="Full name *" value={form.name} onChange={set('name')} required aria-label="Full name" />
            <input className={input} type="email" placeholder="Email (optional)" value={form.email} onChange={set('email')} aria-label="Email" />
            <input className={input} type="tel" placeholder="Phone *" value={form.phone} onChange={set('phone')} required aria-label="Phone" />
            <input className={input} placeholder="Current city" value={form.city} onChange={set('city')} aria-label="Current city" />
            <input className={input} placeholder="Total experience (e.g. 2 years)" value={form.experience} onChange={set('experience')} aria-label="Experience" />
            <input className={input} placeholder="Current / last company" value={form.currentCompany} onChange={set('currentCompany')} aria-label="Current company" />
            <textarea
                className={`${input} md:col-span-2`}
                rows={4}
                maxLength={3000}
                placeholder="Why do you want to join us? (optional)"
                value={form.coverLetter}
                onChange={set('coverLetter')}
                aria-label="Cover letter"
            />

            {/* Honeypot — hidden from people, bots fill it */}
            <input
                type="text"
                name="website"
                value={form.website}
                onChange={set('website')}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
            />

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume * (PDF, DOC, DOCX — max 5 MB)</label>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={onFile}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white file:font-semibold hover:file:bg-gray-800"
                />
            </div>

            {error && <p className="md:col-span-2 text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 bg-primary hover:bg-gray-800 disabled:opacity-60 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
            >
                {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
        </form>
    );
}
