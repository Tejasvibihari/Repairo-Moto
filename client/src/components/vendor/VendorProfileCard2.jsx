import { User, MapPin, Phone, Mail, Star, Copy, CheckCheck, Briefcase, FileText, MapPinned } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVendorLogout } from "../../app/slice/vendorAuth";
import { setLogOut } from "../../app/slice/authSlice";


export default function VendorProfileCard2() {
    const [copied, setCopied] = useState(false);
    const vendor = useSelector((state) => state.vendorAuth.vendor);
    const dispatch = useDispatch();

    const vendorLogout = () => {
        dispatch(setVendorLogout());
        dispatch(setLogOut());
    };

    const copyReferralCode = () => {
        navigator.clipboard.writeText(vendor.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Primary color variables
    const primaryColor = "#e2a731";
    const primaryColorLight = "#f5e1bc";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Card Header with Profile Image */}
                <div
                    className="p-4 flex flex-col items-center sm:flex-row sm:items-start"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="relative">
                        <img
                            src={`${import.meta.env.VITE_API_URL}${vendor.profileImage}`}
                            alt={`${vendor.firstName} ${vendor.lastName}`}
                            className="h-24 w-24 rounded-full border-4 border-white object-cover"
                        />
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                        <h1 className="text-xl font-bold text-white">{vendor.firstName} {vendor.lastName}</h1>
                        <p className="text-white text-opacity-90 text-sm capitalize">{vendor.role}</p>
                        <p className="text-white text-opacity-90 font-medium">{vendor.businessName}</p>
                        <div className="flex items-center justify-center sm:justify-start mt-1">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={i < vendor.rating ? "text-white fill-white" : "text-white text-opacity-30"}
                                    />
                                ))}
                            </div>
                            <span className="text-white text-xs ml-2">{vendor.rating}/5</span>
                        </div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                    {/* Vendor Details */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Briefcase
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Business Name</p>
                                <p className="text-sm text-gray-500">{vendor.businessName}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <FileText
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">GST Number</p>
                                <p className="text-sm text-gray-500">{vendor.gstNo}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <User
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Your Referral Code</p>
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-500 mr-2">{vendor.referralCode}</p>
                                    <button
                                        onClick={copyReferralCode}
                                        className="text-xs p-1 rounded-md hover:bg-gray-100"
                                        title="Copy referral code"
                                    >
                                        {copied ? (
                                            <CheckCheck size={14} className="text-green-500" />
                                        ) : (
                                            <Copy size={14} style={{ color: primaryColor }} />
                                        )}
                                    </button>
                                </div>
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: primaryColor }}
                                >
                                    Share this code to invite others to join
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Mail
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email</p>
                                <p className="text-sm text-gray-500 break-all">{vendor.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Phone
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Phone</p>
                                <p className="text-sm text-gray-500">{vendor.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <MapPin
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Address</p>
                                <p className="text-sm text-gray-500">
                                    {vendor.address}, {vendor.city}, {vendor.state} - {vendor.pincode}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <MapPinned
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Google Maps Location</p>
                                <a
                                    href={vendor.googleLocation}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    View on Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div
                    className="px-6 py-4 border-t border-gray-100"
                    style={{ backgroundColor: primaryColorLight }}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <button
                            onClick={vendorLogout}
                            className="w-full cursor-pointer sm:w-auto bg-white py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}