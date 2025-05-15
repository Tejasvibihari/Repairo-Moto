import { UserPen, Plus } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import axiosClient from '../service/axiosClient'
import Slide from '@mui/material/Slide';
import React, { useEffect, useState } from 'react';

import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import JobAsssignForm from './JobAsssignForm';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
export default function OrderTable({ orders }) {
    const [open, setOpen] = React.useState(false);
    const [orderId, setOrderId] = useState(null);


    const handleClickOpen = (id) => {
        setOrderId(id);         // Set the ID for JobAssignForm
        setOpen(true);          // Open the Dialog

    };


    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {

    })


    const handleMechanicChange = (orderId, mechanicId) => {
        // You can update your backend here, or local state
        console.log(`Assigning mechanic ${mechanicId} to order ${orderId}`);
        // e.g., updateOrder(orderId, { assignedMechanic: mechanicId });
    };

    return (
        <>
            <div className="p-4 border border-gray-200 rounded shadow-sm">
                <div className="overflow-x-auto overflow-y-auto">
                    <table className="min-w-full w-full divide-y overflow-x-auto overflow-y-auto divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">No.</th>
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
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr key={order._id} className="hover:bg-gray-50 border-b border-gray-200">
                                    <td className="px-3 py-2">{index + 1}</td>
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
            </Dialog >
        </>
    );
}