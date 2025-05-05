import { useState } from 'react';
import { Copy, CheckCheck, Share2 } from 'lucide-react';
import { useSelector } from "react-redux";
import QRGenerator from './QRGenerator';
export default function ReferralEarnings() {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const employee = useSelector((state) => state.employeeAuth.employee)
    const vendor = useSelector((state) => state.vendorAuth.vendor)
    console.log(vendor)
    const referralCode = "FRIEND25XYZ";
    const employeeReferralUrl = `${import.meta.env.VITE_API_URL}/user-signup/${employee.referralCode}`;
    const vendorReferralUrl = `${import.meta.env.VITE_API_URL}/user-signup/${vendor.referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleQRCode = () => {
        setShowQR(!showQR);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 rounded-lg shadow-lg bg-white">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold" style={{ color: '#e2a731' }}>Referral & Earnings</h1>
                <p className="text-gray-600 mt-2">Share with friends and earn rewards together</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Total Referrals</p>
                    <p className="text-2xl font-bold mt-1">12</p>
                </div>
                {/* <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold mt-1">$48.00</p>
                </div> */}
            </div>

            {/* Referral Code Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <p className="text-gray-500 mb-2">Your Referral Code</p>
                <div className="flex items-center">
                    <div className="flex-1 bg-white p-3 rounded-l-md border border-r-0 border-gray-200 font-mono font-semibold text-lg">
                        {vendor ? vendor.referralCode : employee.referralCode}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="p-3 rounded-r-md flex items-center justify-center"
                        style={{ backgroundColor: '#e2a731' }}
                    >
                        {copied ? <CheckCheck size={20} color="white" /> : <Copy size={20} color="white" />}
                    </button>
                </div>
            </div>

            {/* Referral Link Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <p className="text-gray-500 mb-2">Your Referral Link</p>
                <div className="flex items-center">
                    <div className="flex-1 bg-white p-3 rounded-l-md border border-r-0 border-gray-200 truncate text-sm">
                        {vendor ? vendorReferralUrl : employeeReferralUrl}
                    </div>
                    {/* <button
                        onClick={toggleQRCode}
                        className="p-3 rounded-r-md flex items-center justify-center"
                        style={{ backgroundColor: '#e2a731' }}
                    >
                        <Share2 size={20} color="white" />
                    </button> */}
                </div>
            </div>

            {/* QR Code Section */}
            {/* {showQR && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
                    <p className="text-gray-500 mb-4">Scan this QR code to join</p>
                    <div className="inline-block bg-white p-4 rounded-md">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            <rect x="0" y="0" width="200" height="200" fill="white" />
                            <rect x="40" y="40" width="20" height="20" fill="black" />
                            <rect x="60" y="40" width="20" height="20" fill="black" />
                            <rect x="80" y="40" width="20" height="20" fill="black" />
                            <rect x="40" y="60" width="20" height="20" fill="black" />
                            <rect x="80" y="60" width="20" height="20" fill="black" />
                            <rect x="40" y="80" width="20" height="20" fill="black" />
                            <rect x="60" y="80" width="20" height="20" fill="black" />
                            <rect x="80" y="80" width="20" height="20" fill="black" />
                            <rect x="120" y="40" width="20" height="20" fill="black" />
                            <rect x="140" y="40" width="20" height="20" fill="black" />
                            <rect x="120" y="60" width="20" height="20" fill="black" />
                            <rect x="140" y="60" width="20" height="20" fill="black" />
                            <rect x="120" y="80" width="20" height="20" fill="black" />
                            <rect x="40" y="120" width="20" height="20" fill="black" />
                            <rect x="60" y="120" width="20" height="20" fill="black" />
                            <rect x="80" y="120" width="20" height="20" fill="black" />
                            <rect x="40" y="140" width="20" height="20" fill="black" />
                            <rect x="80" y="140" width="20" height="20" fill="black" />
                            <rect x="120" y="120" width="20" height="20" fill="black" />
                            <rect x="140" y="140" width="20" height="20" fill="black" />
                            <rect x="100" y="100" width="20" height="20" fill="black" />
                        </svg>
                    </div>
                    <button
                        onClick={toggleQRCode}
                        className="mt-4 px-4 py-2 rounded-md text-white"
                        style={{ backgroundColor: '#e2a731' }}
                    >
                        Hide QR Code
                    </button>
                </div>
            )} */}

            <QRGenerator text={vendor ? vendorReferralUrl : employeeReferralUrl} />
            {/* How It Works Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="font-semibold mb-4" style={{ color: '#e2a731' }}>How It Works</h2>
                <div className="space-y-3">
                    <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-white font-semibold text-xs" style={{ backgroundColor: '#e2a731' }}>1</div>
                        <p className="text-gray-600">Share your unique referral code with friends</p>
                    </div>
                    <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-white font-semibold text-xs" style={{ backgroundColor: '#e2a731' }}>2</div>
                        <p className="text-gray-600">They get $10 off their first purchase</p>
                    </div>
                    <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-white font-semibold text-xs" style={{ backgroundColor: '#e2a731' }}>3</div>
                        <p className="text-gray-600">You earn $5 for each successful referral</p>
                    </div>
                </div>
            </div>
        </div>
    );
}