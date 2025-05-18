import React, { useEffect, useState, useCallback } from 'react'
import Heading from './ui/Heading'
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import { UserPen, Plus, Wrench, Truck, Store, Calendar, Clock, CreditCard, MessageSquare, RefreshCw } from 'lucide-react';
import { formatDate, formatTime } from '../utils/DateFormate';
import SelectMechanicDialog from './ui/SelectMechanicDialog';
import SelectDeliveryDialog from './ui/SelectDeliveryDialog';
import SelectVendorDialog from './ui/SelectVendorDialog';
import { Link } from 'react-router-dom';

export default function JobAsssignForm({ id }) {
    console.log(id)
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [vendors, setVendors] = useState([])
    const [mechanic, setMechanic] = useState([])
    const [delivery, setDelivery] = useState([])
    const [orderId, setOrderById] = useState({})
    const [modalloading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('user');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [mechanicDialogOpen, setMechanicDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

    // Dialog handlers
    const handleMechanicDialogOpen = () => setMechanicDialogOpen(true);
    const handleMechanicDialogClose = () => {
        setMechanicDialogOpen(false);
        // Trigger refresh after closing dialog
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDeliveryDialogOpen = () => setDeliveryDialogOpen(true);
    const handleDeliveryDialogClose = () => {
        setDeliveryDialogOpen(false);
        // Trigger refresh after closing dialog
        setRefreshTrigger(prev => prev + 1);
    };

    const handleVendorDialogOpen = () => setVendorDialogOpen(true);
    const handleVendorDialogClose = () => {
        setVendorDialogOpen(false);
        // Trigger refresh after closing dialog
        setRefreshTrigger(prev => prev + 1);
    };

    // Extract fetchDetails to a separate function so it can be called after updates
    const fetchDetails = useCallback(async () => {
        if (!id) return;

        try {
            setModalLoading(true);

            const results = await Promise.allSettled([
                axiosClient.get('/api/vendor/getallvendor'),
                axiosClient.get('/api/admin/employee/getallemployee?position=mechanic'),
                axiosClient.get('/api/admin/employee/getallemployee?position=delivery'),
                axiosClient.get(`/api/admin/order/employee/getorderbyid/${id}`),
            ]);

            // Handle each result individually
            const vendorsData = results[0].status === "fulfilled" ? results[0].value.data.vendors : [];
            const employeesData = results[1].status === "fulfilled" ? results[1].value.data.employees : [];
            const deliveryData = results[2].status === "fulfilled" ? results[2].value.data.employees : [];
            const orderDetail = results[3].status === "fulfilled" ? results[3].value.data : null;

            // Update state
            setVendors(vendorsData);
            setMechanic(employeesData);
            setDelivery(deliveryData);

            if (orderDetail) {
                setOrderById(orderDetail);
            } else {
                setSnackBarMessage("Failed to fetch order details.");
                setSnackBarSeverity("error");
                setSnackBarOpen(true);
            }

            setModalLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setSnackBarMessage("An unexpected error occurred.");
            setSnackBarSeverity("error");
            setSnackBarOpen(true);
            setModalLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails, refreshTrigger]); // Add refreshTrigger as a dependency

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    }

    const updateOrderStatus = async () => {
        try {
            setLoading(true);
            if (!orderId.status) {
                setSnackBarMessage("Please select a valid status before updating.");
                setSnackBarSeverity('warning');
                setSnackBarOpen(true);
                setLoading(false);
                return;
            }

            const response = await axiosClient.put(`/api/admin/order/updateStatus/${orderId._id}`, {
                status: orderId.status,
            });

            if (response.status === 200) {
                setSnackBarMessage("Order status updated successfully!");
                setSnackBarSeverity('success');
                setSnackBarOpen(true);
                // Refresh data after successful update
                fetchDetails();

            } else {
                setSnackBarMessage("Failed to update order status. Please try again.");
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            setSnackBarMessage(error.message || "An error occurred while updating the order status.");
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case 'In Progress': return 'bg-blue-100 border-blue-500 text-blue-700';
            case 'Completed': return 'bg-green-100 border-green-500 text-green-700';
            case 'Cancelled': return 'bg-red-100 border-red-500 text-red-700';
            default: return 'bg-gray-100 border-gray-500 text-gray-700';
        }
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />
            <SelectMechanicDialog
                open={mechanicDialogOpen}
                onClose={handleMechanicDialogClose}
                data={mechanic}
                bookingId={orderId._id}
            />
            <SelectDeliveryDialog
                open={deliveryDialogOpen}
                onClose={handleDeliveryDialogClose}
                data={delivery}
                bookingId={orderId._id}
            />
            <SelectVendorDialog
                open={vendorDialogOpen}
                onClose={handleVendorDialogClose}
                data={vendors}
                bookingId={orderId._id}
            />

            {modalloading ? (
                <div className='flex items-center justify-center p-10'>
                    <CircularLoading />
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg shadow-md">
                    <div className='p-4'>
                        <div>
                            <div className="flex items-center gap-2">
                                <Heading heading={<span className="text-2xl font-bold" style={{ color: '#e2a731' }}>
                                    Handle Order
                                </span>} />
                                <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderId.status || 'Pending')}`}>
                                    {orderId.status || 'Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b mb-4">
                            <button
                                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'user' ? 'border-b-2 text-yellow-600 border-yellow-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('user')}
                            >
                                <UserPen size={18} className="mr-2" />
                                Customer Details
                            </button>
                            <button
                                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'bike' ? 'border-b-2 text-yellow-600 border-yellow-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('bike')}
                            >
                                <Wrench size={18} className="mr-2" />
                                Bike & Service
                            </button>
                            <button
                                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'vendor' ? 'border-b-2 text-yellow-600 border-yellow-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('vendor')}
                            >
                                <Store size={18} className="mr-2" />
                                Vendor & Parts
                            </button>
                            <button
                                className={`px-4 py-2 font-medium flex items-center ${activeTab === 'other' ? 'border-b-2 text-yellow-600 border-yellow-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('other')}
                            >
                                <Calendar size={18} className="mr-2" />
                                Schedule & Status
                            </button>
                        </div>

                        {/* User Details Tab */}
                        {activeTab === 'user' && (
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                        <UserPen size={24} style={{ color: '#e2a731' }} />
                                    </div>
                                    <h3 className="text-lg font-semibold" style={{ color: '#e2a731' }}>Customer Information</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm uppercase text-gray-500 mb-2">Personal Details</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">Name:</span>
                                                <span className="text-gray-700">{orderId.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">Phone:</span>
                                                <span className="text-gray-700">{orderId.contactNo || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">Email:</span>
                                                <span className="text-gray-700">{orderId.email || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm uppercase text-gray-500 mb-2">Location Details</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">City:</span>
                                                <span className="text-gray-700">{orderId.city || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">Address:</span>
                                                <span className="text-gray-700">{orderId.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bike & Service Details Tab */}
                        {activeTab === 'bike' && (
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                        <Wrench size={24} style={{ color: '#e2a731' }} />
                                    </div>
                                    <h3 className="text-lg font-semibold" style={{ color: '#e2a731' }}>Bike and Service Details</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm uppercase text-gray-500 mb-2">Bike Information</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">Brand:</span>
                                                <span className="text-gray-700">{orderId.selectedBrand || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">Model:</span>
                                                <span className="text-gray-700">{orderId.selectedModel === "other" ? orderId.modelName : orderId.selectedModel || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">CC:</span>
                                                <span className="text-gray-700">{orderId.cc || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-semibold w-20">Bs:</span>
                                                <span className="text-gray-700">{orderId.bs || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm uppercase text-gray-500 mb-2">Service Requirements</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="font-semibold">Services:</span>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    {orderId?.services?.map((service, index) => (
                                                        <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                            {service}
                                                        </span>
                                                    )) || <span className="text-gray-500">N/A</span>}
                                                </div>
                                            </div>
                                            {orderId.otherService && (
                                                <div className="mt-2">
                                                    <span className="font-semibold">Other Service:</span>
                                                    <p className="mt-1 text-gray-700">{orderId.otherService}</p>
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                <span className="font-semibold">Issues:</span>
                                                <p className="mt-1 text-gray-700">{orderId.issues || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <h4 className="text-sm uppercase text-yellow-700 mb-2">Mechanic Assignment</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold">Assigned Mechanic:</span>
                                            <span className="ml-2">
                                                {orderId.assignedMechanic ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                                        {orderId.assignedMechanic}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                                                        Not Assigned
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleMechanicDialogOpen}
                                            className="px-4 py-2 rounded flex items-center text-white shadow-sm transition-all hover:shadow"
                                            style={{ backgroundColor: '#e2a731' }}
                                        >
                                            {orderId.assignedMechanic ? (
                                                <>
                                                    <RefreshCw size={16} className="mr-2" />
                                                    Change Mechanic
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={16} className="mr-2" />
                                                    Assign Mechanic
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vendor & Parts Tab */}
                        {activeTab === 'vendor' && (
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                        <Store size={24} style={{ color: '#e2a731' }} />
                                    </div>
                                    <h3 className="text-lg font-semibold" style={{ color: '#e2a731' }}>Vendors and Parts</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                            <h4 className="text-sm uppercase text-gray-500 mb-2">Parts Required</h4>
                                            {orderId?.partsUsed?.length > 0 ? (
                                                <div className="space-y-2">
                                                    {orderId.partsUsed.map((part, index) => (
                                                        <div key={index} className="p-2 bg-white rounded border border-gray-200 flex justify-between">
                                                            <span>{part.partName}</span>
                                                            <div>
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-2">
                                                                    Qty: {part.quantity}
                                                                </span>
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                                    ₹{part.price}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">No parts required</div>
                                            )}
                                        </div>

                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                            <h4 className="text-sm uppercase text-yellow-700 mb-2">Vendor Assignment</h4>
                                            <div className="flex flex-col space-y-4 items-center justify-between">
                                                <div className='flex flex-col space-y-4'>
                                                    <span className="font-semibold">Assigned Vendor:</span>
                                                    <span className="ml-2">
                                                        {orderId.assignedVendor ? (
                                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                                                {orderId.assignedVendor}
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                                                                Not Assigned
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleVendorDialogOpen}
                                                    className="px-4 py-2 rounded flex items-center text-white shadow-sm transition-all hover:shadow"
                                                    style={{ backgroundColor: '#e2a731' }}
                                                >
                                                    {orderId.assignedVendor ? (
                                                        <>
                                                            <RefreshCw size={16} className="mr-2" />
                                                            Change Vendor
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus size={16} className="mr-2" />
                                                            Assign Vendor
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 h-fit">
                                        <h4 className="text-sm uppercase text-yellow-700 mb-2">Delivery Assignment</h4>
                                        <div className="flex flex-col items-center space-y-4 justify-between">
                                            <div className='flex flex-col space-y-4'>
                                                <span className="font-semibold">Assigned Delivery:</span>
                                                <span className="ml-2">
                                                    {orderId.assignedDelivery ? (
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                                            {orderId.assignedDelivery}
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                                                            Not Assigned
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleDeliveryDialogOpen}
                                                className="px-4 py-2 rounded flex items-center text-white shadow-sm transition-all hover:shadow"
                                                style={{ backgroundColor: '#e2a731' }}
                                            >
                                                {orderId.assignedDelivery ? (
                                                    <>
                                                        <RefreshCw size={16} className="mr-2" />
                                                        Change Delivery
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={16} className="mr-2" />
                                                        Assign Delivery
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Details Tab */}
                        {activeTab === 'other' && (
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                        <Calendar size={24} style={{ color: '#e2a731' }} />
                                    </div>
                                    <h3 className="text-lg font-semibold" style={{ color: '#e2a731' }}>Schedule and Status</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm uppercase text-gray-500 mb-2">Time Preferences</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                                    <Calendar size={16} style={{ color: '#e2a731' }} />
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Preferred Date</span>
                                                    <p className="font-medium">{formatDate(orderId.preferredDate) || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                                    <Clock size={16} style={{ color: '#e2a731' }} />
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Preferred Time</span>
                                                    <p className="font-medium">{formatTime(orderId.preferredTime) || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm uppercase text-gray-500 mb-2">Payment Details</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                                    <CreditCard size={16} style={{ color: '#e2a731' }} />
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Estimated Budget</span>
                                                    <p className="font-medium">₹{orderId.estimatedBudget || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                                    <MessageSquare size={16} style={{ color: '#e2a731' }} />
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Customer Notes</span>
                                                    <p className="font-medium line-clamp-2">{orderId.issues || 'No additional notes'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <h4 className="text-sm uppercase text-yellow-700 mb-2">Order Status</h4>
                                    <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                                        <div className="flex-grow">
                                            <div className="relative pt-1">
                                                <div className="flex mb-2 items-center justify-between">
                                                    <div>
                                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full" style={{ backgroundColor: '#e2a731', color: 'white' }}>
                                                            Status
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: orderId.status === 'Pending' ? '25%' :
                                                                orderId.status === 'In Progress' ? '50%' :
                                                                    orderId.status === 'Mechanic Assigned' ? '75%' :
                                                                        orderId.status === 'Completed' ? '100%' :
                                                                            orderId.status === 'Invoice Generated' ? '100%' :
                                                                                orderId.status === 'Cancelled' ? '100%' : '0%',
                                                            backgroundColor: orderId.status === 'Cancelled' ? '#ef4444' : '#e2a731'
                                                        }}>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <select
                                            className={`p-2 rounded border-2 transition-colors duration-200 outline-none ${orderId.status === 'Pending' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                                orderId.status === 'In Progress' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                                                    orderId.status === 'Mechanic Assigned' ? 'border-indigo-500 text-indigo-700 bg-indigo-50' :
                                                        orderId.status === 'Completed' ? 'border-green-500 text-green-700 bg-green-50' :
                                                            orderId.status === 'Invoice Generated' ? 'border-purple-500 text-purple-700 bg-purple-50' :
                                                                'border-red-500 text-red-700 bg-red-50'
                                                }`}
                                            value={orderId.status || 'Pending'}
                                            onChange={(e) => {
                                                const updatedStatus = e.target.value;
                                                setOrderById((prev) => ({
                                                    ...prev,
                                                    status: updatedStatus,
                                                }));
                                            }}
                                        >
                                            <option value="Pending" className="text-yellow-700 bg-yellow-50">Pending</option>
                                            <option value="In Progress" className="text-blue-700 bg-blue-50">In Progress</option>
                                            <option value="Mechanic Assigned" className="text-indigo-700 bg-indigo-50">Mechanic Assigned</option>
                                            <option value="Completed" className="text-green-700 bg-green-50">Completed</option>
                                            <option value="Cancelled" className="text-red-700 bg-red-50">Cancelled</option>
                                            <option value="Invoice Generated" disabled className="text-purple-700 bg-purple-50">Invoice Generated</option>
                                        </select>


                                        <button
                                            onClick={updateOrderStatus}
                                            className="px-6 py-2 rounded-md flex items-center justify-center text-white shadow-sm transition-all hover:shadow-md min-w-40"
                                            style={{ backgroundColor: '#e2a731' }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <CircularLoading size={24} color="white" />
                                            ) : (
                                                <>
                                                    <RefreshCw size={16} className="mr-2" />
                                                    Update Status
                                                </>
                                            )}</button>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="text-sm uppercase text-gray-500 mb-2">Order Timeline</h4>
                                        <div className="relative">
                                            {/* Timeline track */}
                                            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

                                            {/* Timeline points */}
                                            <div className="space-y-6 relative pl-10 pt-2 pb-2">

                                                {/* Order Placed */}
                                                <div className="relative">
                                                    <div className={`absolute -left-6 h-4 w-4 rounded-full ${orderId.createdAt ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></div>
                                                    <h5 className="text-sm font-medium">Order Placed</h5>
                                                    <p className="text-xs text-gray-500">
                                                        {orderId.createdAt ? new Date(orderId.createdAt).toLocaleString() : 'Pending'}
                                                    </p>
                                                </div>

                                                {/* Mechanic Assigned */}
                                                <div className="relative">
                                                    <div className={`absolute -left-6 h-4 w-4 rounded-full ${orderId.assignedMechanic ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></div>
                                                    <h5 className="text-sm font-medium">Mechanic Assigned</h5>
                                                    <p className="text-xs text-gray-500">
                                                        {orderId.assignedMechanic || 'Pending'}
                                                    </p>
                                                </div>

                                                {/* Work In Progress */}
                                                <div className="relative">
                                                    <div className={`absolute -left-6 h-4 w-4 rounded-full ${['In Progress', 'Completed', 'Invoice Generated'].includes(orderId.status) ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></div>
                                                    <h5 className="text-sm font-medium">Work In Progress</h5>
                                                    <p className="text-xs text-gray-500">
                                                        {['In Progress', 'Completed', 'Invoice Generated'].includes(orderId.status) ? 'Started' : 'Pending'}
                                                    </p>
                                                </div>

                                                {/* Service Completed */}
                                                <div className="relative">
                                                    <div className={`absolute -left-6 h-4 w-4 rounded-full ${['Completed', 'Invoice Generated'].includes(orderId.status) ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></div>
                                                    <h5 className="text-sm font-medium">Service Completed</h5>
                                                    <p className="text-xs text-gray-500">
                                                        {['Completed', 'Invoice Generated'].includes(orderId.status) ? 'Finished' : 'Pending'}
                                                    </p>
                                                </div>

                                                {/* Invoice Generated */}
                                                <div className="relative">
                                                    <div className={`absolute -left-6 h-4 w-4 rounded-full ${orderId.status === 'Invoice Generated' ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></div>
                                                    <h5 className="text-sm font-medium">Invoice Generated</h5>
                                                    <p className="text-xs text-gray-500">
                                                        {orderId.status === 'Invoice Generated' ? 'Generated' : 'Pending'}
                                                    </p>
                                                </div>

                                                {/* Cancelled */}
                                                <div className="relative">
                                                    <div className={`absolute -left-6 h-4 w-4 rounded-full ${orderId.status === 'Cancelled' ? 'bg-red-500' : 'bg-gray-300'} border-2 border-white`}></div>
                                                    <h5 className="text-sm font-medium text-red-600">Cancelled</h5>
                                                    <p className="text-xs text-red-500">
                                                        {orderId.status === 'Cancelled' ? 'Order Cancelled' : ''}
                                                    </p>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bottom Action Bar */}
                        <div className="mt-6 flex justify-end gap-4">
                            {/* <button
                                onClick={() => {
                                    // Reset form or navigate back logic here
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors border border-gray-300 shadow-sm"
                            >
                                Cancel
                            </button> */}
                            <Link
                                to={(orderId.status === 'Completed' || orderId.status === "Invoice Generated") ? `/generate-invoice-form/${orderId._id}` : '#'}
                                onClick={(e) => {
                                    if (loading || (orderId.status !== 'Completed' && orderId.status !== "Invoice Generated")) {
                                        e.preventDefault(); // Prevent navigation
                                    } else {
                                        updateOrderStatus(); // Optional function call
                                    }
                                }}
                                className={`px-6 py-2 rounded-md flex items-center justify-center text-white shadow-sm transition-all hover:shadow-md 
        ${(orderId.status === 'Completed' || orderId.status === "Invoice Generated") && !loading
                                        ? 'hover:bg-yellow-600 bg-[#e2a731]'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? (
                                    <CircularLoading size={24} color="white" />
                                ) : (
                                    <>
                                        <RefreshCw size={16} className="mr-2" />
                                        Generate Invoice
                                    </>
                                )}
                            </Link>

                            <Link
                                to={orderId.status === 'Invoice Generated' ? `/order/invoice/${orderId._id}` : '#'}
                                onClick={(e) => {
                                    if (orderId.status !== 'Invoice Generated') {
                                        e.preventDefault(); // Prevent navigation if not Invoice Generated
                                    }
                                }}
                                className={`px-6 py-2 rounded-md flex items-center justify-center shadow-sm transition-all hover:shadow-md border-2
        ${orderId.status === 'Invoice Generated'
                                        ? 'border-purple-500 text-purple-700 bg-purple-100 hover:bg-purple-200'
                                        : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                View Invoice
                            </Link>

                        </div>
                    </div>
                </div >
            )
            }
        </>
    )
}