import React, { useEffect, useState } from 'react'
import Heading from './ui/Heading'
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import DialogActions from '@mui/material/DialogActions';
import { UserPen, Plus } from 'lucide-react';
import AssignMechanic from './ui/AssignMechanic';

export default function JobAsssignForm({ id }) {
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [vendors, setVendors] = useState([])
    const [employee, setEmployee] = useState([])
    const [orderId, setOrderById] = useState({})
    const [modalloading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log(id, "job assign id")
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setModalLoading(true)
                const [vendorsData, employeesData, orderDetail] = await Promise.all([
                    axiosClient.get('/api/vendor/getallvendor'),
                    axiosClient.get('/api/admin/employee/getallemployee'),
                    axiosClient.get(`/api/admin/order/getorderbyid/${id}`),
                ]);
                console.log(orderDetail);
                setOrderById(orderDetail.data);
                setVendors(vendorsData.data.vendors);
                setEmployee(employeesData.data.employees);
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
    const updateMechanicInOrder = async (data) => {
        // Optional: update in MongoDB via API
        await axiosClient.put(`/api/orders/${orderId._id}`, data);

        // Update local state
        // setOrder(prev => ({
        //     ...prev,
        //     ...data
        // }));
    };


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
                                        <AssignMechanic
                                            employees={employee}
                                            orderData={orderId}
                                            onUpdateMechanic={updateMechanicInOrder}
                                        />


                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className='border border-gray-300 rounded p-4 my-4'>
                                <legend className="text-md font-semibold">Vendor & Parts Required</legend>
                                <div className='flex flex-row flex-wrap items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <div>
                                            <span className='font-semibold'>Parts:- </span><span>Tejasvi Kumar</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <select className='p-1 border border-gray-400'>
                                            <option selected>Assign Vendor</option>
                                            <option>Option 1</option>
                                            <option>Option 2 </option>
                                            <option>Assign Mechanic</option>
                                        </select>
                                        <select className='p-1 border border-gray-400'>
                                            <option selected>Assign Delivery Boy</option>
                                            <option>Option 1</option>
                                            <option>Option 2 </option>
                                            <option>Assign Mechanic</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className='border border-gray-300 rounded p-4 my-4'>
                                <legend className="text-md font-semibold">Other</legend>
                                <div className='flex flex-row flex-wrap items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <div>
                                            <span className='font-semibold'>Prefered Date:- </span><span>Tejasvi Kumar</span>
                                        </div>
                                        <div>
                                            <span className='font-semibold'>Prefered Time:- </span><span>Tejasvi Kumar</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <div>
                                            <span className='font-semibold'>Estimated Budget:- </span><span>Tejasvi Kumar</span>
                                        </div>
                                        <select className='p-1 border border-gray-400'>
                                            <option selected>Change Status</option>
                                            <option>Option 1</option>
                                            <option>Option 2 </option>
                                            <option>Assign Mechanic</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <span className='font-semibold'>
                                        Issue :-

                                    </span>
                                    <span>
                                        This is issue
                                    </span>
                                </div>
                            </fieldset>
                            <fieldset className='border border-gray-300 rounded p-4 my-4'>
                                <legend className="text-md font-semibold">Action</legend>
                                <div className='flex flex-row flex-wrap items-start justify-between gap-4'>
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                            <label>Mechanic</label>
                                            <select className='p-1 border border-gray-400'>
                                                <option selected>Choose Mechanic</option>
                                                {employee
                                                    .filter(emp => emp.position === 'mechanic')
                                                    .map(emp => (
                                                        <option key={emp._id}>
                                                            {emp.firstName} {emp.lastName}
                                                        </option>
                                                    ))}
                                            </select>

                                        </div>
                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                            <label>Vendor</label>

                                            <select className='p-1 border border-gray-400'>
                                                <option selected>Choose Vendor</option>
                                                {
                                                    vendors.map((v, i) =>
                                                        <option key={i}>
                                                            {v.firstName + " " + v.lastName}
                                                        </option>
                                                    )
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                            <label>hello</label>
                                            <select className='p-1 border border-gray-400'>
                                                <option selected>Change Status</option>
                                                <option>Option 1</option>
                                                <option>Option 2 </option>
                                                <option>Assign Mechanic</option>
                                            </select>
                                        </div>
                                        <div className='flex flex-row gap-2 items-center justify-center'>
                                            <label>hello</label>
                                            <select className='p-1 border border-gray-400'>
                                                <option selected>Change Status</option>
                                                <option>Option 1</option>
                                                <option>Option 2 </option>
                                                <option>Assign Mechanic</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                            </fieldset>
                        </div>
                    </div>
                    <DialogActions>
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
                    </DialogActions>
                </div >
            }

        </>
    )
}
