import React, { useEffect, useState } from 'react'
import Heading from './ui/Heading'
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import DialogActions from '@mui/material/DialogActions';
import { UserPen, Plus } from 'lucide-react';
import AssignMechanic from './ui/AssignMechanic';
import { formatDate, formatTime } from '../utils/DateFormate';
import SelectMechanicDialog from './ui/SelectMechanicDialog';
import SelectDeliveryDialog from './ui/SelectDeliveryDialog';
import SelectVendorDialog from './ui/SelectVendorDialog';


export default function JobAsssignForm({ id }) {
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [vendors, setVendors] = useState([])
    const [mechanic, setMechanic] = useState([])
    const [delivery, setDelivery] = useState([])
    const [orderId, setOrderById] = useState({})
    const [modalloading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(false);



    const [selectedMechanic, setSelectedMechanic] = useState(""); // State to store the selected mechanic ID
    const [mechanicDialogOpen, setMechanicDialogOpen] = useState(false);
    const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
    const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

    const handleMechanicDialogOpen = () => {
        setMechanicDialogOpen(true);
    };
    const handleMechanicDialogClose = () => {
        setMechanicDialogOpen(false);

    };
    const handleDeliveryDialogOpen = () => {
        setDeliveryDialogOpen(true);
    };
    const handleDeliveryDialogClose = () => {
        setDeliveryDialogOpen(false);

    };
    const handleVendorDialogOpen = () => {
        setVendorDialogOpen(true);
    };
    const handleVendorDialogClose = () => {
        setVendorDialogOpen(false);

    };
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setModalLoading(true)
                const [vendorsData, employeesData, deliveryData, orderDetail] = await Promise.all([
                    axiosClient.get('/api/vendor/getallvendor'),
                    axiosClient.get('/api/admin/employee/getallemployee?position=mechanic'),
                    axiosClient.get('/api/admin/employee/getallemployee?position=delivery'),
                    axiosClient.get(`/api/admin/order/getorderbyid/${id}`),
                ]);
                setOrderById(orderDetail.data);
                setVendors(vendorsData.data.vendors);
                setMechanic(employeesData.data.employees);
                setDelivery(deliveryData.data.employees)
                setModalLoading(false);
            } catch (error) {
                const msg = error.response?.data?.message || 'Something went wrong.';
                setSnackBarMessage(msg);
                setSnackBarSeverity("error");
                setSnackBarOpen(true);
                setModalLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarOpen(false);
    }
    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
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
                bookingId={orderId._id} />
            <SelectVendorDialog
                open={vendorDialogOpen}
                onClose={handleVendorDialogClose}
                data={vendors}
                bookingId={orderId._id} />
            {modalloading ?
                <div className='flex items-center justify-center p-10'>
                    <CircularLoading />
                </div>
                :
                <div>

                    <div className='p-4'>
                        <Heading heading={"Handle Order"} />
                        <div>
                            <fieldset className='border border-gray-300 rounded p-4 my-4'>
                                <legend className="text-md font-semibold">User Details</legend>
                                <div className='flex flex-row flex-wrap items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <div>
                                            <span className='font-semibold'>Name:- </span><span>{orderId.name}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold'>Phone:- </span><span>{orderId.contactNo}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold'>Email:-</span><span>{orderId.email}</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <span className='font-semibold'>
                                            City:-
                                            <span>{orderId.city}</span>
                                        </span>

                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className='border border-gray-300 rounded p-4 my-4'>
                                <legend className="text-md font-semibold">Bike and Service Detail</legend>
                                <div className='flex flex-row flex-wrap items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <div>
                                            <span className='font-semibold'>Brand:- </span><span>{orderId.selectedBrand}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold'>Model:- </span><span>{orderId.selectedModel === "other" ? orderId.modelName : orderId.selectedModel}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold'>Services:-</span>
                                            <span>{orderId?.services?.join(", ") || "N/A"}</span>
                                        </div>
                                        <div>
                                            {orderId.otherService &&
                                                <>
                                                    <span className='font-semibold'>Other Service:- </span>
                                                    <span>{orderId.otherService && orderId.otherService}</span>
                                                </>
                                            }
                                        </div>


                                    </div>
                                    <div className='flex flex-col gap-1 justify-between'>
                                        <div>
                                            <span className='font-semibold'>CC:- </span><span>{orderId.cc}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold'>Assigned Mechanic:- </span><span>{orderId.assignedMechanic ? orderId.assignedMechanic : "N/A"}</span>
                                        </div>
                                        <button onClick={() => handleMechanicDialogOpen()} className='my-2 p-1 bg-primary rounded text-white cursor-pointer border border-primary hover:bg-transparent hover:text-black'>
                                            Select Mechanic
                                        </button>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className='border border-gray-300 rounded p-4 my-4'>
                                <legend className="text-md font-semibold">Vendor & Parts Required</legend>
                                <div className='flex flex-row flex-wrap items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <div>
                                            <span className='font-semibold'>Parts:- </span>
                                            <span>

                                                {orderId?.partsUsed?.join(", ") || "N/A"}
                                            </span>

                                        </div>
                                        <div>
                                            <span className='font-semibold'>Assigned Vendor:- </span><span>{orderId.assignedVendor ? orderId.assignedVendor : "N/A"}</span>
                                        </div>
                                        <button onClick={() => handleVendorDialogOpen()} className='my-2 p-1 bg-primary rounded text-white cursor-pointer border border-primary hover:bg-transparent hover:text-black'>
                                            Select Vendor
                                        </button>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <div>
                                            <span className='font-semibold'>Assigned Delivery Boy:- </span><span>{orderId.assignedDelivery ? orderId.assignedDelivery : "N/A"}</span>
                                        </div>
                                        <button onClick={() => handleDeliveryDialogOpen()} className='my-2 p-1 bg-primary rounded text-white cursor-pointer border border-primary hover:bg-transparent hover:text-black'>
                                            Select Delivery Boy
                                        </button>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className='border border-gray-300 rounded p-4 my-4'>
                                <legend className="text-md font-semibold">Other</legend>
                                <div className='flex flex-row flex-wrap items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <div>

                                            <span className='font-semibold'>Prefered Date:- </span>
                                            <span>{formatDate(orderId.preferredDate)}</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold'>Prefered Time:- </span><span>{formatTime(orderId.preferredTime)}</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <div>
                                            <span className='font-semibold'>Estimated Budget:- </span><span>{orderId.estimatedBudget}</span>
                                        </div>
                                        <select
                                            className={`p-1 border ${orderId.status === "Pending"
                                                ? "border-yellow-500 text-yellow-500"
                                                : orderId.status === "In Progress"
                                                    ? "border-orange-500 text-orange-500"
                                                    : orderId.status === "Completed"
                                                        ? "border-green-500 text-green-500"
                                                        : "border-red-500 text-red-500"
                                                }`}
                                            value={orderId.status || "Pending"} // Set the current status as the selected value
                                            onChange={(e) => {
                                                const updatedStatus = e.target.value;
                                                setOrderById((prev) => ({
                                                    ...prev,
                                                    status: updatedStatus, // Update the status in the local state
                                                }));
                                            }}
                                        >
                                            <option value="Pending" className='text-yellow-500'>Pending</option>
                                            <option value="In Progress" className='text-orange-500'>In Progress</option>
                                            <option value="Completed" className='text-green-500'>Completed</option>
                                            <option value="Cancelled" className='text-red-500'>Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <span className='font-semibold'>
                                        Issue :-
                                    </span>
                                    <span>
                                        {orderId.issues}
                                    </span>
                                </div>
                                <div className='flex items-center justify-end'>
                                    <button
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                if (!orderId.status) {
                                                    setSnackBarMessage("Please select a valid status before updating."); // Set the message to display in the Snackbar
                                                    setSnackBarSeverity('warning'); // Set severity to warning
                                                    setSnackBarOpen(true);
                                                    setLoading(false);
                                                    return;
                                                }

                                                const response = await axiosClient.put(`/api/admin/order/updateStatus/${orderId._id}`, {
                                                    status: orderId.status, // Send the updated status to the server
                                                });

                                                if (response.status === 200) {
                                                    setSnackBarMessage("Order status updated successfully!"); // Set the message to display in the Snackbar
                                                    setSnackBarSeverity('success'); // Set severity to success
                                                    setSnackBarOpen(true);
                                                    setLoading(false);
                                                } else {
                                                    setSnackBarMessage("Failed to update order status. Please try again."); // Set the message to display in the Snackbar
                                                    setSnackBarSeverity('error'); // Set severity to error
                                                    setSnackBarOpen(true);
                                                    setLoading(false);
                                                }
                                            } catch (error) {
                                                console.error("Error updating order status:", error);
                                                setSnackBarMessage(error.message || "An error occurred while updating the order status."); // Set the message to display in the Snackbar
                                                setSnackBarSeverity('error'); // Set severity to error
                                                setSnackBarOpen(true);
                                                setLoading(false);
                                            }
                                        }}
                                        className='my-2 p-1 px-2 bg-primary rounded text-white cursor-pointer border border-primary hover:bg-transparent hover:text-black'
                                    >
                                        {loading ? <CircularLoading size={25} /> : "Update Status"}
                                    </button>
                                </div>
                            </fieldset>

                        </div>
                    </div>
                    {/* <DialogActions>
                        <button
                            // onClick={handleClose}
                            type="submit"
                            className="bg-primary mt-4  font-semibold hover:bg-transparent hover:text-primary  border-primary border text-white px-4 py-2 rounded cursor-pointer hover:bg-primary-dark"
                        >
                            <span className='flex flex-row items-center justify-center'><Plus className='mr-2' /> Create Order</span>
                        </button>
                        <button
                            type="submit"
                            className="bg-primary mt-4  font-semibold hover:bg-transparent hover:text-primary  border-primary border text-white px-4 py-2 rounded cursor-pointer hover:bg-primary-dark"
                        >
                            {loading ? (
                                <div className='flex items-center justify-center'>
                                    <CircularLoading size={20} />
                                </div>
                            ) : (
                                <span className='flex flex-row items-center justify-center'><Plus className='mr-2' /> Update Order</span>
                            )}
                        </button>
                    </DialogActions> */}
                </div >
            }

        </>
    )
}
