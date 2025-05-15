import { useState } from 'react';
import { Phone, Mail, MapPin, Star, Building, FileText } from 'lucide-react';

// VendorProfileCard Component
export default function VendorProfileCard({ vendor }) {
    const [expanded, setExpanded] = useState(false);

    // Consistent styling for vendor cards
    const cardStyle = 'bg-gradient-to-br from-green-500 to-teal-600';
    const detailStyle = 'bg-gradient-to-br from-green-100 to-teal-200';
    const buttonStyle = 'bg-teal-600 hover:bg-teal-700';

    return (
        <div className={`rounded-xl shadow-xl overflow-hidden transition-all duration-300 w-full max-w-4xl ${cardStyle}`}>
            {/* Card content that changes layout based on screen size */}
            <div className="flex flex-col md:flex-row">
                {/* Left section with image and basic info */}
                <div className="flex flex-col items-center p-6 md:w-1/3">
                    <div className="relative">
                        <img
                            src={`${import.meta.env.VITE_API_URL}${vendor.profileImage}`}
                            alt={`${vendor.firstName} ${vendor.lastName}`}
                            className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg">
                            <Building className="w-6 h-6 text-gray-700" />
                        </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-white">{vendor.firstName} {vendor.lastName}</h2>
                    <div className="flex items-center mt-2 text-white/90">
                        <span className="font-medium">{vendor.businessName}</span>
                        <span className="mx-2">•</span>
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300 mr-1" />
                            <span>{vendor.rating || "New"}</span>
                        </div>
                    </div>

                    <div className="mt-3 bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        Ref: {vendor.referralCode}
                    </div>
                </div>

                {/* Right section with contact details */}
                <div className={`${detailStyle} flex-1 p-6`}>
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Contact Details</h3>

                    <div className="space-y-3">
                        <div className="flex items-start">
                            <Phone className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-800">{vendor.phone}</span>
                        </div>

                        <div className="flex items-start">
                            <Mail className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-800 break-all">{vendor.email}</span>
                        </div>

                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-gray-800">{vendor.address}</span>
                                <span className="text-gray-600">
                                    {vendor.city}, {vendor.state} - {vendor.pincode}
                                </span>
                            </div>
                        </div>
                    </div>

                    {expanded && (
                        <div className="mt-4 pt-4 border-t border-gray-300/30">
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">Business Information</h3>

                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <Building className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-800">{vendor.businessName}</span>
                                </div>

                                <div className="flex items-start">
                                    <FileText className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-gray-600">GST Number</span>
                                        <span className="text-gray-800">{vendor.gstNo}</span>
                                    </div>
                                </div>

                                {vendor.googleLocation && (
                                    <div className="mt-2">
                                        <a
                                            href={vendor.googleLocation}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-700 hover:text-teal-900 underline"
                                        >
                                            View on Google Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        className={`mt-4 px-4 py-2 rounded-lg text-white ${buttonStyle} transition-colors`}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Show Less" : "Show More"}
                    </button>
                </div>
            </div>
        </div>
    );
}