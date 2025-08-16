import React, { useState, useEffect } from 'react'
import { Search, Copy, CheckCircle, TrendingUp, Users, DollarSign, Download, Calendar, Filter, Eye, Clock, ShoppingCart, AlertCircle } from 'lucide-react'
import Footer from '../../components/landing/Footer';
import NavBar from '../../components/ui/NavBar';
import { motion } from "framer-motion";
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import axiosClient from '../../service/axiosClient';
import { useSelector } from 'react-redux';
import AlertSnackBar from '../../components/ui/AlertSnackBar';

export default function MyReferral() {
    const [allReferral, setAllReferral] = useState([]);
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [fullUser, setFullUser] = useState({});
    const user = useSelector((state) => state.user.user.user);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [error, setError] = useState("");

    // Check if user account type allows withdrawals
    const canWithdraw = user?.accountType === 'business';

    // Mock additional data - replace with API calls
    const userStats = {
        totalReferrals: allReferral.length,
        activeReferrals: allReferral.filter(u => u.status === 'approved').length,
        pendingAmount: fullUser.pendingReferralAmount || 0,
        availableAmount: fullUser?.referralAmount || 0,
        totalWithdrawn: fullUser?.totalWithdrawn || 0,
        totalEarnings: (fullUser?.referralAmount || 0) + (fullUser?.totalWithdrawn || 0) + (fullUser?.pendingReferralAmount || 0)
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch referred users
                const userResponse = await axiosClient.get(`/api/user/getalluser/${user?.referralCode}`);
                setAllReferral(userResponse.data.data);

                // Fetch withdrawal history
                const withdrawalResponse = await axiosClient.get(`/api/user/get-user-by-id/${user?._id}`);
                setFullUser(withdrawalResponse.data.user)
                setWithdrawalHistory(withdrawalResponse.data.user.withdrawalRequests || []);

                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleWithdrawRequest = async () => {
        if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
            setError('Please enter a valid amount');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            return;
        }

        if (parseFloat(withdrawalAmount) > userStats.availableAmount) {
            setError('Please enter a valid amount');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            return;
        }

        try {
            const response = await axiosClient.post(`/api/user/withdrawal-request/${user?._id}`, {
                amount: parseFloat(withdrawalAmount)
            });

            if (response.data.success) {
                alert('Withdrawal request submitted successfully!');
                setShowWithdrawModal(false);
                setWithdrawalAmount('');
                // Refresh data
                window.location.reload();
            }
        } catch (error) {
            setError('Error submitting withdrawal request');
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
            console.error(error);
        }
    };

    const handleWithdrawButtonClick = () => {
        if (!canWithdraw) {
            setShowInfoModal(true);
        } else {
            setShowWithdrawModal(true);
        }
    };

    const filteredUsers = allReferral.filter(referral => {
        const matchesSearch = `${referral.firstName} ${referral.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || referral.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'paid': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    return (
        <>
            <NavBar />
            <AlertSnackBar
                open={snackBarOpen}
                message={error}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />
            <motion.div
                className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">My Referral Dashboard</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'My Referrals' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="container mx-auto py-12 px-4 md:px-6">
                {/* Account Type Notice */}
                {!canWithdraw && (
                    <motion.div
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-start gap-3">
                            <ShoppingCart className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-blue-800 font-semibold mb-1">Personal Account - Purchase Credit</h4>
                                <p className="text-blue-700 text-sm">
                                    Your referral balance can be used as credit for your upcoming purchases and services.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Users className="h-8 w-8" />
                            <span className="text-blue-200 text-sm font-medium">Total</span>
                        </div>
                        <p className="text-3xl font-bold">{userStats.totalReferrals}</p>
                        <p className="text-blue-200 text-sm">Referrals</p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            {canWithdraw ? <DollarSign className="h-8 w-8" /> : <ShoppingCart className="h-8 w-8" />}
                            <span className="text-green-200 text-sm font-medium">
                                {canWithdraw ? 'Available' : 'Purchase Credit'}
                            </span>
                        </div>
                        <p className="text-3xl font-bold">₹{userStats.availableAmount.toLocaleString()}</p>
                        <p className="text-green-200 text-sm">
                            {canWithdraw ? 'Balance' : 'For Purchases'}
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="h-8 w-8" />
                            <span className="text-purple-200 text-sm font-medium">Total</span>
                        </div>
                        <p className="text-3xl font-bold">₹{userStats.totalEarnings.toLocaleString()}</p>
                        <p className="text-purple-200 text-sm">Earnings</p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Download className="h-8 w-8" />
                            <span className="text-orange-200 text-sm font-medium">
                                {canWithdraw ? 'Withdrawn' : 'Used'}
                            </span>
                        </div>
                        <p className="text-3xl font-bold">₹{userStats.totalWithdrawn.toLocaleString()}</p>
                        <p className="text-orange-200 text-sm">Total</p>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quick Actions</h3>
                            <p className="text-gray-600">
                                {canWithdraw
                                    ? 'Manage your referral earnings'
                                    : 'Use your referral credit for purchases'
                                }
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleWithdrawButtonClick}
                                disabled={userStats.availableAmount <= 0}
                                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${canWithdraw
                                    ? 'bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white'
                                    }`}
                            >
                                {canWithdraw ? <Download size={18} /> : <ShoppingCart size={18} />}
                                {canWithdraw ? 'Withdraw Funds' : 'Use for Purchase'}
                            </button>
                            <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                <span className="text-sm text-gray-600">Pending: </span>
                                <span className="font-semibold text-yellow-600">₹{userStats.pendingAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-md mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {[
                                { id: 'overview', name: 'Overview', icon: Eye },
                                { id: 'referrals', name: 'My Referrals', icon: Users },
                                ...(canWithdraw ? [{ id: 'withdrawals', name: 'Withdrawal History', icon: Clock }] : [])
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                    >
                                        <Icon size={18} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                                        <h4 className="text-lg font-semibold text-blue-800 mb-4">Earnings Breakdown</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">
                                                    {canWithdraw ? 'Available Balance:' : 'Purchase Credit:'}
                                                </span>
                                                <span className="font-semibold text-green-600">₹{userStats.availableAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Pending Amount:</span>
                                                <span className="font-semibold text-yellow-600">₹{userStats.pendingAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">
                                                    {canWithdraw ? 'Total Withdrawn:' : 'Total Used:'}
                                                </span>
                                                <span className="font-semibold text-orange-600">₹{userStats.totalWithdrawn.toLocaleString()}</span>
                                            </div>
                                            <hr className="border-blue-200" />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span className="text-blue-800">Total Earnings:</span>
                                                <span className="text-blue-800">₹{userStats.totalEarnings.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {!canWithdraw && (
                                            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                                                <p className="text-xs text-blue-800">
                                                    <strong>Note:</strong> Your credit can be used during checkout for any service purchase.
                                                    It will be automatically applied as a discount.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                                        <h4 className="text-lg font-semibold text-green-800 mb-4">Referral Stats</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Total Referrals:</span>
                                                <span className="font-semibold">{userStats.totalReferrals}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Active Referrals:</span>
                                                <span className="font-semibold text-green-600">{userStats.activeReferrals}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Conversion Rate:</span>
                                                <span className="font-semibold">
                                                    {userStats.totalReferrals > 0
                                                        ? `${((userStats.activeReferrals / userStats.totalReferrals) * 100).toFixed(1)}%`
                                                        : '0%'
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Avg. per Referral:</span>
                                                <span className="font-semibold">
                                                    ₹{userStats.totalReferrals > 0
                                                        ? (userStats.totalEarnings / userStats.totalReferrals).toFixed(0)
                                                        : '0'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'referrals' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Search referrals..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium">
                                        Total: {filteredUsers.length}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">User</th>
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Referral Code</th>
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Status</th>
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Join Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(referral => (
                                                    <tr key={referral._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-4 px-3">
                                                            <div className="flex items-center">
                                                                <img
                                                                    src={`${import.meta.env.VITE_API_URL}${referral.profileImage}`}
                                                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                                                    alt={referral.firstName}
                                                                />
                                                                <div>
                                                                    <span className="font-medium text-gray-800">
                                                                        {referral.firstName} {referral.lastName}
                                                                    </span>
                                                                    <div className="text-sm text-gray-500">{referral.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-3">
                                                            <div className="bg-gray-100 rounded-lg px-3 py-1 inline-block font-mono text-sm">
                                                                {referral?.referralCode}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-3">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(referral.status)}`}>
                                                                {referral.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-3 text-gray-600">
                                                            {formatDate(referral.createdAt)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="py-12 text-center text-gray-500">
                                                        <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                                        <p className="text-lg font-medium">No referrals found</p>
                                                        <p className="text-sm">Start sharing your referral link to earn rewards!</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'withdrawals' && canWithdraw && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-semibold text-gray-800">Withdrawal History</h4>
                                    <div className="text-sm text-gray-600">
                                        Total Withdrawn: <span className="font-semibold text-green-600">₹{userStats.totalWithdrawn.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Amount</th>
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Request Date</th>
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Status</th>
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Processed Date</th>
                                                <th className="text-left py-4 px-3 text-gray-500 font-medium">Transaction ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {withdrawalHistory.length > 0 ? (
                                                withdrawalHistory.map((withdrawal, index) => (
                                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-4 px-3 font-semibold">₹{withdrawal.amount.toLocaleString()}</td>
                                                        <td className="py-4 px-3 text-gray-600">{formatDate(withdrawal.requestDate)}</td>
                                                        <td className="py-4 px-3">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                                                                {withdrawal.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-3 text-gray-600">
                                                            {withdrawal.processedDate ? formatDate(withdrawal.processedDate) : '-'}
                                                        </td>
                                                        <td className="py-4 px-3">
                                                            {withdrawal.transactionId ? (
                                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                                    {withdrawal.transactionId}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-gray-500">
                                                        <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                                        <p className="text-lg font-medium">No withdrawal history</p>
                                                        <p className="text-sm">Your withdrawal requests will appear here</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Share Referral Link Section */}
                <div className="bg-gradient-to-r from-primary to-yellow-600 rounded-xl shadow-lg p-6 md:p-8">
                    <div className="md:flex items-center justify-between">
                        <div className="mb-6 md:mb-0">
                            <h3 className="text-2xl font-bold text-white mb-2">Share Your Referral Link</h3>
                            <p className="text-blue-100 mb-4">Invite friends and earn ₹500 for each successful referral</p>

                            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={`${import.meta.env.VITE_FRONTEND_URL}/user-signup/${user?.accountType}/${user?.referralCode}`}
                                        className="bg-white bg-opacity-20 text-black placeholder-blue-200 px-4 py-3 pr-8 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-white"
                                        readOnly
                                    />
                                    <button
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-secondary cursor-pointer"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${import.meta.env.VITE_FRONTEND_URL}/user-signup/${user?.accountType}/${user?.referralCode}`);
                                            alert("Referral link copied!");
                                        }}
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Modal for Personal Account */}
            {showInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <AlertCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Personal Account Features</h3>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                Your referral balance of <span className="font-semibold text-green-600">₹{userStats.availableAmount.toLocaleString()}</span> can be used as credit for:
                            </p>

                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <ul className="space-y-2 text-sm text-blue-800">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Service purchases and bookings
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Automatic discount during checkout
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        No expiration date
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Want to withdraw cash?</strong> Upgrade to a business account to enable withdrawal features.
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Got It
                            </button>
                            <button
                                onClick={() => {
                                    setShowInfoModal(false);
                                    // Add navigation to upgrade account or services page
                                    // window.location.href = '/services';
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Browse Services
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Modal - Only for Business Accounts */}
            {showWithdrawModal && canWithdraw && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Request Withdrawal</h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Available Balance: <span className="font-semibold text-green-600">₹{userStats.availableAmount.toLocaleString()}</span></p>
                            <p className="text-xs text-gray-500">Minimum withdrawal amount: ₹100</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Withdrawal Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="100"
                                max={userStats.availableAmount}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdrawRequest}
                                disabled={!withdrawalAmount || parseFloat(withdrawalAmount) < 100 || parseFloat(withdrawalAmount) > userStats.availableAmount}
                                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                <strong>Note:</strong> Withdrawal requests are processed within 3-5 business days. You'll receive an email confirmation once processed.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}