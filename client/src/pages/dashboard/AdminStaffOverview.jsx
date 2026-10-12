import React, { useEffect, useState } from 'react';
import { BarChart3, LoaderCircle, RefreshCw } from 'lucide-react';
import { adminOperationsApi, apiError } from '../../service/adminOperationsApi';

const roleLabel = (value) => value.split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

export default function AdminStaffOverview() {
    const [position, setPosition] = useState('mechanic');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const response = await adminOperationsApi.staffOverview(position);
            setData(response.data);
            setError('');
        } catch (err) {
            setError(apiError(err, 'Could not load staff overview.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [position]);

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Operations</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-secondary">Staff overview</h1>
                    <p className="mt-1 text-sm text-gray-500">Review attendance, distance, leads, and completed work by role.</p>
                </div>
                <div className="flex gap-2">
                    <select value={position} onChange={(event) => setPosition(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                        <option value="mechanic">Mechanics</option>
                        <option value="delivery">Delivery</option>
                        <option value="telecaller">Telecallers</option>
                        <option value="operational manager">Operational managers</option>
                    </select>
                    <button onClick={load} className="rounded-xl border border-gray-200 bg-white p-2.5"><RefreshCw size={17} /></button>
                </div>
            </div>

            {loading ? <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary" /></div> : error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : <>
                <div className="grid gap-4 sm:grid-cols-4">
                    {[
                        ['Staff', data?.summary?.staff],
                        ['Present', data?.summary?.present],
                        ['Distance', `${data?.summary?.totalKm || 0} km`],
                        ['Completed orders', data?.summary?.completedOrders],
                    ].map(([label, value]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-2xl font-extrabold text-secondary">{value || 0}</p><p className="text-sm text-gray-500">{label}</p></div>)}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-secondary"><BarChart3 size={17} className="text-primary" /> {roleLabel(position)}</div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(data?.rows || []).map((row) => <div key={row.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-secondary">{row.name}</h2><p className="text-xs capitalize text-gray-500">{row.position}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{row.attendance?.daysPresent || 0} days</span></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xl font-extrabold text-secondary">{row.distance?.km || 0} km</p><p className="text-gray-500">Distance</p></div><div><p className="text-xl font-extrabold text-secondary">{position === 'telecaller' || row.position === 'telecaller' ? row.leads?.converted || 0 : row.orders?.completed || 0}</p><p className="text-gray-500">{row.position === 'telecaller' ? 'Converted' : 'Completed'}</p></div></div></div>)}
                </div>
                {!data?.rows?.length && <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">No staff found.</div>}
            </>}
        </div>
    );
}
