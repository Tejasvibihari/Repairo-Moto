import React, { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, Megaphone, RefreshCw, Send } from 'lucide-react';
import { adminOperationsApi, apiError } from '../../service/adminOperationsApi';

const statusStyle = {
    sent: 'bg-emerald-50 text-emerald-700',
    scheduled: 'bg-blue-50 text-blue-700',
    sending: 'bg-amber-50 text-amber-700',
    failed: 'bg-red-50 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
};

export default function AdminNotificationsHistory() {
    const [form, setForm] = useState({ title: '', body: '', audienceType: 'all_users', inactiveDays: '30' });
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminOperationsApi.notifications();
            setCampaigns(response.data?.campaigns || []);
            setError('');
        } catch (err) {
            setError(apiError(err, 'Could not load notification history.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    const send = async (event) => {
        event.preventDefault();
        setSending(true);
        setError('');
        setSuccess('');
        try {
            const audience = form.audienceType === 'inactive_days'
                ? { type: 'inactive_days', inactiveDays: Number(form.inactiveDays) }
                : { type: form.audienceType };
            const response = await adminOperationsApi.createNotification({
                title: form.title.trim(),
                body: form.body.trim(),
                audience,
            });
            setSuccess(response.data?.message || 'Notification sent successfully.');
            setForm({ title: '', body: '', audienceType: 'all_users', inactiveDays: '30' });
            await loadHistory();
        } catch (err) {
            setError(apiError(err, 'Could not send notification.'));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Communication</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-secondary">Send notification</h1>
                    <p className="mt-1 text-sm text-gray-500">Send announcements and review every campaign saved in the database.</p>
                </div>
                <button onClick={loadHistory} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700">
                    <RefreshCw size={16} /> Refresh history
                </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                <form onSubmit={send} className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-primary"><Megaphone size={19} /></div><div><h2 className="font-bold text-secondary">New notification</h2><p className="text-xs text-gray-500">Saved as a campaign after sending</p></div></div>
                    <label className="block text-sm font-semibold text-gray-600">Title<input required maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary" placeholder="Weekend service offer" /></label>
                    <label className="block text-sm font-semibold text-gray-600">Message<textarea required maxLength={400} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="mt-1 min-h-32 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary" placeholder="Write your message" /></label>
                    <label className="block text-sm font-semibold text-gray-600">Audience<select value={form.audienceType} onChange={(e) => setForm({ ...form, audienceType: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary"><option value="all_users">All active customers</option><option value="inactive_days">Customers inactive for a period</option></select></label>
                    {form.audienceType === 'inactive_days' && <label className="block text-sm font-semibold text-gray-600">Inactive for days<input required type="number" min="1" max="730" value={form.inactiveDays} onChange={(e) => setForm({ ...form, inactiveDays: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm" /></label>}
                    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    {success && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
                    <button disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-secondary disabled:opacity-60">{sending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />} Send notification</button>
                </form>

                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 className="font-bold text-secondary">Notification history</h2><p className="text-xs text-gray-500">Campaigns loaded from the database</p></div><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{campaigns.length} records</span></div>
                    {loading ? <div className="flex justify-center py-16"><LoaderCircle className="animate-spin text-primary" /></div> : campaigns.length === 0 ? <div className="p-14 text-center text-sm text-gray-500">No notifications have been sent yet.</div> : <div className="divide-y divide-gray-100">{campaigns.map((campaign) => <div key={campaign._id} className="px-5 py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-secondary">{campaign.title}</h3><p className="mt-1 max-w-2xl text-sm text-gray-600">{campaign.body}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle[campaign.status] || statusStyle.cancelled}`}>{campaign.status}</span></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500"><span>Audience: {campaign.audience?.type?.replace('_', ' ') || '—'}</span><span>Recipients: {campaign.recipientCount || 0}</span><span>{campaign.sentAt ? `Sent ${new Date(campaign.sentAt).toLocaleString('en-IN')}` : `Created ${new Date(campaign.createdAt).toLocaleString('en-IN')}`}</span><span>By {campaign.createdBy?.name || 'Admin'}</span></div>{campaign.error && <p className="mt-2 text-xs text-red-600">{campaign.error}</p>}</div>)}</div>}
                </section>
            </div>
        </div>
    );
}
