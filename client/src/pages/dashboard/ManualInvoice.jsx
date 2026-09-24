import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, FileText, RotateCcw } from 'lucide-react';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { deleteManualInvoice, formatMoney, listManualInvoices } from '../../service/manualInvoiceApi';

const STATUS_CLASSES = {
    paid: 'bg-green-50 text-green-700',
    unpaid: 'bg-red-50 text-red-700',
    draft: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-orange-50 text-orange-700',
};

const EMPTY_FILTERS = { search: '', status: '', startDate: '', endDate: '', sortBy: '' };

export default function ManualInvoice() {
    const navigate = useNavigate();

    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });

    const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listManualInvoices({ page, limit, ...filters });
            setInvoices(res.data?.data || []);
            setPagination(res.data?.pagination || { page, pages: 1, total: 0, limit });
        } catch (error) {
            showSnack(error.response?.data?.message || 'Could not load invoices.', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const applyFilters = () => {
        setFilters(draftFilters);
        setPage(1);
    };

    const clearFilters = () => {
        setDraftFilters(EMPTY_FILTERS);
        setFilters(EMPTY_FILTERS);
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteManualInvoice(deleteTarget._id);
            showSnack(`Invoice ${deleteTarget.invoiceNumber} deleted.`);
            fetchInvoices();
        } catch (error) {
            showSnack(error.response?.data?.message || 'Could not delete the invoice.', 'error');
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <>
            <AlertSnackBar
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            />

            <ConfirmationModal
                isOpen={Boolean(deleteTarget)}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete invoice"
                message={`Delete invoice ${deleteTarget?.invoiceNumber || ''}? This cannot be undone.`}
                confirmText="Delete"
                isDangerous
            />

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Manual Invoices</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Off-app billing — walk-ins, phone leads and cash jobs.
                        </p>
                    </div>
                    <Link
                        to="/manual-invoice/create"
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                        <Plus size={18} /> New Invoice
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                    <div className="grid md:grid-cols-5 gap-3">
                        <div className="md:col-span-2 relative">
                            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                value={draftFilters.search}
                                onChange={(e) => setDraftFilters({ ...draftFilters, search: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Invoice no., customer name, phone or email"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        <select
                            value={draftFilters.status}
                            onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="draft">Draft</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <input
                            type="date"
                            value={draftFilters.startDate}
                            onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        />
                        <input
                            type="date"
                            value={draftFilters.endDate}
                            onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                        <button onClick={clearFilters} className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                            <RotateCcw size={15} /> Clear
                        </button>
                        <button onClick={applyFilters} className="px-5 py-2 text-sm bg-secondary text-white rounded-lg hover:opacity-90">
                            Apply Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <CircularLoading />
                        <span className="mt-3 text-gray-600">Loading invoices...</span>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl">
                        <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No invoices found</p>
                        <Link to="/manual-invoice/create" className="mt-3 inline-block text-amber-600 hover:underline">
                            Create the first one
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Invoice No.</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Customer</th>
                                        <th className="px-4 py-3 text-left">Vehicle</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-right">Paid</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.map((inv) => (
                                        <tr key={inv._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{inv.customerDetails?.name || '-'}</div>
                                                <div className="text-xs text-gray-500">{inv.customerDetails?.contactNo || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {[inv.vehicleDetails?.brand, inv.vehicleDetails?.model].filter(Boolean).join(' ') || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                {formatMoney(inv.total?.finalPayable ?? inv.total?.total)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">
                                                {formatMoney(inv.paymentDetails?.amountPaid)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_CLASSES[inv.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/manual-invoice/${inv._id}`)}
                                                        title="View"
                                                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/manual-invoice/${inv._id}/edit`)}
                                                        title="Edit"
                                                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(inv)}
                                                        title="Delete"
                                                        className="p-2 rounded-lg border border-gray-200 text-red-500 hover:border-red-300 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.page || page}
                                totalPages={pagination.pages || 1}
                                totalItems={pagination.total || 0}
                                itemsPerPage={limit}
                                onPageChange={setPage}
                                onLimitChange={(l) => { setLimit(l); setPage(1); }}
                                limitOptions={[10, 20, 50, 100]}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
