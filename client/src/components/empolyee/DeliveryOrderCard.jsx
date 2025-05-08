import { useState } from 'react';
import { MapPin, Phone, User, Package, Wrench, ChevronDown, ChevronUp } from 'lucide-react';

export default function DeliveryOrderCard({ order, vendor }) {
    const [expanded, setExpanded] = useState(false);

    const getGoogleMapsLink = () => {
        const address = `${vendor.address}, ${vendor.city}, ${vendor.state}, ${vendor.pincode}`;
        return `${vendor?.googleLocation}`;
    };

    const handleLocationClick = () => {
        window.open(getGoogleMapsLink(), '_blank');
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <h2 className="text-xl font-bold text-white">{vendor.businessName}</h2>
                <p className="text-white text-opacity-80 text-sm">Order Details</p>
            </div>

            {/* Vendor Information */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center mb-3">
                    <User className="text-blue-500 mr-2 h-5 w-5" />
                    <h3 className="font-semibold">Vendor Details</h3>
                </div>

                <div className="ml-7 space-y-2 text-sm">
                    <p className="font-medium">{vendor.firstName} {vendor.lastName}</p>

                    <div className="flex items-center">
                        <Phone className="text-gray-500 mr-2 h-4 w-4" />
                        <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                            {vendor.phone}
                        </a>
                    </div>

                    <div className="flex items-start">
                        <MapPin className="text-gray-500 mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                        <button
                            onClick={handleLocationClick}
                            className="text-left text-blue-600 hover:underline"
                        >
                            {vendor.address}, {vendor.city}, {vendor.state} - {vendor.pincode}
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Information */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center mb-3">
                    <User className="text-green-500 mr-2 h-5 w-5" />
                    <h3 className="font-semibold">Customer Details</h3>
                </div>

                <div className="ml-7 space-y-2 text-sm">
                    <p className="font-medium">{order.name}</p>

                    <div className="flex items-center">
                        <Phone className="text-gray-500 mr-2 h-4 w-4" />
                        <a href={`tel:${order.contactNo}`} className="text-blue-600 hover:underline">
                            {order.contactNo}
                        </a>
                    </div>

                    <div className="flex items-center">
                        <MapPin className="text-gray-500 mr-2 h-4 w-4" />
                        <span>{order.city}</span>
                    </div>
                </div>
            </div>

            {/* Mechanic Information */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center mb-3">
                    <Wrench className="text-orange-500 mr-2 h-5 w-5" />
                    <h3 className="font-semibold">Mechanic Details</h3>
                </div>

                <div className="ml-7 space-y-2 text-sm">
                    <p className="font-medium">{order.assignedMechanic}</p>
                </div>
            </div>

            {/* Vehicle Details */}
            {/* <div className="p-4 border-b border-gray-200">
                <div className="flex items-center mb-3">
                    <Package className="text-purple-500 mr-2 h-5 w-5" />
                    <h3 className="font-semibold">Vehicle Details</h3>
                </div>

                <div className="ml-7 text-sm grid grid-cols-2 gap-2">
                    <div>
                        <span className="text-gray-500">Brand:</span>
                        <span className="ml-1 font-medium">{order.selectedBrand}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Model:</span>
                        <span className="ml-1 font-medium">{order.selectedModel}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Engine:</span>
                        <span className="ml-1 font-medium">{order.cc}</span>
                    </div>
                </div>
            </div> */}

            {/* Parts Used Section */}
            <div className="p-4">
                <button
                    className="flex items-center justify-between w-full font-semibold"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center">
                        <Package className="text-blue-500 mr-2 h-5 w-5" />
                        <span>Parts Required</span>
                    </div>
                    {expanded ?
                        <ChevronUp className="h-5 w-5 text-gray-500" /> :
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    }
                </button>

                {expanded && (
                    <div className="mt-3 ml-7">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 font-medium text-gray-500">Item</th>
                                    <th className="text-center py-2 font-medium text-gray-500">Qty</th>
                                    <th className="text-right py-2 font-medium text-gray-500">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.partsUsed.map((part, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="py-2">{part.partName}</td>
                                        <td className="py-2 text-center">{part.quantity}</td>
                                        <td className="py-2 text-right">₹{part.price}</td>
                                    </tr>
                                ))}
                                <tr className="font-medium">
                                    <td colSpan={2} className="py-2 text-right">Total:</td>
                                    <td className="py-2 text-right">
                                        ₹{order.partsUsed.reduce((sum, part) => sum + (part.price * part.quantity), 0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}