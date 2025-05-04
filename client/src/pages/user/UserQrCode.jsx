import React from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import QRGenerator from '../../components/QRGenerator';
import { useSelector } from 'react-redux';

export default function UserQrCode() {
    const [copied, setCopied] = useState(false);
    const user = useSelector((state) => state.user.user);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Share Your Referral Code</h1>
                    <p className="text-gray-600 mt-2">Invite friends and earn rewards when they join!</p>
                </div>
                <QRGenerator text={`${import.meta.env.VITE_API_URL}/user-signup/user/${user.referralCode}`} />


                {/* Referral Link */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Link</label>
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={user.referralCode}
                            className="flex-1 p-3 border border-gray-300 rounded-l-md bg-gray-50 text-gray-800"
                            readOnly
                        />
                        <button
                            onClick={copyToClipboard}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-md"
                        >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-blue-800 mb-2">How to share:</h2>
                    <ul className="text-blue-700 text-sm space-y-2">
                        <li className="flex items-start">
                            <span className="mr-2">1.</span>
                            <span>Share your unique QR code by showing it to your friends in person</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">2.</span>
                            <span>Copy your referral link and share it via messaging apps, email, or social media</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">3.</span>
                            <span>When friends sign up using your code, both of you will receive rewards!</span>
                        </li>
                    </ul>
                </div>

                {/* Share Button */}
                <button
                    className="flex items-center justify-center w-full bg-primary hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md"
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: 'Join me on this app!',
                                text: 'Use my referral link to sign up:',
                                url: referralLink,
                            });
                        }
                    }}
                >
                    <Share2 size={20} className="mr-2" />
                    Share Referral Link
                </button>
            </div>
        </div>
    );
}