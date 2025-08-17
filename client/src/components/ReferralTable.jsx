import React, { useState } from 'react';
import { Eye, Edit, Trash2, Phone, Mail, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Enhanced dummy data with additional fields


const statusOptions = ['pending', 'approved', 'suspended'];

const ReferralTable = ({ users }) => {
    const navigate = useNavigate();

    const [userStatuses, setUserStatuses] = useState(
        users.reduce((acc, user) => ({ ...acc, [user._id]: user.status }), {})
    );
    const [accountTypeFilter, setAccountTypeFilter] = useState('business');

    const handleStatusChange = (userId, newStatus) => {
        setUserStatuses(prev => ({ ...prev, [userId]: newStatus }));
    };

    const handleAction = (action, userId) => {
        switch (action) {
            case 'view':
                // Replace with your navigation logic
                navigate(`/detail-manage-referral/${userId}`);
                break;
            case 'edit':
                console.log(`Navigate to edit page for user ${userId}`);
                // navigate(`/users/${userId}/edit`);
                break;
            case 'delete':
                console.log(`Delete user ${userId}`);
                // Handle delete logic
                break;
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            approved: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            suspended: 'bg-red-100 text-red-800 border-red-200'
        };

        return statusStyles[status] || statusStyles.inactive;
    };

    // Filter users based on account type
    const filteredUsers = users.filter(user => user.accountType === accountTypeFilter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
                    <p className="text-gray-600">Manage and track user referrals and earnings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Approved</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${filteredUsers.reduce((sum, user) => sum + user.approvedAmount, 0).toFixed(2)}
                                </p>
                            </div>
                            <Building2 className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${filteredUsers.reduce((sum, user) => sum + user.pendingReferralAmount, 0).toFixed(2)}
                                </p>
                            </div>
                            <Mail className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Withdrawn</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${filteredUsers.reduce((sum, user) => sum + user.totalWithdrawn, 0).toFixed(2)}
                                </p>
                            </div>
                            <Phone className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">User Referral Details</h2>

                        {/* Account Type Switch */}
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600 font-medium">Account Type:</span>
                            <div className="relative inline-flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setAccountTypeFilter('business')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${accountTypeFilter === 'business'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Building2 className="w-4 h-4" />
                                        <span>Business</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setAccountTypeFilter('personal')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${accountTypeFilter === 'personal'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4" />
                                        <span>Personal</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {accountTypeFilter === 'business' ? 'Business Info' : 'Account Info'}
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Referrals
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pending Amount
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Approved Amount
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Withdraw Amount
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        {/* User Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {user.firstName[0]}{user.lastName[0]}
                                                        </span>
                                                    </div>
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

                                        {/* Business/Account Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {accountTypeFilter === 'business' ? (
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {accountTypeFilter === 'business'
                                                            ? (user?.businessName || "-")
                                                            : "Personal Account"
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-500">Code: {user.referralCode}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Total Referrals */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                                                {user.referralCount}
                                            </span>
                                        </td>

                                        {/* Pending Amount */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-yellow-600">
                                                ${user.pendingReferralAmount.toFixed(2)}
                                            </span>
                                        </td>

                                        {/* Approved Amount */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-blue-600">
                                                ${user?.referralAmount.toFixed(2)}
                                            </span>
                                        </td>

                                        {/* Withdraw Amount */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-green-600">
                                                ${user.totalWithdrawn.toFixed(2)}
                                            </span>
                                        </td>


                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleAction('view', user._id)}
                                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {/* <button
                                                    onClick={() => handleAction('edit', user._id)}
                                                    className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-150"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralTable;