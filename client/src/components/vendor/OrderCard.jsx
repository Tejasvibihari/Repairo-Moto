import React, { useState } from 'react';

export default function OrderCard({ deliveryBoy, bikeBrand, bikeModel, status, parts = [] }) {
    // Default values for props
    deliveryBoy = deliveryBoy || "John Doe";
    bikeBrand = bikeBrand || "Generic";
    bikeModel = bikeModel || "City Rider";
    status = status || "In Progress";

    // Default parts if none provided
    if (parts.length === 0) {
        parts = [
            { name: "Brake Pads", quantity: 2, id: "BP-203" },
            { name: "Chain Oil", quantity: 1, id: "CO-401" },
            { name: "Inner Tube", quantity: 1, id: "IT-105" }
        ];
    }

    // Show/hide parts list toggle
    const [showParts, setShowParts] = useState(false);

    // Primary color variables
    const primaryColor = "#e2a731";

    // Function to determine status color
    const getStatusColor = () => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg border-t-4 border-primary my-4" >
            <div className="space-y-4">
                {/* Order Header */}
                <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: `${primaryColor}40` }}>
                    <h3 className="text-lg font-medium" style={{ color: primaryColor }}>Order Details</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                        {status}
                    </span>
                </div>

                {/* Delivery Person Info */}
                <div className="flex items-center space-x-3">
                    <div className="rounded-full p-2" style={{ backgroundColor: `${primaryColor}30` }}>
                        <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Delivery Person</p>
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>{deliveryBoy}</p>
                    </div>
                </div>

                {/* Bike Info */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-full p-2" style={{ backgroundColor: `${primaryColor}30` }}>
                            <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Bike Brand</p>
                            <p className="text-sm font-semibold" style={{ color: primaryColor }}>{bikeBrand}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="rounded-full p-2" style={{ backgroundColor: `${primaryColor}30` }}>
                            <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Bike Model</p>
                            <p className="text-sm font-semibold" style={{ color: primaryColor }}>{bikeModel}</p>
                        </div>
                    </div>
                </div>

                {/* Parts Section Header */}
                <div className="mt-2 border-t pt-3" style={{ borderColor: `${primaryColor}40` }}>
                    <button
                        className="flex items-center justify-between w-full"
                        onClick={() => setShowParts(!showParts)}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="rounded-full p-1" style={{ backgroundColor: `${primaryColor}30` }}>
                                <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            <span className="text-sm font-medium" style={{ color: primaryColor }}>Parts for Delivery</span>
                        </div>
                        <svg
                            className={`w-5 h-5 transition-transform ${showParts ? 'transform rotate-180' : ''}`}
                            style={{ color: primaryColor }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>

                {/* Parts List */}
                {showParts && (
                    <div className="bg-gray-50 rounded-md p-3 border mt-2" style={{ borderColor: `${primaryColor}30` }}>
                        <div className="grid grid-cols-12 text-xs font-medium text-gray-500 mb-2">
                            <div className="col-span-1">#</div>
                            <div className="col-span-6">Part Name</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-3">ID</div>
                        </div>

                        {parts.map((part, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-12 text-sm py-2 ${index !== parts.length - 1 ? 'border-b' : ''}`}
                                style={{ borderColor: `${primaryColor}20` }}
                            >
                                <div className="col-span-1 text-gray-500">{index + 1}</div>
                                <div className="col-span-6 font-medium">{part.name}</div>
                                <div className="col-span-2 text-center">{part.quantity}</div>
                                <div className="col-span-3 text-gray-500 text-xs align-middle pt-1">{part.id}</div>
                            </div>
                        ))}

                        <div className="mt-3 text-xs text-gray-500 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Total items: {parts.reduce((acc, part) => acc + part.quantity, 0)}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center" style={{ borderColor: `${primaryColor}40` }}>
                    <div className="text-xs text-gray-500">
                        Order #: 483729
                    </div>
                    <button className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                        {showParts ? 'Print Parts List' : 'View Details'}
                    </button>
                </div>
            </div>
        </div>
    );
}