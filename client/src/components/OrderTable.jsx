import { UserPen, Plus } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Slide from '@mui/material/Slide';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import JobAsssignForm from './JobAsssignForm';

// Mirrors the status enum on the order schema, including the OTP-driven
// steps the mobile app added (Mechanic Arrived / Completion Requested /
// Work Completed). Anything unknown falls back to grey.
const STATUS_CLASSES = {
    "Pending": "bg-yellow-50 text-yellow-700",
    "Mechanic Assigned": "bg-indigo-50 text-indigo-700",
    "Mechanic Arrived": "bg-purple-50 text-purple-700",
    "In Progress": "bg-blue-50 text-blue-700",
    "Completion Requested": "bg-cyan-50 text-cyan-700",
    "Work Completed": "bg-emerald-50 text-emerald-700",
    "Invoice Generated": "bg-orange-50 text-orange-700",
    "Completed": "bg-green-50 text-green-700",
    "Cancelled": "bg-red-50 text-red-700",
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function OrderTable({ orders: initialOrders, onRefresh }) {
    const [open, setOpen] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [orders, setOrders] = useState(initialOrders);

    const handleClickOpen = (id) => {
        setOrderId(id);
        setOpen(true);
    };

    // Closing the manage dialog asks the parent to refetch with its current
    // filters and page. The old code hit a bare `/orders` endpoint that the
    // server never exposed, so the table silently went stale after every edit.
    const handleClose = () => {
        setOpen(false);
        if (typeof onRefresh === 'function') onRefresh();
    };

    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    const exportToExcel = () => {
        const excelData = orders.map((order, index) => ({
            "S.No": index + 1,
            "Order ID": order.orderId,
            "Name & Phone": `${order.name} (${order.contactNo})`,
            "Email": order.email || "-",
            "City": order.city,
            "Brand & Model": `${order.selectedBrand} - ${order.selectedModel}`,
            "Model Name": order.modelName || "-",
            "CC": order.cc,
            "BS": order.bs || "-",
            "Latitude": order.userLocation?.coordinates?.[1] || "-",
            "Longitude": order.userLocation?.coordinates?.[0] || "-",
            "Services": order.services?.join(", ") || "-",
            "Service Type": order.serviceType || "-",
            "Other Service": order.otherService || "-",
            "Preferred Date": order.preferredDate ? new Date(order.preferredDate).toLocaleDateString() : "-",
            "Preferred Time": order.preferredTime || "-",
            "Issues": order.issues || "-",
            "Status": order.status,
            "Assigned Mechanic": order.assignedMechanics?.join(", ") || "-",
            "Assigned Vendor": order.assignedVendor || "-",
            "Assigned Delivery": order.assignedDelivery || "-",
            "Parts Used": order.partsUsed?.map(p => p.partName).join(", ") || "-",
            "Payment Status": order.paymentStatus || "-",
            "Invoice Date": order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : "-",
            "Sub Total": order.total?.subTotal || "-",
            "Discount": order.total?.discount || "-",
            "Discount Type": order.total?.discountType || "-",
            "Total": order.total?.total || "-",
            "Final Payable": order.total?.finalPayable || "-",
            "Amount Paid": order.amountPaid ?? "-",
            "Balance Due": order.balanceDue ?? "-",
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
                                <th className="px-4 py-2 text-left">Name & Phone</th>
                                <th className="px-4 py-2 text-left">Brand & Model</th>
                                <th className="px-4 py-2 text-left">Services</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Time</th>
                                <th className="px-4 py-2 text-left">Mechanic</th>
                                <th className="px-4 py-2 text-left">Parts Used</th>
                                <th className="px-4 py-2 text-left">Payment Status</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr key={order._id} className="hover:bg-gray-50 border-b border-gray-200">
                                    <td className="px-3 py-2">{index + 1}</td>
                                    <td className="px-3 py-2">{order.orderId}</td>
                                    <td className="px-3 py-2">
                                        <div className="font-medium">{order.name}</div>
                                        <div className="text-xs text-gray-500">{order.contactNo}</div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>{order.selectedBrand}</div>
                                        <div className="text-xs text-gray-500">{order.selectedModel}</div>
                                    </td>
                                    <td className="px-3 py-2">{order.services?.join(", ") || "-"}</td>
                                    <td className="px-3 py-2">
                                        {order.preferredDate ? new Date(order.preferredDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        }) : "-"}
                                    </td>
                                    <td className="px-3 py-2">{order.preferredTime || "-"}</td>
                                    <td className="px-3 py-2">
                                        {order.assignedMechanics?.length
                                            ? order.assignedMechanics.join(", ")
                                            : "Unassigned"}
                                    </td>
                                    <td className="px-3 py-2">
                                        {order.partsUsed?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {order.partsUsed.map((part, idx) => (
                                                    <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                                        {part.partName}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : "N/A"}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === "paid"
                                            ? "bg-green-50 text-green-700"
                                            : order.paymentStatus === "partial"
                                                ? "bg-amber-50 text-amber-700"
                                                : order.paymentStatus === "unpaid"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {order.paymentStatus || "unpaid"}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2" style={{ minWidth: "120px" }}>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${STATUS_CLASSES[order.status] || "bg-gray-100 text-gray-700"}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 flex gap-2 flex-wrap justify-end">
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
                maxWidth="lg"
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                className='p-4'
            >
                <JobAsssignForm id={orderId} />
            </Dialog>
        </>
    );
}