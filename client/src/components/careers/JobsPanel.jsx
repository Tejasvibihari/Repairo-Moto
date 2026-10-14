import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import CircularLoading from '../ui/CircularLoading';
import ConfirmationModal from '../ui/ConfirmationModal';
import JobFormDialog from './JobFormDialog';
import { careerApi, careerError, formatDate } from '../../service/careerApi';

const badge = {
    open: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-700',
    closed: 'bg-red-100 text-red-700',
};

export default function JobsPanel({ notify, onViewApplications }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState({ open: false, job: null });
    const [toDelete, setToDelete] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setJobs((await careerApi.adminJobs()).jobs || []);
        } catch (err) {
            notify(careerError(err, 'Failed to load jobs.'), 'error');
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => { load(); }, [load]);

    const confirmDelete = async () => {
        const job = toDelete;
        setToDelete(null);
        try {
            const data = await careerApi.deleteJob(job._id);
            notify(data.message || 'Job deleted');
            load();
        } catch (err) {
            notify(careerError(err, 'Failed to delete job.'), 'error');
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">{jobs.length} job{jobs.length === 1 ? '' : 's'}</p>
                <button
                    onClick={() => setDialog({ open: true, job: null })}
                    className="flex items-center gap-1.5 bg-primary hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded"
                >
                    <Plus size={16} /> Post New Job
                </button>
            </div>

            {loading ? (
                <CircularLoading />
            ) : jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-12 border border-dashed border-gray-300 rounded">
                    No jobs posted yet. Click “Post New Job” to create the first opening.
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Type / Location</th>
                                <th className="px-4 py-3 font-semibold">Last Date</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Applications</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jobs.map((job) => (
                                <tr key={job._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{job.title}</p>
                                        {job.department && <p className="text-xs text-gray-500">{job.department}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{job.jobType}<br /><span className="text-xs">{job.location}</span></td>
                                    <td className="px-4 py-3 text-gray-600">{formatDate(job.lastDate)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${badge[job.status]}`}>{job.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onViewApplications(job._id)}
                                            className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
                                        >
                                            <Users size={15} /> {job.applicationCount}
                                            {job.newApplicationCount > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{job.newApplicationCount} new</span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => setDialog({ open: true, job })} className="p-2 rounded hover:bg-gray-100" title="Edit" aria-label="Edit job"><Pencil size={16} /></button>
                                            <button onClick={() => setToDelete(job)} className="p-2 rounded hover:bg-red-50 text-red-500" title="Delete" aria-label="Delete job"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <JobFormDialog
                open={dialog.open}
                job={dialog.job}
                onClose={() => setDialog({ open: false, job: null })}
                onSaved={(msg) => {
                    setDialog({ open: false, job: null });
                    notify(msg);
                    load();
                }}
            />

            <ConfirmationModal
                isOpen={!!toDelete}
                isDangerous
                title="Delete this job?"
                message={`“${toDelete?.title}” and all of its applications and resumes will be permanently deleted. To just stop accepting applications, set the status to Closed instead.`}
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </>
    );
}
