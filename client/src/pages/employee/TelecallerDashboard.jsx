import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlarmClock, ArrowRight, CalendarCheck, CheckCircle2, LoaderCircle, Plus, RefreshCw, Users } from 'lucide-react';
import { leadApi, leadError } from '../../service/leadApi';

const cards = [
    { key: 'totalAssigned', label: 'Total leads', icon: Users, tone: 'bg-blue-50 text-blue-600' },
    { key: 'newToday', label: 'Added today', icon: Plus, tone: 'bg-violet-50 text-violet-600' },
    { key: 'followUpsToday', label: 'Follow-ups today', icon: AlarmClock, tone: 'bg-amber-50 text-amber-600' },
    { key: 'bookedCount', label: 'Booked', icon: CalendarCheck, tone: 'bg-emerald-50 text-emerald-600' },
];

export default function TelecallerDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setError('');
            const response = await leadApi.dashboard();
            setData(response.data);
        } catch (err) {
            setError(leadError(err, 'Unable to load your lead dashboard.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="animate-spin text-primary" /></div>;
    if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700"><p>{error}</p><button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white"><RefreshCw size={15} /> Try again</button></div>;

    const counts = data?.countsByStatus || {};
    const max = Math.max(1, ...Object.values(counts));
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Telecaller workspace</p><h1 className="mt-1 text-3xl font-extrabold text-secondary">Good to see you back</h1><p className="mt-1 text-sm text-gray-500">Keep every conversation moving and every follow-up visible.</p></div>
                <div className="flex gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"><RefreshCw size={16} /> Refresh</button><Link to="/employee/leads/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-secondary shadow-sm"><Plus size={17} /> Add lead</Link></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ key, label, icon: Icon, tone }) => <div key={key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></div><p className="text-3xl font-extrabold text-secondary">{data?.[key] || 0}</p><p className="mt-1 text-sm text-gray-500">{label}</p></div>)}</div>
            <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold text-secondary">Lead pipeline</h2><p className="text-sm text-gray-500">Your current lead status mix</p></div><Link to="/employee/leads" className="inline-flex items-center gap-1 text-sm font-bold text-primary">View all <ArrowRight size={15} /></Link></div><div className="space-y-4">{Object.entries(counts).length ? Object.entries(counts).map(([status, count]) => <div key={status}><div className="mb-1 flex justify-between text-sm"><span className="capitalize text-gray-600">{status.replace('_', ' ')}</span><span className="font-bold text-secondary">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-primary" style={{ width: `${(count / max) * 100}%` }} /></div></div>) : <p className="text-sm text-gray-500">Your lead pipeline will appear here.</p>}</div></section>
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold text-secondary">Recent leads</h2><Link to="/employee/leads" className="text-sm font-bold text-primary">See all</Link></div><div className="divide-y divide-gray-100">{(data?.recentLeads || []).slice(0, 5).map((lead) => <Link key={lead._id} to={`/employee/leads/${lead._id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-bold text-secondary">{lead.customer?.name}</p><p className="mt-1 truncate text-xs text-gray-500">{lead.customer?.phone}</p></div><span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold capitalize text-gray-600">{lead.status?.replace('_', ' ')}</span></Link>)}{!data?.recentLeads?.length && <p className="text-sm text-gray-500">No leads yet.</p>}</div></section>
            </div>
            <div className="rounded-2xl bg-secondary p-6 text-white"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xl font-bold">Follow-ups need attention</p><p className="mt-1 text-sm text-gray-300">{data?.overdueFollowUps || 0} overdue follow-ups are waiting for action.</p></div><Link to="/employee/leads?status=follow_up" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-secondary">Open follow-ups</Link></div></div>
        </div>
    );
}
