import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, FileText, CreditCard, XOctagon, User } from 'lucide-react';
import Footer from '../../components/landing/Footer';
import NavBar from '../../components/ui/NavBar';
import { motion } from "framer-motion";
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import axiosClient from '../../service/axiosClient';
import { useSelector } from 'react-redux';
import CircularLoading from '../../components/ui/CircularLoading';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import { Link } from 'react-router-dom';


export default function UserAllBooking() {
    // Sample data
    const user = useSelector((state) => state.user.user);
    const [allOrder, setAllOrder] = useState([])
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity



    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true)
                const response = await axiosClient.get(`/api/admin/order/by-email?email=${user.email}`)
                console.log(response.data.orders)
                setAllOrder(response.data.orders)
                setLoading(false)
            } catch (error) {
                console.log(error);
                setLoading(false)
            }
        }
        fetchOrder();
    }, [])

    const handleOrderCancel = async (id) => {
        try {
            const response = await axiosClient.put(`/api/admin/order/cancel/${id}`);
            console.log(response, "Cancel Order");
            setSnackBarMessage(response.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true); // Open the Snackbar
        } catch (error) {
            setSnackBarMessage(error.message); // Set the message to display in the Snackbar
            setSnackBarSeverity("error"); // Set the message to display in the Snackbar
            setSnackBarOpen(true);
            console.log(error);
        }
    }

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
    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarOpen(false);
    }
    // Mock functions
    const viewDetails = (id) => {
        alert(`Viewing details for service ID: ${id}`);
    };

    const getInvoice = (id) => {
        alert(`Generating invoice for service ID: ${id}`);
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
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
                                                onClick={() => handleOrderCancel(bike._id)}
                                                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium w-1/2"
                                            >
                                                <XCircle size={16} className="mr-1" />
                                                Cancel Service
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => getInvoice(bike.id)}
                                                className={`flex items-center justify-center ${bike.status === "Completed" ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"} text-white px-4 py-2 rounded-md text-sm font-medium w-1/2`}
                                                disabled={bike.status !== "Completed"}
                                            >
                                                <CreditCard size={16} className="mr-1" />
                                                Get Invoice
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div >
            <Footer />
        </>
    );
}