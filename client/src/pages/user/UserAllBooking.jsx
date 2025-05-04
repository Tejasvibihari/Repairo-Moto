import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, FileText, CreditCard, XOctagon } from 'lucide-react';
import Footer from '../../components/landing/Footer';
import NavBar from '../../components/ui/NavBar';
import { motion } from "framer-motion";
import Breadcrumbs from '../../components/ui/Breadcrumbs';
export default function UserAllBooking() {
    // Sample data
    const [bikes, setBikes] = useState([
        {
            id: 1,
            brand: "Kawasaki",
            model: "Ninja",
            cc: "650",
            issue: "Engine overheating and chain adjustment needed",
            status: "Pending",
            dateReceived: "2025-05-01"
        },
        {
            id: 2,
            brand: "Honda",
            model: "CBR",
            cc: "1000",
            issue: "Regular maintenance and oil change",
            status: "In Progress",
            dateReceived: "2025-04-28"
        },
        {
            id: 3,
            brand: "Ducati",
            model: "Monster",
            cc: "821",
            issue: "Brake pad replacement and throttle calibration",
            status: "Completed",
            dateReceived: "2025-04-25"
        },
        {
            id: 4,
            brand: "Yamaha",
            model: "R1",
            cc: "1000",
            issue: "Electrical system diagnostic",
            status: "Canceled",
            dateReceived: "2025-04-22"
        }
    ]);

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

    // Mock functions
    const viewDetails = (id) => {
        alert(`Viewing details for service ID: ${id}`);
    };

    const getInvoice = (id) => {
        alert(`Generating invoice for service ID: ${id}`);
    };

    return (
        <>
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
                    <Breadcrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'All Bookings' },
                        ]}
                    />
                </div>
            </motion.div>
            <div className="w-full p-4 bg-gray-50 my-4">

                <div className="grid gap-4 md:grid-cols-2">
                    {bikes.map((bike) => (
                        <div
                            key={bike.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-indigo-500"
                        >
                            <div className="p-5">
                                {/* Header with brand, model and CC */}
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {bike.brand} {bike.model} <span className="text-gray-600">{bike.cc}cc</span>
                                    </h3>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(bike.status)}`}>
                                        {getStatusIcon(bike.status)}
                                        {bike.status}
                                    </div>
                                </div>

                                {/* Issue */}
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-600">Issue:</p>
                                    <p className="text-gray-800">{bike.issue}</p>
                                </div>

                                {/* Date */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500">Received: {bike.dateReceived}</p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-between gap-2 mt-2">
                                    <button
                                        onClick={() => viewDetails(bike.id)}
                                        className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium w-1/2"
                                    >
                                        <FileText size={16} className="mr-1" />
                                        View Details
                                    </button>
                                    {bike.status === "Pending" ? (
                                        <button
                                            onClick={() => alert(`Canceling service for ID: ${bike.id}`)}
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
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}