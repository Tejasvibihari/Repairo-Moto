import { Check, Trash, UserCog, X } from 'lucide-react'
import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Heading from "./ui/Heading"
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import { useDispatch } from 'react-redux';
import { setVendor } from '../app/slice/vendorSlice';
import Slide from '@mui/material/Slide';
import EditVendorForm from './EditVendorForm';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function VendorProfileCard({ vendor }) {
    const dispatch = useDispatch();
    const [openDelete, setOpenDelete] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    const handleDeleteOpen = () => {
        setOpenDelete(true);
    };

    const handleDeleteClose = () => {
        setOpenDelete(false);
    };

    const handleEditOpen = () => {
        setOpenEdit(true);
    };

    const handleEditClose = () => {
        setOpenEdit(false);
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    }

    const handleDelete = (id) => async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosClient.delete(`/api/vendor/deletevendor/${id}`);
            console.log(response)
            dispatch(setVendor(response.data.vendors));
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity("success")
            setSnackBarOpen(true)
            setLoading(false);
        } catch (error) {
            console.error(error);
            setSnackBarMessage(error.message);
            setSnackBarSeverity("success")
            setSnackBarOpen(true)
            setLoading(false);
            handleDeleteClose()
        }
    }

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />

            {/* Redesigned Vendor Card */}
            <div className='bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-primary my-4'>
                <div className='p-6'>
                    {/* Header Section with Business Info */}
                    <div className='flex flex-col md:flex-row items-center md:items-start gap-6 mb-6'>
                        <div className='relative'>
                            <img
                                src={`${import.meta.env.VITE_API_URL}${vendor.profileImage}`}
                                className='w-48 h-48 object-cover rounded-lg shadow-md border-2 border-primary'
                                alt={vendor.businessName}
                            />
                            <div className='absolute top-2 right-2 bg-primary/80 text-white px-2 py-1 rounded-md text-xs font-medium'>
                                Vendor
                            </div>
                        </div>

                        <div className='flex-1'>
                            <h2 className='text-2xl font-bold text-primary mb-2'>{vendor.businessName}</h2>
                            <div className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4'>
                                GST: {vendor.gstNo}
                            </div>

                            <h3 className='text-lg font-semibold text-gray-700 mb-1'>
                                {vendor.firstName} {vendor.lastName}
                            </h3>
                            <div className='text-sm text-gray-600 mb-1'>{vendor.phone}</div>
                            <div className='text-sm text-gray-600 mb-1'>{vendor.email}</div>
                            <div className='text-sm font-medium text-primary mt-2'>
                                Referral Code: {vendor.referralCode}
                            </div>
                        </div>
                    </div>

                    {/* Address Information Section */}
                    <div className='bg-gray-50 rounded-lg p-4 border border-gray-100 mb-5'>
                        <h4 className='text-primary font-semibold mb-3 flex items-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Address Information
                        </h4>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div>
                                <span className='text-gray-600 text-sm'>Address:</span>
                                <p className='font-medium'>{vendor.address}</p>
                            </div>
                            <div>
                                <span className='text-gray-600 text-sm'>City:</span>
                                <p className='font-medium'>{vendor.city}</p>
                            </div>
                            <div>
                                <span className='text-gray-600 text-sm'>State:</span>
                                <p className='font-medium'>{vendor.state}</p>
                            </div>
                            <div>
                                <span className='text-gray-600 text-sm'>Pincode:</span>
                                <p className='font-medium'>{vendor.pincode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-3'>
                        <button
                            onClick={handleEditOpen}
                            className='flex-1 flex items-center justify-center bg-primary text-white py-3 rounded-md text-sm font-medium transition-all duration-300 hover:bg-transparent hover:text-primary border border-primary'
                        >
                            <UserCog className='mr-2' size={18} />Edit Vendor
                        </button>
                        <button
                            onClick={handleDeleteOpen}
                            className='flex-1 flex items-center justify-center bg-transparent text-red-600 py-3 rounded-md text-sm font-medium transition-all duration-300 hover:bg-red-600 hover:text-white border border-red-600'
                        >
                            <Trash className='mr-2' size={18} />Delete Vendor
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Dialog - No changes to functionality */}
            <Dialog
                open={openDelete}
                onClose={handleDeleteClose}
                TransitionComponent={Transition}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className='p-4'>
                    <Heading heading={"Delete"} />
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are You Sure You Want TO Delete This Vendor
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <button
                            onClick={handleDeleteClose}
                            className='flex flex-row itemms-center justify-center px-4 py-2 bg-primary rounded text-white hover:bg-transparent hover:text-primary border border-primary cursor-pointer'>
                            <span className='flex flex-row'><X className='mr-2' />No</span>
                        </button>
                        <button
                            onClick={handleDelete(vendor._id)}
                            type="submit"
                            className='flex flex-row itemms-center justify-center px-4 py-2 bg-red-600 rounded text-white hover:bg-transparent hover:text-red-600 border border-red-600 cursor-pointer'
                        >
                            {loading ? <CircularLoading size={25} /> : <span className='flex flex-row'><Check className='mr-2' />Yes</span>}
                        </button>
                    </DialogActions>
                </div>
            </Dialog>

            {/* Edit Vendor Dialog - No changes to functionality */}
            <Dialog
                open={openEdit}
                onClose={handleEditClose}
                TransitionComponent={Transition}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className='p-4'>
                    <DialogContent>
                        <EditVendorForm initialData={vendor} />
                    </DialogContent>
                </div>
            </Dialog>
        </>
    )
}