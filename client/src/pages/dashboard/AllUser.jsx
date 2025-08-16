import React, { useEffect, useState } from 'react'
import { Search, Users, Filter, RefreshCw } from 'lucide-react'
import AllUsersTable from '../../components/AllUserTable'
import axiosClient from '../../service/axiosClient'
import CircularLoading from '../../components/ui/CircularLoading'

export default function AllUser() {
    const [loading, setLoading] = useState(false);
    const [users, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [accountType, setAccountType] = useState('personal');

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/api/user/getalluser');
                // sort new users on top (by createdAt if available, else by _id)
                const sortedUsers = response.data.users.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setAllUsers(sortedUsers);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllUsers();
    }, [])

    const handleStatusUpdate = (userId, newStatus) => {
        setAllUsers((prevUsers) =>
            prevUsers.map((user) =>
                user._id === userId ? { ...user, status: newStatus } : user
            )
        );
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/api/user/getalluser');
            const sortedUsers = response.data.users.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setAllUsers(sortedUsers);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? user.status === statusFilter : true;
        const matchesAccountType = user.accountType === accountType;
        return matchesSearch && matchesStatus && matchesAccountType;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-50'
            case 'pending': return 'text-yellow-600 bg-yellow-50'
            case 'suspended': return 'text-red-600 bg-red-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const statusCounts = users.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto">
                                    <CircularLoading />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-800">Loading Users</h3>
                                <p className="text-sm text-gray-500">Please wait while we fetch the latest data...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header Section */}
                {/* <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600">Manage and monitor all system users</p>
                        </div>
                    </div>
                </div> */}

                {users && users.length > 0 ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Approved</p>
                                        <p className="text-2xl font-bold text-green-600">{statusCounts.approved || 0}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Suspended</p>
                                        <p className="text-2xl font-bold text-red-600">{statusCounts.suspended || 0}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Filter className="w-5 h-5 text-gray-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                            </div>

                            <div className="flex flex-col lg:flex-row items-center gap-4">
                                {/* Search Input */}
                                <div className="relative flex-1 w-full lg:w-auto">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white min-w-[140px]"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="suspended">Suspended</option>
                                </select>

                                {/* Account Type Toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setAccountType('personal')}
                                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${accountType === 'personal'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-600 hover:text-secondary'
                                            }`}
                                    >
                                        Personal
                                    </button>
                                    <button
                                        onClick={() => setAccountType('business')}
                                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${accountType === 'business'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-600 hover:text-secondary'
                                            }`}
                                    >
                                        Business
                                    </button>
                                </div>

                                {/* Refresh Button */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
                                <span className="font-semibold">{users.length}</span> users
                            </p>
                            {(searchTerm || statusFilter) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('');
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>

                        {/* User Table */}
                        {filteredUsers.length > 0 ? (
                            <AllUsersTable users={filteredUsers} onStatusUpdate={handleStatusUpdate} />
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">No users found</h3>
                                        <p className="text-gray-500 mt-1">
                                            Try adjusting your search terms or filters to find what you're looking for.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">No users available</h3>
                                <p className="text-gray-500 mt-1">
                                    There are currently no users in the system.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}