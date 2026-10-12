import React, { useEffect, useState } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { adminOperationsApi, apiError } from '../../service/adminOperationsApi';

const today = () => new Date().toISOString().slice(0, 10);
const imageUrl = (path) => path ? `${import.meta.env.VITE_API_URL}${path}` : '';
const initials = (name = '') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export default function AdminAttendance() {
    const [date, setDate] = useState(today());
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const response = await adminOperationsApi.attendance(date, date);
            setRows(response.data.rows || []);
            setSummary(response.data.summary);
            setError('');
        } catch (err) {
            setError(apiError(err, 'Could not load attendance.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [date]);

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Operations</p><h1 className="mt-1 text-3xl font-extrabold text-secondary">Employee attendance</h1></div>
                <div className="flex gap-2"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" /><button onClick={load} className="rounded-xl border border-gray-200 bg-white p-2.5"><RefreshCw size={17} /></button></div>
            </div>
            {summary && <div className="grid gap-4 sm:grid-cols-4">{[['Present', summary.presentEmployees], ['Working', summary.working], ['On break', summary.onBreak], ['Total minutes', summary.totalMinutes]].map(([label, value]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-2xl font-extrabold text-secondary">{value || 0}</p><p className="text-sm text-gray-500">{label}</p></div>)}</div>}
            {loading ? <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary" /></div> : error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3 text-left">Employee</th><th className="px-5 py-3 text-left">Role</th><th className="px-5 py-3 text-left">Check in</th><th className="px-5 py-3 text-left">Check out</th><th className="px-5 py-3 text-right">Distance</th><th className="px-5 py-3 text-left">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row) => <tr key={row._id}><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-amber-100 text-center text-sm font-extrabold leading-10 text-amber-700">{row.profileImage ? <img src={imageUrl(row.profileImage)} alt={row.name} className="h-full w-full object-cover" /> : initials(row.name)}</div><div><p className="font-bold text-secondary">{row.name}</p><p className="text-xs text-gray-500">{row.phone || 'No phone number'}</p></div></div></td><td className="px-5 py-4 capitalize text-gray-600">{row.position}</td><td className="px-5 py-4 text-gray-600">{row.checkIn?.at ? new Date(row.checkIn.at).toLocaleTimeString('en-IN') : '--'}</td><td className="px-5 py-4 text-gray-600">{row.checkOut?.at ? new Date(row.checkOut.at).toLocaleTimeString('en-IN') : '--'}</td><td className="px-5 py-4 text-right font-bold">{((row.distanceMeters || 0) / 1000).toFixed(2)} km</td><td className="px-5 py-4 capitalize text-gray-600">{row.status?.replace('_', ' ')}</td></tr>)}</tbody></table>{!rows.length && <div className="p-12 text-center text-sm text-gray-500">No attendance records for this date.</div>}</div>}
        </div>
    );
}
