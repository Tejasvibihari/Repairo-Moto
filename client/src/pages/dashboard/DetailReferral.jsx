import React, { useEffect, useState } from 'react';
import { Eye, Edit3, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, Download } from 'lucide-react';
import axiosClient from '../../service/axiosClient';
import { useParams } from 'react-router-dom';
import AlertSnackBar from '../../components/ui/AlertSnackBar';


export default function AdminReferralDashboard() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [status, setStatus] = useState('pending');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
    const userId = useParams().userId; // Assuming you get userId from route params`   

    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    useEffect(() => {
        const getUserById = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/api/user/get-user-by-id/${userId}`);
                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };
        getUserById();
    }, [userId]);



    const filteredRequests = user.withdrawalRequests?.filter(request => {
        const matchesSearch = request.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.adminNote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.amount.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];


    const openModal = (request) => {
        setSelectedRequest(request);
        setAdminNote(request.adminNote || '');
        setTransactionId(request.transactionId || '');
        setStatus(request.status);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedRequest(null);
        setAdminNote('');
        setTransactionId('');
        setStatus('pending');
        setError('');
    };

    const handleUpdateRequest = async (e) => {
        e.preventDefault();
        if (!selectedRequest) return;

        setLoading(true);
        try {
            const response = await axiosClient.put(
                `/api/user/update/withdrawal-request/status/${user._id}`,
                {
                    requestId: selectedRequest._id,
                    status,
                    transactionId,
                    adminNote,
                }
            );

            // ✅ Check response status
            if (response.status === 200) {
                setError(response.data.message || "Request updated successfully");
                setSnackBarSeverity("success");

                // ✅ Update local state
                setUser((prevUser) => ({
                    ...prevUser,
                    withdrawalRequests: prevUser.withdrawalRequests.map((req) =>
                        req._id === selectedRequest._id
                            ? { ...req, status, transactionId, adminNote }
                            : req
                    ),
                }));

                setTimeout(() => {
                    closeModal();
                }, 2000);
            } else if (response.status === 404) {
                setError(response.data.message || "Not found");
                setSnackBarSeverity("warning");
            } else {
                setError(response.data.message || "Unexpected error");
                setSnackBarSeverity("error");
            }
        } catch (error) {
            console.error(error);

            // ✅ Differentiate error cases
            if (error.response) {
                if (error.response.status === 404) {
                    setError(error.response.data.message || "Not found");
                    setSnackBarSeverity("warning");
                } else {
                    setError(error.response.data.message || "Server error");
                    setSnackBarSeverity("error");
                }
            } else {
                setError("Network error, please try again later.");
                setSnackBarSeverity("error");
            }
        } finally {
            setSnackBarOpen(true);
            setLoading(false);
        }
    };


    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'approved': return <CheckCircle className="w-4 h-4" />;
            case 'paid': return <DollarSign className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const statusCounts = {
        total: user.withdrawalRequests?.length || 0,
        pending: user.withdrawalRequests?.filter(r => r.status === 'pending').length || 0,
        approved: user.withdrawalRequests?.filter(r => r.status === 'approved').length || 0,
        paid: user.withdrawalRequests?.filter(r => r.status === 'paid').length || 0,
        rejected: user.withdrawalRequests?.filter(r => r.status === 'rejected').length || 0,
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };
    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={error}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Compact User Header */}
                    <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <span>{user.email}</span>
                                    <span>•</span>
                                    <span>{user.phone}</span>
                                    <span>•</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                        {user.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 lg:mt-0 flex flex-wrap gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{user.referralCount || 0}</div>
                                    <div className="text-xs text-gray-500">Referrals</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">${(user.referralAmount || 0).toFixed(0)}</div>
                                    <div className="text-xs text-gray-500">Available</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">${(user.totalWithdrawn || 0).toFixed(0)}</div>
                                    <div className="text-xs text-gray-500">Withdrawn</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Withdrawal Management Section */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200">
                        {/* Header with Stats */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Withdrawal Management</h2>
                                    <div className="flex flex-wrap gap-4">
                                        {Object.entries(statusCounts).map(([key, count]) => (
                                            <div key={key} className="flex items-center gap-2 text-sm">
                                                <div className={`w-3 h-3 rounded-full ${key === 'total' ? 'bg-gray-400' :
                                                    key === 'pending' ? 'bg-yellow-400' :
                                                        key === 'approved' ? 'bg-green-400' :
                                                            key === 'paid' ? 'bg-blue-400' : 'bg-red-400'
                                                    }`}></div>
                                                <span className="capitalize text-gray-600">{key}: </span>
                                                <span className="font-medium text-gray-900">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                                }`}
                                        >
                                            Table
                                        </button>
                                        <button
                                            onClick={() => setViewMode('cards')}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                                }`}
                                        >
                                            Cards
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by transaction ID, note, or amount..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="paid">Paid</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {filteredRequests.length > 0 ? (
                                viewMode === 'table' ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-600">UPI ID</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Transaction ID</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Note</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredRequests.map((request) => (
                                                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <div className="font-semibold text-gray-900">${request.amount.toFixed(2)}</div>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-600">
                                                            {new Date(request.requestDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-600">
                                                            {request.upiId}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                                {getStatusIcon(request.status)}
                                                                {request.status}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-600">
                                                            {request.transactionId || '-'}
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                                                            {request.adminNote || '-'}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <button
                                                                onClick={() => openModal(request)}
                                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                                            >
                                                                <Edit3 className="w-3 h-3" />
                                                                Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredRequests.map((request) => (
                                            <div key={request._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        ${request.amount.toFixed(2)}
                                                    </div>
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                        {getStatusIcon(request.status)}
                                                        {request.status}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                    <div>Date: {new Date(request.requestDate).toLocaleDateString()}</div>
                                                    {request.transactionId && <div>TXN: {request.transactionId}</div>}
                                                    {request.adminNote && (
                                                        <div className="text-xs bg-white p-2 rounded border">
                                                            {request.adminNote}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => openModal(request)}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Edit Request
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg">No withdrawal requests found</p>
                                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Modal */}
                    {modalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl w-full max-w-lg transform transition-all">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Update Withdrawal Request</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Amount: ${selectedRequest?.amount.toFixed(2)} •
                                        Requested: {new Date(selectedRequest?.requestDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <div onSubmit={handleUpdateRequest} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['pending', 'approved', 'rejected', 'paid'].map((statusOption) => (
                                                <button
                                                    key={statusOption}
                                                    type="button"
                                                    onClick={() => setStatus(statusOption)}
                                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${status === statusOption
                                                        ? `${getStatusColor(statusOption)} border-current`
                                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {getStatusIcon(statusOption)}
                                                    {statusOption}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                                            Transaction ID
                                        </label>
                                        <input
                                            type="text"
                                            id="transactionId"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter transaction ID"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="adminNote" className="block text-sm font-medium text-gray-700 mb-2">
                                            Admin Note
                                        </label>
                                        <textarea
                                            id="adminNote"
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Add a note about this request..."
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{error}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUpdateRequest}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                                        >
                                            {loading ? 'Updating...' : 'Update Request'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}