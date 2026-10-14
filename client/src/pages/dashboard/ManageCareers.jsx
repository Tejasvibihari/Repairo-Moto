import { useCallback, useState } from 'react';
import Heading from '../../components/ui/Heading';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import JobsPanel from '../../components/careers/JobsPanel';
import ApplicationsPanel from '../../components/careers/ApplicationsPanel';

export default function ManageCareers() {
    const [tab, setTab] = useState('jobs');
    const [jobFilter, setJobFilter] = useState('');
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const notify = useCallback((message, severity = 'success') => setSnack({ open: true, message, severity }), []);

    const tabClass = (t) =>
        `px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`;

    return (
        <>
            <Heading heading="Careers" />

            <div className="flex gap-2 border-b border-gray-200 my-4">
                <button className={tabClass('jobs')} onClick={() => setTab('jobs')}>Job Openings</button>
                <button className={tabClass('applications')} onClick={() => setTab('applications')}>Applications</button>
            </div>

            {tab === 'jobs' ? (
                <JobsPanel
                    notify={notify}
                    onViewApplications={(jobId) => { setJobFilter(jobId); setTab('applications'); }}
                />
            ) : (
                <ApplicationsPanel notify={notify} jobFilter={jobFilter} setJobFilter={setJobFilter} />
            )}

            <AlertSnackBar
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            />
        </>
    );
}
