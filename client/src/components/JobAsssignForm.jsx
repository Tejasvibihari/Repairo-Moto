import React, { useEffect, useState, useCallback } from 'react'
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import {
    User, Wrench, Store, Calendar, Clock, CreditCard,
    MapPin, Phone, Mail, Bike, Package, Truck, RefreshCw,
    CheckCircle, Clock as ClockIcon, XCircle, FileText, DollarSign,
    Navigation, UserCheck, ExternalLink,
    IndianRupee
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/DateFormate';
import SelectMechanicDialog from './ui/SelectMechanicDialog';
import SelectDeliveryDialog from './ui/SelectDeliveryDialog';
import SelectVendorDialog from './ui/SelectVendorDialog';
import { Link } from 'react-router-dom';

export default function JobAsssignForm({ id }) {
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [vendors, setVendors] = useState([])
    const [mechanic, setMechanic] = useState([])
    const [delivery, setDelivery] = useState([])
    const [orderById, setOrderById] = useState({})
    const [modalLoading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('customer');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [mechanicDialogOpen, setMechanicDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

    const handleMechanicDialogOpen = () => setMechanicDialogOpen(true);
    const handleMechanicDialogClose = () => {
        setMechanicDialogOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDeliveryDialogOpen = () => setDeliveryDialogOpen(true);
    const handleDeliveryDialogClose = () => {
        setDeliveryDialogOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleVendorDialogOpen = () => setVendorDialogOpen(true);
    const handleVendorDialogClose = () => {
        setVendorDialogOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

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
            setVendors(results[0].status === "fulfilled" ? results[0].value.data.vendors : []);
            setMechanic(results[1].status === "fulfilled" ? results[1].value.data.employees : []);
            setDelivery(results[2].status === "fulfilled" ? results[2].value.data.employees : []);
            const orderDetail = results[3].status === "fulfilled" ? results[3].value.data : null;
            if (orderDetail) setOrderById(orderDetail);
            else {
                setSnackBarMessage("Failed to fetch order details.");
                setSnackBarSeverity("error");
                setSnackBarOpen(true);
            }
            setModalLoading(false);
        } catch (error) {
            console.error(error);
            setSnackBarMessage("An unexpected error occurred.");
            setSnackBarSeverity("error");
            setSnackBarOpen(true);
            setModalLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails, refreshTrigger]);

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    }

    const updateOrderStatus = async () => {
        try {
            setLoading(true);
            if (!orderById.status) {
                setSnackBarMessage("Please select a valid status.");
                setSnackBarSeverity('warning');
                setSnackBarOpen(true);
                setLoading(false);
                return;
            }
            const response = await axiosClient.put(`/api/admin/order/updateStatus/${orderById._id}`, {
                status: orderById.status,
            });
            if (response.status === 200) {
                setSnackBarMessage("Order status updated successfully!");
                setSnackBarSeverity('success');
                setSnackBarOpen(true);
                fetchDetails();
            } else {
                setSnackBarMessage("Failed to update status.");
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        } catch (error) {
            setSnackBarMessage(error.message || "Error updating status.");
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Pending': return { color: 'amber', icon: ClockIcon, label: 'Pending' };
            case 'In Progress': return { color: 'blue', icon: RefreshCw, label: 'In Progress' };
            case 'Mechanic Assigned': return { color: 'indigo', icon: UserCheck, label: 'Mechanic Assigned' };
            case 'Completed': return { color: 'green', icon: CheckCircle, label: 'Completed' };
            case 'Cancelled': return { color: 'red', icon: XCircle, label: 'Cancelled' };
            default: return { color: 'gray', icon: ClockIcon, label: status || 'Pending' };
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'green';
            case 'unpaid': return 'red';
            default: return 'gray';
        }
    };

    const getCustomerName = () => {
        if (orderById.userId?.firstName) return `${orderById.userId.firstName} ${orderById.userId.lastName || ''}`.trim();
        return orderById.name || 'N/A';
    };

    const getCustomerEmail = () => orderById.userId?.email || orderById.email || 'N/A';
    const getCustomerPhone = () => orderById.userId?.phone || orderById.contactNo || 'N/A';

    const statusConfig = getStatusConfig(orderById.status);
    const StatusIcon = statusConfig.icon;

    const sections = [
        { id: 'customer', label: 'Customer', icon: User },
        { id: 'bike', label: 'Bike & Service', icon: Bike },
        { id: 'vendor', label: 'Vendor & Parts', icon: Package },
        { id: 'schedule', label: 'Schedule & Status', icon: Calendar },
    ];

    // Function to open order in customer app
    const openInApp = () => {
        const appUrl = `https://yourapp.com/order/${orderById.orderId}`; // Replace with actual app URL
        window.open(appUrl, '_blank');
    };

    return (
        <>
            <AlertSnackBar open={snackBarOpen} message={snackBarMessage} severity={snackBarSeverity} onClose={handleCloseSnackBar} />
            <SelectMechanicDialog open={mechanicDialogOpen} onClose={handleMechanicDialogClose} data={mechanic} bookingId={orderById._id} />
            <SelectDeliveryDialog open={deliveryDialogOpen} onClose={handleDeliveryDialogClose} data={delivery} bookingId={orderById._id} />
            <SelectVendorDialog open={vendorDialogOpen} onClose={handleVendorDialogClose} data={vendors} bookingId={orderById._id} />

            {modalLoading ? (
                <div className="flex items-center justify-center p-16"><CircularLoading /></div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-[calc(100vh-100px)] flex flex-col">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 flex-shrink-0">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Order #{orderById.orderId || 'N/A'}</h1>
                                <p className="text-amber-100 text-sm mt-1">Manage order details, assignments, and status</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                                    <StatusIcon size={18} className="text-white" />
                                    <span className="text-white font-medium">{statusConfig.label}</span>
                                </div>
                                <div className={`bg-${getPaymentStatusColor(orderById.paymentStatus)}-100 rounded-full px-4 py-2 flex items-center gap-2`}>
                                    <IndianRupee size={18} className={`text-${getPaymentStatusColor(orderById.paymentStatus)}-700`} />
                                    <span className={`font-medium text-${getPaymentStatusColor(orderById.paymentStatus)}-700`}>
                                        {orderById.paymentStatus === 'paid' ? 'Paid' : orderById.paymentStatus === 'unpaid' ? 'Unpaid' : 'N/A'}
                                    </span>
                                </div>
                                {/* <button
                                    onClick={openInApp}
                                    className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 flex items-center gap-2 transition"
                                    title="View in Customer App"
                                >
                                    <ExternalLink size={18} />
                                    <span className="hidden sm:inline">Open in App</span>
                                </button> */}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col lg:flex-row">
                            {/* Sidebar - Order Summary */}
                            <div className="lg:w-80 bg-gray-50 border-r border-gray-200 p-5 space-y-6 flex-shrink-0">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                            <User size={22} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{getCustomerName()}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={12} /> {getCustomerPhone()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Location</h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-start gap-2 text-gray-600"><MapPin size={16} className="mt-0.5 flex-shrink-0" /> {orderById.address || 'N/A'}</p>
                                        <p className="flex items-center gap-2 text-gray-600"><Navigation size={16} /> {orderById.city || 'N/A'}</p>
                                        {orderById.isWithinServiceArea !== undefined && (
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${orderById.isWithinServiceArea ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {orderById.isWithinServiceArea ? 'Within Service Area' : 'Outside Service Area'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bike Info</h3>
                                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                        <p className="font-medium text-gray-800">{orderById.selectedBrand} {orderById.selectedModel}</p>
                                        <p className="text-xs text-gray-500">{orderById.cc}cc • {orderById.bs}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button onClick={handleMechanicDialogOpen} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-amber-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition">
                                            <Wrench size={16} /> {orderById.assignedMechanic ? 'Change Mechanic' : 'Assign Mechanic'}
                                        </button>
                                        <button onClick={handleVendorDialogOpen} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-amber-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition">
                                            <Store size={16} /> {orderById.assignedVendor ? 'Change Vendor' : 'Assign Vendor'}
                                        </button>
                                        <button onClick={handleDeliveryDialogOpen} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-amber-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition">
                                            <Truck size={16} /> {orderById.assignedDelivery ? 'Change Delivery' : 'Assign Delivery'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6">
                                {/* Section Tabs */}
                                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                                    {sections.map(section => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${activeSection === section.id
                                                    ? 'border-amber-500 text-amber-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                {section.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Customer Section */}
                                {activeSection === 'customer' && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><User size={18} /> Personal Details</h3>
                                                <div className="space-y-3">
                                                    <div><span className="text-gray-500 text-sm">Full Name</span><p className="font-medium">{getCustomerName()}</p></div>
                                                    <div><span className="text-gray-500 text-sm">Phone Number</span><p className="font-medium flex items-center gap-2"><Phone size={14} /> {getCustomerPhone()}</p></div>
                                                    <div><span className="text-gray-500 text-sm">Email Address</span><p className="font-medium flex items-center gap-2"><Mail size={14} /> {getCustomerEmail()}</p></div>
                                                    {/* <div><span className="text-gray-500 text-sm">User ID</span><p className="font-mono text-sm">{orderById.userId?._id || 'N/A'}</p></div> */}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><MapPin size={18} /> Address Details</h3>
                                                <div className="space-y-3">
                                                    <div><span className="text-gray-500 text-sm">City</span><p className="font-medium">{orderById.city || 'N/A'}</p></div>
                                                    <div><span className="text-gray-500 text-sm">Full Address</span><p className="text-gray-700">{orderById.address || 'N/A'}</p></div>
                                                    {/* Coordinates removed */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bike & Service Section */}
                                {activeSection === 'bike' && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><Bike size={18} /> Bike Specifications</h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between"><span className="text-gray-500">Brand</span><span className="font-medium">{orderById.selectedBrand || 'N/A'}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Model</span><span className="font-medium">{orderById.selectedModel === "other" ? orderById.modelName : orderById.selectedModel || 'N/A'}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">CC</span><span className="font-medium">{orderById.cc || 'N/A'}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">BS Standard</span><span className="font-medium">{orderById.bs || 'N/A'}</span></div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><Wrench size={18} /> Service Requirements</h3>
                                                <div className="space-y-3">
                                                    <div><span className="text-gray-500">Services</span><div className="flex flex-wrap gap-2 mt-1">{orderById.services?.map((s, i) => <span key={i} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">{s}</span>) || <span className="text-gray-400">None</span>}</div></div>
                                                    <div><span className="text-gray-500">Service Type</span><p className="font-medium">{orderById.serviceType || 'N/A'}</p></div>
                                                    <div><span className="text-gray-500">Issues Reported</span><p className="text-gray-700">{orderById.issues || 'No issues reported'}</p></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                                            <div className="flex flex-wrap justify-between items-center gap-4">
                                                <div><h3 className="font-semibold text-gray-800">Assigned Mechanic</h3><p className="text-amber-700">{orderById.assignedMechanic || 'Not assigned yet'}</p></div>
                                                <button onClick={handleMechanicDialogOpen} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"><RefreshCw size={16} /> {orderById.assignedMechanic ? 'Change' : 'Assign'} Mechanic</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Vendor & Parts Section */}
                                {activeSection === 'vendor' && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><Package size={18} /> Parts Used</h3>
                                                {orderById.partsUsed?.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {orderById.partsUsed.map((part, idx) => (
                                                            <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg border">
                                                                <span className="font-medium">{part.partName}</span>
                                                                <div className="flex gap-2 text-sm"><span className="text-blue-600">Qty: {part.quantity}</span><span className="text-green-600">₹{part.price}</span></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-gray-400 text-center py-4">No parts recorded</p>}
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Store size={18} /> Vendor</h3>
                                                    <p className="mt-2 text-amber-700">{orderById.assignedVendor || 'Not assigned'}</p>
                                                    <button onClick={handleVendorDialogOpen} className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition flex items-center gap-2"><RefreshCw size={16} /> {orderById.assignedVendor ? 'Change' : 'Assign'} Vendor</button>
                                                </div>
                                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Truck size={18} /> Delivery Partner</h3>
                                                    <p className="mt-2 text-amber-700">{orderById.assignedDelivery || 'Not assigned'}</p>
                                                    <button onClick={handleDeliveryDialogOpen} className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition flex items-center gap-2"><RefreshCw size={16} /> {orderById.assignedDelivery ? 'Change' : 'Assign'} Delivery</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule & Status Section */}
                                {activeSection === 'schedule' && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><Calendar size={18} /> Preferred Schedule</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3"><Clock size={16} className="text-gray-400" /><div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{formatDate(orderById.preferredDate) || 'N/A'}</p></div></div>
                                                    <div className="flex items-center gap-3"><Clock size={16} className="text-gray-400" /><div><p className="text-sm text-gray-500">Time</p><p className="font-medium">{orderById.preferredTime || 'N/A'}</p></div></div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-5">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4"><CreditCard size={18} /> Payment Summary</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getPaymentStatusColor(orderById.paymentStatus)}-100 text-${getPaymentStatusColor(orderById.paymentStatus)}-700`}>{orderById.paymentStatus === 'paid' ? 'Paid' : orderById.paymentStatus === 'unpaid' ? 'Unpaid' : 'N/A'}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Amount Paid</span><span className="font-medium">₹{orderById.amountPaid || 0}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Balance Due</span><span className="font-medium">₹{orderById.balanceDue || 0}</span></div>
                                                    {orderById.total?.finalPayable > 0 && <div className="flex justify-between pt-2 border-t"><span className="font-semibold">Total Amount</span><span className="font-bold text-amber-600">₹{orderById.total.finalPayable}</span></div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Update Card */}
                                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Update Order Status</h3>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <select value={orderById.status || 'Pending'} onChange={(e) => setOrderById(prev => ({ ...prev, status: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500">
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Mechanic Assigned">Mechanic Assigned</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                <button onClick={updateOrderStatus} disabled={loading} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition flex items-center gap-2">
                                                    {loading ? <CircularLoading size={20} color="white" /> : <><RefreshCw size={16} /> Update Status</>}
                                                </button>
                                            </div>
                                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: orderById.status === 'Pending' ? '25%' : orderById.status === 'In Progress' ? '50%' : orderById.status === 'Mechanic Assigned' ? '75%' : orderById.status === 'Completed' ? '100%' : orderById.status === 'Cancelled' ? '100%' : '0%' }}></div>
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="bg-gray-50 rounded-xl p-5">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Timeline</h3>
                                            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gray-300">
                                                {[
                                                    { label: 'Order Placed', time: orderById.createdAt, completed: !!orderById.createdAt },
                                                    { label: 'Mechanic Assigned', time: orderById.assignedMechanic, completed: !!orderById.assignedMechanic },
                                                    { label: 'Work In Progress', time: ['In Progress', 'Completed', 'Invoice Generated'].includes(orderById.status), completed: ['In Progress', 'Completed', 'Invoice Generated'].includes(orderById.status) },
                                                    { label: 'Service Completed', time: ['Completed', 'Invoice Generated'].includes(orderById.status), completed: ['Completed', 'Invoice Generated'].includes(orderById.status) },
                                                    { label: 'Invoice Generated', time: orderById.status === 'Invoice Generated', completed: orderById.status === 'Invoice Generated' }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="relative">
                                                        <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 border-white ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <p className="font-medium text-gray-800">{item.label}</p>
                                                        <p className="text-xs text-gray-500">{typeof item.time === 'string' ? (item.time.includes('T') ? new Date(item.time).toLocaleString() : item.time) : (item.completed ? 'Completed' : 'Pending')}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-gray-200">
                                    <Link to={(orderById.status === 'Completed' || orderById.status === "Invoice Generated") ? `/generate-invoice-form/${orderById._id}` : '#'} onClick={(e) => { if (loading || (orderById.status !== 'Completed' && orderById.status !== "Invoice Generated")) e.preventDefault(); }} className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${(orderById.status === 'Completed' || orderById.status === "Invoice Generated") && !loading ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                        <FileText size={18} /> Generate Invoice
                                    </Link>
                                    <Link to={orderById.status === 'Invoice Generated' ? `/order/invoice/${orderById._id}` : '#'} onClick={(e) => { if (orderById.status !== 'Invoice Generated') e.preventDefault(); }} className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 border-2 ${orderById.status === 'Invoice Generated' ? 'border-purple-500 text-purple-700 bg-purple-50 hover:bg-purple-100' : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'}`}>
                                        View Invoice
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}