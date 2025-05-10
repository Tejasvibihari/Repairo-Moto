import React, { useState, useEffect } from 'react'
import { Search, Copy, CheckCircle } from 'lucide-react'
import Footer from '../../components/landing/Footer';
import NavBar from '../../components/ui/NavBar';
import { motion } from "framer-motion";
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import axiosClient from '../../service/axiosClient';
import { useSelector } from 'react-redux';
export default function MyReferral() {
    // Sample referral data - would be fetched from API in real implementation
    const [allUser, setAllUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user.user);

    const handleCopyCode = (id, code) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                const response = await axiosClient.get(`/api/user/getalluser/${user.referralCode}`);
                setAllUser(response.data.data)
                setLoading(false)
            } catch (error) {
                console.log(error);
                setLoading(false)
            }
        }
        fetchUser();
    }, [])

    return (
        <>
            <NavBar />
            <motion.div
                className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">My Referrals</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'My Referrals' },
                        ]}
                    />
                </div>
            </motion.div>
            <div className="container mx-auto py-12 px-4 md:px-6">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">Your Referrals</h3>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div className="flex items-center mb-4 md:mb-0">
                                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium">
                                    Total Referrals: {allUser?.length}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full mx-">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-4 px-3 text-gray-500 font-medium">User</th>
                                        <th className="text-left py-4 px-3 text-gray-500 font-medium">Referral Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUser.length > 0 ? (
                                        allUser.map(referral => (
                                            <tr key={referral._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-3">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}${referral.profileImage}`}
                                                            className="w-10 h-10 rounded-full object-cover mr-3"
                                                            alt={referral.firstName}
                                                        />
                                                        <span className="font-medium text-gray-800">{referral.firstName} {referral.lastName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3">
                                                    <div className="bg-gray-100 rounded-lg px-3 py-1 inline-block">
                                                        {referral.referralCode}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-6 text-center text-gray-500">
                                                No referrals found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Referral Statistics Section */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-700">Total Earnings</h4>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">$1,250.00</p>
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        12% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-700">Active Referrals</h4>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">45</p>
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        8% from last month
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-700">Conversion Rate</h4>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">24.8%</p>
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        3% from last month
                    </p>
                </div>
            </div> */}

                {/* Share Your Referral Link Section */}
                <div className="bg-gradient-to-r from-primary to-yellow-600 rounded-xl shadow-lg p-6 md:p-8">
                    <div className="md:flex items-center justify-between">
                        <div className="mb-6 md:mb-0">
                            <h3 className="text-2xl font-bold text-white mb-2">Share Your Referral Link</h3>
                            <p className="text-blue-100 mb-4">Invite friends and earn rewards when they make a booking</p>

                            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value="https://example.com/ref/YOUR2025"
                                        className="bg-white bg-opacity-20 text-white placeholder-blue-200 px-4 py-3 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-white"
                                        readOnly
                                    />
                                    <button
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200"
                                        onClick={() => {
                                            navigator.clipboard.writeText("https://example.com/ref/YOUR2025");
                                            alert("Referral link copied!");
                                        }}
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>

                                <div className="flex space-x-2">
                                    <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg font-medium flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                        </svg>
                                        Facebook
                                    </button>
                                    <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg font-medium flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                        </svg>
                                        Twitter
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <img src="/api/placeholder/200/150" alt="Referral illustration" className="w-48" />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}