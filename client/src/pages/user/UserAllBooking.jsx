import { useEffect, useState } from 'react';
import {
    Clock, CheckCircle, AlertCircle, XCircle, FileText,
    CreditCard, XOctagon, User
} from 'lucide-react';
import Footer from '../../components/landing/Footer';
import NavBar from '../../components/ui/NavBar';
import { motion } from "framer-motion";
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import axiosClient from '../../service/axiosClient';
import { useSelector } from 'react-redux';
import CircularLoading from '../../components/ui/CircularLoading';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import { Link } from 'react-router-dom';

// Material-UI Dialog imports (assuming MUI v5)
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';

export default function UserAllBooking() {
    const user = useSelector((state) => state.user.user.user);
    const [allOrder, setAllOrder] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    // Cancel dialog states
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Fetch orders function (reusable)
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/admin/order/all`);
            const sortedOrders = response.data.orders.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setAllOrder(sortedOrders);
        } catch (error) {
            console.log(error);
            setSnackBarMessage(
                error?.response?.data?.message ||
                error?.message ||
                "An unexpected error occurred"
            );
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Open cancel dialog for a specific order
    const openCancelDialog = (orderId) => {
        setSelectedOrderId(orderId);
        setCancellationReason('');
        setCancelDialogOpen(true);
    };

    // Close dialog without cancelling
    const closeCancelDialog = () => {
        setCancelDialogOpen(false);
        setSelectedOrderId(null);
        setCancellationReason('');
    };

    // Confirm cancellation with reason
    const confirmCancel = async () => {
        // Validate reason
        if (!cancellationReason.trim()) {
            setSnackBarMessage('Please provide a reason for cancellation.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            return;
        }

        setCancelling(true);
        try {
            const response = await axiosClient.put(`/api/admin/order/cancel/${selectedOrderId}`, {
                reason: cancellationReason.trim()
            });
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            // Close dialog and refresh orders list
            closeCancelDialog();
            await fetchOrders(); // Refresh the list to reflect cancelled status
        } catch (error) {
            setSnackBarMessage(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to cancel order"
            );
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
            setCancelling(false);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Pending":
                return <Clock className="mr-2" size={18} />;
            case "In Progress":
                return <AlertCircle className="mr-2" size={18} />;
            case "Completed":
                return <CheckCircle className="mr-2" size={18} />;
            case "Canceled":
                return <XCircle className="mr-2" size={18} />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "In Progress":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "Completed":
                return "bg-green-100 text-green-800 border-green-300";
            case "Canceled":
                return "bg-red-100 text-red-800 border-red-300";
            default:
                return "bg-gray-100 text-gray-800";
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
            <NavBar />
            <motion.div
                className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">All Bookings</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'All Bookings' },
                        ]}
                    />
                </div>
            </motion.div>
            <div className="w-full p-4 bg-gray-50 my-4">
                <div className="grid gap-4 md:grid-cols-2">
                    {loading ? (
                        <div className='flex items-center justify-center my-10'><CircularLoading /></div>
                    ) : allOrder.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10 text-lg font-medium">
                            No Order Found
                        </div>
                    ) : (
                        allOrder.map((bike) => (
                            <div
                                key={bike._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-indigo-500"
                            >
                                <div className="p-5">
                                    {/* Header with brand, model and CC */}
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {bike.selectedBrand} {bike.selectedModel} <span className="text-gray-600">{bike.cc}cc</span>
                                        </h3>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(bike.status)}`}>
                                            {getStatusIcon(bike.status)}
                                            {bike.status}
                                        </div>
                                    </div>

                                    {/* Issue */}
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-600">Issue:</p>
                                        <p className="text-gray-800">{bike.issues}</p>
                                    </div>

                                    {/* Date */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500">Received: {bike.createdAt}</p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex justify-between gap-2 mt-2">
                                        <Link to={`/user-booking/${bike._id}`}
                                            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium w-1/2"
                                        >
                                            <FileText size={16} className="mr-1" />
                                            View Details
                                        </Link>
                                        {bike.status === "Pending" ? (
                                            <button
                                                onClick={() => openCancelDialog(bike._id)}
                                                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium w-1/2"
                                            >
                                                <XCircle size={16} className="mr-1" />
                                                Cancel Service
                                            </button>
                                        ) : (
                                            <Link to={`${bike.status === "Invoice Generated" ? `/order/invoice/${bike._id}` : "#"}`}
                                                className={`flex items-center justify-center ${bike.status === "Invoice Generated" ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"} text-white px-4 py-2 rounded-md text-sm font-medium w-1/2`}
                                                disabled={bike.status !== "Completed"}
                                            >
                                                <CreditCard size={16} className="mr-1" />
                                                Get Invoice
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Cancel Reason Dialog */}
            <Dialog open={cancelDialogOpen} onClose={closeCancelDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Cancel Service</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Cancellation"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Please provide a reason why you're cancelling this service..."
                        required
                        error={cancellationReason.trim() === '' && cancelling === false} // Show error if empty when trying to submit? We'll handle via snackbar instead.
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCancelDialog} disabled={cancelling}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmCancel}
                        variant="contained"
                        color="error"
                        disabled={cancelling}
                        startIcon={cancelling ? <CircularProgress size={20} /> : null}
                    >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Footer />
        </>
    );
}