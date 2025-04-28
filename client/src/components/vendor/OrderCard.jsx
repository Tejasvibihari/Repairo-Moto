import React, { useState } from 'react';
import axiosClient from '../../service/axiosClient';

export default function OrderCard({ booking }) {
    // Extract data from booking object
    const {
        name,
        contactNo,
        selectedBrand,
        selectedModel,
        modelName,
        cc,
        status,
        assignedDelivery,
        issues,
        partsUsed,
        _id,
        estimatedBudget
    } = booking || {};

    // Show/hide parts list toggle
    const [showParts, setShowParts] = useState(false);
    // Dialog control
    const [showPriceDialog, setShowPriceDialog] = useState(false);
    // Track updated parts (with prices)
    const [updatedParts, setUpdatedParts] = useState([]);
    // Loading state for save operation
    const [isSaving, setIsSaving] = useState(false);
    // Save feedback message state
    const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });

    // Primary color variables
    const primaryColor = "#e2a731";

    // When dialog opens, initialize updatedParts with existing parts data
    const handleOpenPriceDialog = () => {
        if (status?.toLowerCase() !== 'in progress') return;

        const initialParts = Array.isArray(partsUsed) ? partsUsed.map(part => ({
            ...part,
            price: part.price || 0,
            discountPrice: part.discountPrice || 0
        })) : [];

        setUpdatedParts(initialParts);
        setSaveMessage({ type: '', message: '' });
        setShowPriceDialog(true);
    };

    // Function to handle price and discount changes
    const handlePriceChange = (index, field, value) => {
        const newParts = [...updatedParts];
        newParts[index][field] = parseFloat(value) || 0;
        setUpdatedParts(newParts);
    };

    // Calculate totals
    const calculateTotals = () => {
        if (!Array.isArray(updatedParts) || updatedParts.length === 0) return { total: 0, discountTotal: 0 };

        return updatedParts.reduce(
            (acc, part) => {
                const quantity = part.quantity || 0;
                const price = part.price || 0;
                const discountPrice = part.discountPrice || 0;

                return {
                    total: acc.total + (price * quantity),
                    discountTotal: acc.discountTotal + (discountPrice * quantity)
                };
            },
            { total: 0, discountTotal: 0 }
        );
    };

    // Function to save price updates to the backend
    const handleSavePrices = async () => {
        if (!_id) {
            setSaveMessage({ type: 'error', message: 'Order ID is missing' });
            return;
        }
        try {
            setIsSaving(true);
            setSaveMessage({ type: '', message: '' });
            // Prepare parts data for API
            const partsData = updatedParts.map(part => ({
                partName: part.partName,
                quantity: part.quantity,
                price: part.price,
                discountPrice: part.discountPrice
            }));

            // Make API call to update parts pricing
            const response = await axiosClient.put(`/api/admin/order/bookings/${_id}/update-parts-price`, { partsUsed: partsData });
            console.log(response);
            setSaveMessage({ type: 'success', message: 'Parts pricing updated successfully' });
            setTimeout(() => {
                setShowPriceDialog(false);
            }, 2000);

        } catch (error) {
            console.error("Error updating parts pricing:", error);
            setSaveMessage({ type: 'error', message: error.message || 'An error occurred while updating parts pricing' });
        } finally {
            setIsSaving(false);
        }
    };

    // Function to determine status color
    const getStatusColor = () => {
        switch ((status || '').toLowerCase()) {
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

    // Safe function to get ID string from MongoDB ObjectId
    const getShortId = (objectId) => {
        if (objectId && objectId.$oid) {
            return objectId.$oid.substring(objectId.$oid.length - 6).toUpperCase();
        }
        return typeof objectId === 'string' ? objectId.substring(objectId.length - 6).toUpperCase() : 'N/A';
    };

    // Check if the order status allows price updates
    const canUpdatePrices = status?.toLowerCase() === 'in progress';

    // Calculate totals for display
    const { total, discountTotal } = calculateTotals();

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg border-t-4 border-primary my-4">
            <div className="space-y-4">
                {/* Order Header */}
                <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: `${primaryColor}40` }}>
                    <h3 className="text-lg font-medium" style={{ color: primaryColor }}>Order Details</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                        {status || 'Pending'}
                    </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center space-x-3">
                    <div className="rounded-full p-2" style={{ backgroundColor: `${primaryColor}30` }}>
                        <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>{name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{contactNo || 'No phone number'}</p>
                    </div>
                </div>

                {/* Delivery Person Info */}
                <div className="flex items-center space-x-3">
                    <div className="rounded-full p-2" style={{ backgroundColor: `${primaryColor}30` }}>
                        <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Delivery Person</p>
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>{assignedDelivery || 'Not assigned'}</p>
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
                            <p className="text-sm font-semibold" style={{ color: primaryColor }}>{selectedBrand || 'N/A'}</p>
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
                            <p className="text-sm font-semibold" style={{ color: primaryColor }}>{selectedModel === "other" ? modelName : selectedModel}</p>
                            <p className="text-xs text-gray-500">{cc || ''}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="rounded-full p-2" style={{ backgroundColor: `${primaryColor}30` }}>
                            <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Issues</p>
                            <p className="text-sm font-semibold" style={{ color: primaryColor }}>{issues || 'None specified'}</p>
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
                            <span className="text-sm font-medium" style={{ color: primaryColor }}>Parts for Service</span>
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

                {/* Parts List - Updated to show price and discount price */}
                {showParts && (
                    <div className="bg-gray-50 rounded-md p-3 border mt-2" style={{ borderColor: `${primaryColor}30` }}>
                        <div className="grid grid-cols-12 text-xs font-medium text-gray-500 mb-2">
                            <div className="col-span-1">#</div>
                            <div className="col-span-4">Part Name</div>
                            <div className="col-span-1 text-center">Qty</div>
                            <div className="col-span-2 text-center">Price (₹)</div>
                            <div className="col-span-2 text-center">Disc. Price (₹)</div>
                            <div className="col-span-2 text-right">Total (₹)</div>
                        </div>

                        {Array.isArray(partsUsed) && partsUsed.map((part, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-12 text-sm py-2 ${index !== (partsUsed || []).length - 1 ? 'border-b' : ''}`}
                                style={{ borderColor: `${primaryColor}20` }}
                            >
                                <div className="col-span-1 text-gray-500">{index + 1}</div>
                                <div className="col-span-4 font-medium">{part.partName || 'Unknown Part'}</div>
                                <div className="col-span-1 text-center">{part.quantity || 0}</div>
                                <div className="col-span-2 text-center">{part.price || 0}</div>
                                <div className="col-span-2 text-center">
                                    {part.discountPrice ? part.discountPrice : '-'}
                                </div>
                                <div className="col-span-2 text-right">
                                    {((part.discountPrice || part.price) * part.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}

                        {(!Array.isArray(partsUsed) || partsUsed.length === 0) && (
                            <div className="text-sm py-2 text-gray-500 text-center">
                                No parts have been added yet
                            </div>
                        )}

                        {Array.isArray(partsUsed) && partsUsed.length > 0 && (
                            <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm" style={{ borderColor: `${primaryColor}20` }}>
                                <div className="text-xs text-gray-500 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>
                                        Total items: {partsUsed.reduce((acc, part) => acc + (part.quantity || 0), 0)}
                                    </span>
                                </div>
                                <div className="font-medium" style={{ color: primaryColor }}>
                                    Total: ₹{partsUsed.reduce((acc, part) => {
                                        const price = part.discountPrice > 0 ? part.discountPrice : part.price;
                                        return acc + (price * part.quantity);
                                    }, 0).toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center" style={{ borderColor: `${primaryColor}40` }}>
                    <div className="text-xs text-gray-500">
                        Order #: {getShortId(_id)}
                        <div className="mt-1">Budget: ₹{estimatedBudget || 'N/A'}</div>
                    </div>
                    <button
                        className={`text-xs font-medium px-3 py-1 rounded-full ${!canUpdatePrices && status?.toLowerCase() === 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                        onClick={canUpdatePrices ? handleOpenPriceDialog : undefined}
                        disabled={!canUpdatePrices && status?.toLowerCase() === 'completed'}
                    >
                        {showParts ? (canUpdatePrices ? 'Update Parts Price' : 'View Details') : 'View Details'}
                    </button>
                </div>
            </div>

            {/* Price Update Dialog */}
            {showPriceDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium" style={{ color: primaryColor }}>Update Parts Pricing</h3>
                            <button
                                onClick={() => setShowPriceDialog(false)}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Save feedback message */}
                        {saveMessage.message && (
                            <div
                                className={`p-3 mb-4 rounded-md ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                            >
                                <div className="flex items-center">
                                    {saveMessage.type === 'success' ? (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    )}
                                    {saveMessage.message}
                                </div>
                            </div>
                        )}

                        {/* Parts Pricing Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Price (₹)</th>
                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {updatedParts.map((part, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.partName}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-500">{part.quantity}</td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="border border-gray-300 rounded-md p-1 w-24 text-center"
                                                    value={part.price || 0}
                                                    onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="border border-gray-300 rounded-md p-1 w-24 text-center"
                                                    value={part.discountPrice || 0}
                                                    onChange={(e) => handlePriceChange(index, 'discountPrice', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                                ₹{((part.price || 0) * (part.quantity || 0)).toFixed(2)}
                                                {part.discountPrice > 0 && (
                                                    <div className="text-xs text-green-600">
                                                        ₹{((part.discountPrice || 0) * (part.quantity || 0)).toFixed(2)}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50">
                                        <td colSpan="4" className="px-3 py-3 text-sm font-medium text-right text-gray-700">Total Amount:</td>
                                        <td className="px-3 py-3 text-sm font-medium text-right text-gray-900">₹{total.toFixed(2)}</td>
                                    </tr>
                                    {discountTotal > 0 && (
                                        <tr className="bg-gray-50">
                                            <td colSpan="4" className="px-3 py-3 text-sm font-medium text-right text-gray-700">Discounted Total:</td>
                                            <td className="px-3 py-3 text-sm font-medium text-right text-green-600">₹{discountTotal.toFixed(2)}</td>
                                        </tr>
                                    )}
                                    {discountTotal > 0 && (
                                        <tr className="bg-gray-50">
                                            <td colSpan="4" className="px-3 py-3 text-sm font-medium text-right text-gray-700">You Save:</td>
                                            <td className="px-3 py-3 text-sm font-medium text-right text-green-600">₹{(total - discountTotal).toFixed(2)}</td>
                                        </tr>
                                    )}
                                </tfoot>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
                                onClick={() => setShowPriceDialog(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-opacity-90 flex items-center ${isSaving ? 'opacity-70' : ''}`}
                                style={{ backgroundColor: primaryColor }}
                                onClick={handleSavePrices}
                                disabled={isSaving}
                            >
                                {isSaving && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isSaving ? 'Saving...' : 'Save Prices'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}