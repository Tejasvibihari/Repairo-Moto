import { UserPen, Plus } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import axiosClient from '../service/axiosClient';
import Slide from '@mui/material/Slide';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import JobAsssignForm from './JobAsssignForm';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function OrderTable({ orders: initialOrders }) {
    const [open, setOpen] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [orders, setOrders] = useState(initialOrders);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleClickOpen = (id) => {
        setOrderId(id);         // Set the ID for JobAssignForm
        setOpen(true);          // Open the Dialog
    };

    const handleClose = () => {
        setOpen(false);
        // Trigger a refresh when dialog closes
        setRefreshTrigger(prev => prev + 1);
    };

    // Function to fetch updated orders from your API
    const fetchUpdatedOrders = async () => {
        try {
            const response = await axiosClient.get('/orders'); // Replace with your actual API endpoint
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching updated orders:', error);
        }
    };

    // Update orders when parent component sends new props
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    // Refresh orders when dialog closes or refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchUpdatedOrders();
        }
    }, [refreshTrigger]);
    const exportToExcel = () => {
        const excelData = orders.map((order, index) => ({
            "S.No": index + 1,
            "Order ID": order.orderId,
            "Name": order.name,
            "Email": order.email || "-",
            "Contact No": order.contactNo,
            "City": order.city,
            "Selected Brand": order.selectedBrand,
            "Selected Model": order.selectedModel,
            "Model Name": order.modelName || "-",
            "CC": order.cc,
            "BS": order.bs || "-",
            "Latitude": order.location?.latitude || "-",
            "Longitude": order.location?.longitude || "-",
            "Services": order.services?.join(", ") || "-",
            "Other Service": order.otherService || "-",
            "Preferred Date": order.preferredDate ? new Date(order.preferredDate).toLocaleDateString() : "-",
            "Preferred Time": order.preferredTime || "-",
            "Estimated Budget": order.estimatedBudget,
            "Issues": order.issues || "-",
            "Status": order.status,
            "Assigned Mechanic": order.assignedMechanic || "-",
            "Assigned Vendor": order.assignedVendor || "-",
            "Assigned Delivery": order.assignedDelivery || "-",
            "Invoice Date": order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : "-",
            "Sub Total": order.total?.subTotal || "-",
            "Discount": order.total?.discount || "-",
            "Discount Type": order.total?.discountType || "-",
            "Total": order.total?.total || "-",
            "Created At": order.createdAt ? new Date(order.createdAt).toLocaleString() : "-",
            "Updated At": order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "-"
        }));


        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Order");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(file, 'Orders.xlsx');
    };
    return (
        <>
            <div className="p-4 border border-gray-200 rounded shadow-sm">
                <div className="overflow-x-auto overflow-y-auto">
                    <div className='flex items-end justify-end my-4'>
                        <button
                            onClick={exportToExcel}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-yellow-600 cursor-pointer transition"
                        >
                            Export To Excel
                        </button>
                    </div>
                    <table className="min-w-full w-full divide-y overflow-x-auto overflow-y-auto divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">No.</th>
                                <th className="px-4 py-2 text-left">Order Id</th>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                                <th className="px-4 py-2 text-left">Brand</th>
                                <th className="px-4 py-2 text-left">Model</th>
                                <th className="px-4 py-2 text-left">Services</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Time</th>
                                <th className="px-4 py-2 text-left">Budget</th>
                                <th className="px-4 py-2 text-left">Mechanic</th>
                                <th className="px-4 py-2 text-left">Parts Used</th>
                                <th className="px-4 py-2 text-left">Coupon</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr key={order._id} className="hover:bg-gray-50 border-b border-gray-200">
                                    <td className="px-3 py-2">{index + 1}</td>
                                    <td className="px-3 py-2">{order.orderId}</td>
                                    <td className="px-3 py-2">{order.name}</td>
                                    <td className="px-3 py-2">{order.contactNo}</td>
                                    <td className="px-3 py-2">{order.selectedBrand}</td>
                                    <td className="px-3 py-2">{order.selectedModel}</td>
                                    <td className="px-3 py-2">{order.services.join(", ")}</td>
                                    <td className="px-3 py-2">
                                        {new Date(order.preferredDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-3 py-2">
                                        {new Date(order.preferredTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-3 py-2">{order.estimatedBudget}</td>
                                    <td className="px-3 py-2">{order.assignedMechanic || "Unassigned"}</td>

                                    <td className="px-3 py-2">
                                        {order.partsUsed.length > 0 ? order.partsUsed.map(part => part.partName).join(", ") : "N/A"}
                                    </td>
                                    <td className="px-3 py-2">{order.coupon || "Unassigned"}</td>
                                    <td className="px-3 py-2" style={{ minWidth: "120px" }}>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${order.status === "Pending"
                                                ? "bg-yellow-50 text-yellow-700"
                                                : order.status === "In Progress"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : order.status === "Mechanic Assigned"
                                                        ? "bg-indigo-50 text-indigo-700"
                                                        : order.status === "Completed"
                                                            ? "bg-green-50 text-green-700"
                                                            : order.status === "Cancelled"
                                                                ? "bg-red-50 text-red-700"
                                                                : order.status === "Invoice Generated"
                                                                    ? "bg-purple-50 text-purple-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {order.status}
                                        </span>

                                    </td>
                                    <td className="px-3 py-2 flex gap-2 flex-wrap justify-end ">
                                        <button onClick={() => handleClickOpen(order._id)} className="flex items-center justify-center bg-primary text-white py-2 rounded-md px-3 cursor-pointer hover:bg-transparent hover:text-primary border border-primary">
                                            <UserPen size={18} className="mr-0 md:mr-2" />
                                            <span className="hidden md:inline">Manage</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                className='p-4'
            >
                <JobAsssignForm id={orderId} />
            </Dialog>
        </>
    );
}