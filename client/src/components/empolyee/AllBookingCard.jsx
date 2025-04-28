import React, { useState } from 'react';
import { Phone, Edit, Plus, X } from 'lucide-react';
import axiosClient from '../../service/axiosClient';

export default function AllBookingCard({ booking, onSaveParts }) {

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Now each part is an object: { name: "", quantity: 1 }
    const [newParts, setNewParts] = useState([{ name: '', quantity: 1 }]);

    console.log(newParts);

    const handleCall = () => {
        window.location.href = `tel:${booking.contactNo.replace(/\s+/g, '')}`;
    };

    const addPartInput = () => {
        setNewParts([...newParts, { name: '', quantity: 1 }]);
    };

    const updatePartInput = (index, field, value) => {
        const updatedParts = [...newParts];
        updatedParts[index][field] = field === 'quantity' ? parseInt(value) : value;
        setNewParts(updatedParts);
    };

    const removePartInput = (index) => {
        const updatedParts = newParts.filter((_, i) => i !== index);
        setNewParts(updatedParts);
    };

    const saveParts = async () => {
        const filteredParts = newParts.filter(part => part.name.trim() !== "");

        try {
            const response = await axiosClient.put(`/api/admin/order/bookings/${booking._id}/update-parts`, { partsUsed: filteredParts });
            console.log(response);
            booking.partsUsed = filteredParts;
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to update parts', error);
            alert('Failed to update parts!');
        }
    };

    const openPartsDialog = () => {
        if (booking.partsUsed.length > 0) {
            setNewParts(booking.partsUsed.map(part => ({
                name: typeof part === 'string' ? part : part.name,
                quantity: part.quantity || 1
            })));
        } else {
            setNewParts([{ name: '', quantity: 1 }]);
        }
        setIsDialogOpen(true);
    };

    const getStatusStyle = () => {
        switch (booking.status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "In Progress":
                return "bg-blue-100 text-blue-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <>
            <div className="w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 relative">

                <div className="absolute top-2 right-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
                        {booking.status}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 p-4 flex justify-center items-center">
                        <img
                            src={booking.image}
                            alt={`${booking.name}'s bike`}
                            className="rounded-lg w-32 h-32 object-cover"
                        />
                    </div>

                    <div className="w-full md:w-3/4 p-4">
                        <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{booking.name}</h2>
                                <p className="text-gray-600 text-sm">{booking.city}</p>
                                <div className="flex items-center mt-1">
                                    <p className="text-gray-600 text-sm">Mobile: {booking.contactNo}</p>
                                    <button
                                        onClick={handleCall}
                                        className="ml-3 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 flex items-center justify-center"
                                        aria-label="Call customer"
                                    >
                                        <Phone size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div className="bg-gray-100 p-2 rounded">
                                    <span className="text-xs text-gray-500">Bike Brand</span>
                                    <p className="font-medium">{booking.selectedBrand}</p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded">
                                    <span className="text-xs text-gray-500">Bike Model</span>
                                    <p className="font-medium">{booking.selectedModel === "Other" ? booking.modelName : booking.selectedModel}</p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded">
                                    <span className="text-xs text-gray-500">Engine CC</span>
                                    <p className="font-medium">{booking.cc} CC</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-semibold text-gray-700">Parts Used:</h3>
                                <button
                                    onClick={openPartsDialog}
                                    className="bg-blue-500 text-white p-1.5 rounded hover:bg-blue-600 flex items-center justify-center"
                                    aria-label="Edit parts"
                                >
                                    <Edit size={14} />
                                    <span className="ml-1 text-xs">Edit Parts</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {booking.partsUsed.length > 0 ? booking.partsUsed.map((part, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                                    >
                                        {typeof part === 'string' ? part : `${part.name} (x${part.quantity})`}
                                    </span>
                                )) : (
                                    <span className="text-gray-400 text-xs">No parts added</span>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Edit Parts Used</h3>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 mb-4">
                            {newParts.map((part, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={part.name}
                                        onChange={(e) => updatePartInput(index, 'name', e.target.value)}
                                        placeholder="Part name"
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        value={part.quantity}
                                        onChange={(e) => updatePartInput(index, 'quantity', e.target.value)}
                                        placeholder="Qty"
                                        className="w-20 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => removePartInput(index)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded"
                                        aria-label="Remove part"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addPartInput}
                            className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
                        >
                            <Plus size={16} className="mr-1" />
                            Add Another Part
                        </button>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveParts}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
