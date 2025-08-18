import React, { useState } from 'react';
import { Mail, Phone, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';

const AllUsersTable = ({ users, onStatusUpdate }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [error, setError] = useState('');

    const statusOptions = [
        { value: 'approved', label: 'Approved' },
        { value: 'pending', label: 'Pending' },
        { value: 'suspended', label: 'Suspended' }
    ];

    const handleStatusChange = (user, status) => {
        if (status === user.status) return; // No change

        setSelectedUser(user);
        setNewStatus(status);
        setShowConfirmModal(true);
    };

    // To Update the status of the user
    const confirmStatusUpdate = async () => {
        if (!selectedUser || !newStatus) return;
        setIsUpdating(true);
        try {
            const response = await axiosClient.put(`/api/user/update-status/${selectedUser._id}`, { status: newStatus });

            setError(response.data.message);
            onStatusUpdate(selectedUser._id, newStatus);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
        } catch (error) {
            console.error('Error updating status:', error);
            setError(error.messagae);
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
            setIsUpdating(false);
            setTimeout(() => {
                setShowConfirmModal(false);
                setSelectedUser(null);
                setNewStatus('');
            }, 2000)

        }
    };

    const cancelStatusUpdate = () => {
        setShowConfirmModal(false);
        setSelectedUser(null);
        setNewStatus('');
    };

    const exportToExcel = () => {
        const excelData = users.map((user, index) => ({
            "S.No": index + 1,
            "Name": `${user.firstName} ${user.lastName}`,
            "Email": user.email,
            "Phone": user.phone,
            "Account Type": user.accountType.toUpperCase(),
            "Business Name": user.businessName || "-",
            "Address": user.address || "-",
            "City": user.city || "-",
            "State": user.state || "-",
            "Pin Code": user.pincode || "-",
            "Referral Code": user.referralCode,
            "Status": user.status.toUpperCase(),
            "Created At": user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "All Users");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(file, 'All_Users.xlsx');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'suspended':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-end mb-2">
                    <button
                        onClick={exportToExcel}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary  cursor-pointer transition"
                    >
                        Export to Excel
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 cursor-pointer">
                                    S.No
                                </th>
                                <th className="px-6 py-3 cursor-pointer">
                                    Personal Details
                                </th>
                                <th className="px-6 py-3 cursor-pointer">
                                    Account Type
                                </th>
                                <th className="px-6 py-3 cursor-pointer">
                                    Business Name
                                </th>
                                <th className="px-6 py-3 cursor-pointer">
                                    Address
                                </th>
                                <th className="px-6 py-3 cursor-pointer">
                                    Referral Code
                                </th>
                                <th className="px-6 py-3 cursor-pointer">
                                    Status
                                </th>
                                <th className="px-6 py-3 cursor-pointer">
                                    Created At
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((user, index) => (
                                <tr key={user._id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {user.profileImage ? (
                                                    <img src={`${import.meta.env.VITE_API_URL}${user.profileImage}`} alt="Profile" className="w-10 h-10 object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {user.firstName[0]}{user.lastName[0]}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{user.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{user.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.accountType === 'personal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.accountType.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user?.businessName ? user?.businessName : "-"}</td>
                                    <td className="px-6 py-4">{user?.address ? user.address : "-"}, {user?.city ? user.city : "-"}, {user?.state ? user.state : "-"}, {user?.pincode ? user.pincode : "-"}</td>
                                    <td className="px-6 py-4">{user.referralCode}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.status}
                                            onChange={(e) => handleStatusChange(user, e.target.value)}
                                            className={`px-2 py-1 rounded text-xs font-medium border-none outline-none cursor-pointer ${getStatusColor(user.status)}`}
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 transform transition-all duration-200 scale-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                            Confirm Status Change
                        </h3>
                        <div className="text-center mb-6">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to change the status of
                            </p>
                            <p className="font-medium text-gray-900 mb-3">
                                {selectedUser?.firstName} {selectedUser?.lastName}
                            </p>
                            <div className="flex items-center justify-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser?.status)}`}>
                                    {selectedUser?.status?.toUpperCase()}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(newStatus)}`}>
                                    {newStatus?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelStatusUpdate}
                                disabled={isUpdating}
                                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition disabled:opacity-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusUpdate}
                                disabled={isUpdating}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[80px]"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Updating...</span>
                                    </div>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllUsersTable;