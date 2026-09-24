import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';
import axiosClient from '../../service/axiosClient';
import { setBrands } from '../../app/slice/brandSlice';
import TotalBookingsCard from '../../components/TotalBookingCard';
import OrderStatusCard from '../../components/OrderStatusCard';
import TotalRevenueCard from '../../components/TotalRevenueCard';
import StaffCountCard from '../../components/StaffCountCard';
import CompletedOrdersChart from '../../components/CompletedOrdersChart';
import RevenueChart from '../../components/RevenueChart';

const PERIODS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' },
];

export default function Dashboard() {
    const dispatch = useDispatch();
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' });
    const [period, setPeriod] = useState('month');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Brands stay cached in redux for the forms elsewhere that need them.
        (async () => {
            try {
                const response = await axiosClient.get('/api/admin/brands/getBrands');
                dispatch(setBrands(response.data));
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        })();
    }, [dispatch]);

    useEffect(() => {
        // The old dashboard counted only the first page of /getallorder, so every
        // KPI was silently capped at 10. The server aggregates these properly.
        (async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/api/admin/dashboard?period=${period}`);
                setStats(response.data?.data || null);
            } catch (error) {
                console.error('Error fetching dashboard:', error);
                setSnack({
                    open: true,
                    message: error.response?.data?.message || 'Could not load dashboard stats.',
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [period]);

    const kpi = stats?.kpi || {};
    const orderStatus = stats?.orderStatus || {};
    const payments = stats?.payments || {};
    const recentOrders = stats?.recentOrders || [];

    return (
        <>
            <AlertSnackBar
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            />

            <div className="p-4 md:p-8 bg-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h1 className="text-2xl font-bold">Overview</h1>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-amber-500 focus:border-amber-500"
                    >
                        {PERIODS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16"><CircularLoading /></div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <TotalBookingsCard totalBookings={kpi.totalOrders || 0} />
                            <OrderStatusCard status="Pending" count={orderStatus.pending || 0} />
                            <OrderStatusCard status="In Progress" count={orderStatus.inProgress || 0} />
                            <OrderStatusCard status="Completed" count={orderStatus.completed || 0} />
                            <TotalRevenueCard revenue={kpi.periodRevenue || 0} />
                            <StaffCountCard type="Mechanics" count={kpi.totalMechanics || 0} />
                            <StaffCountCard type="Vendors" count={kpi.totalVendors || 0} />
                            <StaffCountCard type="Users" count={kpi.totalUsers || 0} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            {[
                                { label: 'Unpaid', value: payments.unpaid || 0, cls: 'text-red-600' },
                                { label: 'Partially Paid', value: payments.partial || 0, cls: 'text-amber-600' },
                                { label: 'Paid', value: payments.paid || 0, cls: 'text-green-600' },
                            ].map((p) => (
                                <div key={p.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <p className="text-sm text-gray-500">{p.label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${p.cls}`}>{p.value}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="w-full"><CompletedOrdersChart /></div>
                <div className="w-full"><RevenueChart /></div>
            </div>

            {recentOrders.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
                    <h2 className="text-lg font-semibold px-5 pt-5 pb-3">Recent Orders</h2>
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Order Id</th>
                                <th className="px-4 py-2 text-left">Customer</th>
                                <th className="px-4 py-2 text-left">City</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-right">Payable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{order.orderId}</td>
                                    <td className="px-4 py-2">{order.name}</td>
                                    <td className="px-4 py-2 text-gray-600">{order.city}</td>
                                    <td className="px-4 py-2 text-gray-600">{order.status}</td>
                                    <td className="px-4 py-2 text-right">
                                        ₹{(order.total?.finalPayable ?? order.total?.total ?? 0).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
