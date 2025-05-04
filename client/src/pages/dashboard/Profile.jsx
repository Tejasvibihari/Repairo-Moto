import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { setAdminLogout } from '../../app/slice/adminAuthSlice';
import { setLogOut } from '../../app/slice/authSlice';

export default function Profile() {
    const user = useSelector((state) => state.admin.admin.user);
    const dispatch = useDispatch()
    const profileImageUrl = `${import.meta.env.VITE_API_URL}/uploads/${user.profilePicture}`; // Adjust the path based on your backend setup

    // Format date properly with a fallback
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return !isNaN(date.getTime()) ?
            date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) :
            "N/A";
    };

    const handleLogout = () => {
        // ✅ Clear Redux state (if using Redux Toolkit)
        dispatch(setAdminLogout());
        dispatch(setLogOut())

        // ✅ Clear all localStorage values (including tokens)
        localStorage.clear();
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden w-full max-w-md border border-purple-100">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="p-1 bg-white rounded-full">
                                <img
                                    src={profileImageUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-inner"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/150";
                                    }}
                                />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full">
                                <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mt-4 text-center">{`${user.firstName} ${user.lastName}`}</h2>
                        <p className="text-purple-100">{user.email}</p>
                        <span className="bg-white text-purple-700 text-xs font-medium px-3 py-1 rounded-full mt-3 capitalize shadow-sm">{user.role}</span>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-purple-700 flex items-center">
                        <User size={18} className="mr-2 text-purple-500" />
                        Profile Details
                    </h3>

                    <div className="mt-4 space-y-4">
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                            <User size={18} className="text-purple-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm text-purple-400">Full Name</p>
                                <p className="font-medium text-purple-900">{`${user.firstName} ${user.lastName}`}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                            <Mail size={18} className="text-blue-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm text-blue-400">Email</p>
                                <p className="font-medium text-blue-900">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                            <ShieldCheck size={18} className="text-indigo-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm text-indigo-400">Role</p>
                                <p className="font-medium text-indigo-900 capitalize">{user.role}</p>
                            </div>
                        </div>

                        {/* <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                            <Calendar size={18} className="text-purple-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm text-purple-400">Joined</p>
                                <p className="font-medium text-purple-900">{formatDate(user.createdAt)}</p>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="px-6 pb-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md"
                    >
                        <LogOut size={18} className="mr-2" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}