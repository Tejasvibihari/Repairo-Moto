import React from 'react';
import { Clock, Calendar, Wrench, Bike, User, MapPin, Phone, DollarSign, Package, Check, AlertTriangle, Truck } from 'lucide-react';
import Footer from '../../components/landing/Footer';
import NavBar from '../../components/ui/NavBar';

export default function UserBookingDetail() {
    // Sample booking data (in a real app, this would come from props or a data fetch)
    const booking = {
        "_id": { "$oid": "680fc0b7156f903f6a4f98cf" },
        "name": "Nikkhil Kumar",
        "contactNo": "9430512545",
        "city": "PATNA",
        "selectedBrand": "TVS",
        "selectedModel": "other",
        "modelName": "Kutta Model",
        "cc": "500CC & Above",
        "services": ["Servicing", "Repairing", "Other"],
        "otherService": "Billa",
        "preferredDate": { "$date": "2025-04-29T18:30:00.000Z" },
        "preferredTime": "2025-04-28T09:50:00.000Z",
        "estimatedBudget": "5000",
        "issues": "Kutta Billa Change",
        "status": "In Progress",
        "assignedMechanic": "Kitto Kumar",
        "mechanicId": { "$oid": "680e6839c5124a4363ca18dc" },
        "assignedVendor": "Tejasvi Kumar",
        "vendorId": { "$oid": "680e7deb021b127ce2e59cab" },
        "assignedDelivery": "Ankit Kumar",
        "deliveryId": { "$oid": "680e6863c5124a4363ca18e0" },
        "partsUsed": [
            {
                "partName": "Kutta",
                "quantity": 5,
                "price": 100,
                "discountPrice": 95,
                "_id": { "$oid": "681600d1768bf684192d399f" }
            }
        ],
        "createdAt": { "$date": "2025-04-28T17:53:59.912Z" },
        "updatedAt": { "$date": "2025-05-03T11:41:05.411Z" },
        "__v": 13,
        "invoiceDate": { "$date": "2025-05-03T00:00:00.000Z" },
        "serviceProvided": [
            {
                "serviceName": "mechanical charge",
                "quantity": 1,
                "price": 1500,
                "discountPrice": 0,
                "_id": { "$oid": "681600d1768bf684192d399e" }
            }
        ],
        "total": {
            "subTotal": 1600,
            "discount": 10,
            "discountType": "percentage",
            "total": 1440
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        let bgColor = 'bg-yellow-500';
        let icon = <AlertTriangle size={16} />;

        if (status === 'Completed') {
            bgColor = 'bg-green-500';
            icon = <Check size={16} />;
        } else if (status === 'Cancelled') {
            bgColor = 'bg-red-500';
            icon = <AlertTriangle size={16} />;
        } else if (status === 'In Progress') {
            bgColor = 'bg-blue-500';
            icon = <Wrench size={16} />;
        }

        return (
            <span className={`${bgColor} text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium`}>
                {icon}
                {status}
            </span>
        );
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">Your Booking Details</h1>

                    {/* Main card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-6 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">{booking.selectedBrand} - {booking.modelName}</h2>
                                    <p className="text-white/80">{booking.cc}</p>
                                </div>
                                <StatusBadge status={booking.status} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Customer Info Section */}
                            <div className="mb-8 bg-purple-50 p-4 rounded-xl">
                                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                    <User className="text-purple-600" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-medium">{booking.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-purple-500" />
                                        <span className="font-medium">{booking.contactNo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-purple-500" />
                                        <span className="font-medium">{booking.city}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info Section */}
                            <div className="mb-8 bg-blue-50 p-4 rounded-xl">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                    <Bike className="text-blue-600" />
                                    Vehicle Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Brand:</span>
                                        <span className="font-medium">{booking.selectedBrand}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Model:</span>
                                        <span className="font-medium">{booking.modelName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">CC:</span>
                                        <span className="font-medium">{booking.cc}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Info Section */}
                            <div className="mb-8 bg-green-50 p-4 rounded-xl">
                                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                                    {/* <Tool className="text-green-600" /> */}
                                    Service Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <span className="text-gray-500">Services:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {booking.services.map((service, index) => (
                                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                                                    {service}
                                                </span>
                                            ))}
                                            {booking.otherService && (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                                                    {booking.otherService}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Issues:</span>
                                        <p className="font-medium mt-1">{booking.issues}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-green-500" />
                                        <span className="text-gray-500">Date:</span>
                                        <span className="font-medium">{formatDate(booking.preferredDate.$date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-green-500" />
                                        <span className="text-gray-500">Created:</span>
                                        <span className="font-medium">{formatDate(booking.createdAt.$date)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Section */}
                            <div className="mb-8 bg-pink-50 p-4 rounded-xl">
                                <h3 className="text-lg font-semibold text-pink-800 mb-3">Assignment Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm">
                                        <span className="text-pink-600 font-medium flex items-center gap-1">
                                            <Wrench size={16} />
                                            Mechanic
                                        </span>
                                        <span className="mt-1">{booking.assignedMechanic}</span>
                                    </div>
                                    <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm">
                                        <span className="text-orange-600 font-medium flex items-center gap-1">
                                            <User size={16} />
                                            Vendor
                                        </span>
                                        <span className="mt-1">{booking.assignedVendor}</span>
                                    </div>
                                    <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm">
                                        <span className="text-blue-600 font-medium flex items-center gap-1">
                                            <Truck size={16} />
                                            Delivery
                                        </span>
                                        <span className="mt-1">{booking.assignedDelivery}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Parts & Services Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Parts & Services</h3>

                                <div className="mb-6">
                                    <div className="bg-orange-50 p-3 rounded-lg mb-2">
                                        <h4 className="font-medium text-orange-800 flex items-center gap-2 mb-2">
                                            <Package size={16} className="text-orange-600" />
                                            Parts Used
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-orange-200">
                                                        <th className="text-left py-2 px-2 text-sm text-orange-700">Part</th>
                                                        <th className="text-center py-2 px-2 text-sm text-orange-700">Qty</th>
                                                        <th className="text-right py-2 px-2 text-sm text-orange-700">Price</th>
                                                        <th className="text-right py-2 px-2 text-sm text-orange-700">Disc. Price</th>
                                                        <th className="text-right py-2 px-2 text-sm text-orange-700">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {booking.partsUsed.map((part, index) => (
                                                        <tr key={index} className="border-b border-orange-100 last:border-0">
                                                            <td className="py-2 px-2">{part.partName}</td>
                                                            <td className="py-2 px-2 text-center">{part.quantity}</td>
                                                            <td className="py-2 px-2 text-right">₹{part.price}</td>
                                                            <td className="py-2 px-2 text-right">₹{part.discountPrice}</td>
                                                            <td className="py-2 px-2 text-right font-medium">
                                                                ₹{part.discountPrice * part.quantity}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-teal-50 p-3 rounded-lg">
                                        <h4 className="font-medium text-teal-800 flex items-center gap-2 mb-2">
                                            <Wrench size={16} className="text-teal-600" />
                                            Services Provided
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-teal-200">
                                                        <th className="text-left py-2 px-2 text-sm text-teal-700">Service</th>
                                                        <th className="text-center py-2 px-2 text-sm text-teal-700">Qty</th>
                                                        <th className="text-right py-2 px-2 text-sm text-teal-700">Price</th>
                                                        <th className="text-right py-2 px-2 text-sm text-teal-700">Disc. Price</th>
                                                        <th className="text-right py-2 px-2 text-sm text-teal-700">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {booking.serviceProvided.map((service, index) => (
                                                        <tr key={index} className="border-b border-teal-100 last:border-0">
                                                            <td className="py-2 px-2">{service.serviceName}</td>
                                                            <td className="py-2 px-2 text-center">{service.quantity}</td>
                                                            <td className="py-2 px-2 text-right">₹{service.price}</td>
                                                            <td className="py-2 px-2 text-right">
                                                                ₹{service.discountPrice || service.price}
                                                            </td>
                                                            <td className="py-2 px-2 text-right font-medium">
                                                                ₹{(service.discountPrice || service.price) * service.quantity}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <DollarSign className="text-white" />
                                    Payment Summary
                                </h3>
                                <div className="grid grid-cols-1 gap-1">
                                    <div className="flex justify-between items-center py-1">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">₹{booking.total.subTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span>Discount ({booking.total.discountType === 'percentage' ? `${booking.total.discount}%` : `₹${booking.total.discount}`}):</span>
                                        <span className="font-medium">-₹{booking.total.subTotal - booking.total.total}</span>
                                    </div>
                                    <div className="h-px bg-white/30 my-2"></div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-lg font-bold">Total:</span>
                                        <span className="text-lg font-bold">₹{booking.total.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}