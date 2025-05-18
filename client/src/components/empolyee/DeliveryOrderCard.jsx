import { useEffect, useState } from 'react';
import { MapPin, Phone, User, Package, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import axiosClient from '../../service/axiosClient';
import CircularLoading from '../ui/CircularLoading';

export default function DeliveryOrderCard({ order, vendor }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [vendorOrder, setVendorOrder] = useState(null);

    console.log(order)
    const getGoogleMapsLink = () => {
        // Fallback to address search if googleLocation is not present
        if (vendor?.googleLocation) {
            return vendor.googleLocation;
        }
    };

    const handleLocationClick = () => {
        const url = getGoogleMapsLink();
        if (url) {
            window.open(url, '_blank');
        }
    };

    const changeExpand = async (id) => {
        console.log(order._id)
        try {
            setExpanded(!expanded);
            setLoading(true);
            const response = await axiosClient.get(`/api/vendor/vendororder/getvendorOrder/orderid/${order._id}`);
            setVendorOrder(response.data.vendorOrder);
            setLoading(false);
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }
    return (
        <div className="max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <h2 className="text-xl font-bold text-white">{vendor?.businessName}</h2>
                <p className="text-white text-opacity-80 text-sm">Order Id:-<span className='font-semibold'> {order?.orderId}</span></p>
            </div>

            {/* Vendor Information */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center mb-3">
                    <User className="text-blue-500 mr-2 h-5 w-5" />
                    <h3 className="font-semibold">Vendor Details</h3>
                </div>

                <div className="ml-7 space-y-2 text-sm">
                    <p className="font-medium">{vendor?.firstName} {vendor?.lastName}</p>

                    <div className="flex items-center">
                        <Phone className="text-gray-500 mr-2 h-4 w-4" />
                        <a href={`tel:${vendor?.phone}`} className="text-blue-600 hover:underline">
                            {vendor?.phone}
                        </a>
                    </div>

                    <div className="flex items-start">
                        <MapPin className="text-gray-500 mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                        <button
                            onClick={() => window.open(`${vendor?.googleLocation}`, '_blank', 'noopener,noreferrer')}
                            className="text-left text-blue-600 hover:underline"
                        >
                            {vendor?.address}, {vendor?.city}, {vendor?.state} - {vendor?.pincode}
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
                    <div className="flex items-center">
                        <MapPin className="text-gray-500 mr-2 h-4 w-4" />
                        <a
                            href={`https://www.google.com/maps?q=${order?.location?.latitude},${order?.location?.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            View On Map
                        </a>
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
            <div className="p-4 border-b border-gray-200">
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
                    <div>
                        <span className="text-gray-500">Bs:</span>
                        <span className="ml-1 font-medium">{order.bs}</span>
                    </div>
                </div>
            </div>

            {/* Parts Used Section */}
            <div className="p-4">
                <button
                    className="flex items-center justify-between w-full font-semibold"
                    onClick={() => changeExpand(order._id)}
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
                    loading ? (
                        <div className="flex items-center space-x-4 justify-center my-4">
                            <CircularLoading size={20} />
                            <span className='font-semibold text-gray-500 text-sm'>
                                Loading Please Wait ......
                            </span>
                        </div>
                    ) : (
                        <div className="mt-3 ml-7">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium text-gray-500">Item</th>
                                        <th className="text-center py-2 font-medium text-gray-500">Qty</th>
                                        <th className="text-center py-2 font-medium text-gray-500">Price</th>
                                        <th className="text-center py-2 font-medium text-gray-500">Discount</th>
                                        <th className="text-right py-2 font-medium text-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(vendorOrder ? vendorOrder.partsUsed : order.partsUsed)?.map((part, index) => (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="py-2">{part.partName}</td>
                                            <td className="py-2 text-center">{part.quantity}</td>
                                            <td className="py-2 text-center">₹{part.price}</td>
                                            <td className="py-2 text-center">₹{part.discountPrice}</td>
                                            <td className="py-2 text-right">₹{(part.price - part.discountPrice) * part.quantity}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-medium">
                                        <td colSpan={4} className="py-2 text-right">Total:</td>
                                        <td className="py-2 text-right">
                                            ₹{vendorOrder?.partsUsed?.reduce((sum, part) => sum + ((part.price - part.discountPrice) * part.quantity), 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div >
    );
} 