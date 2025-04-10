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


export default function VendorProfileCard({ vendor }) {
    const dispatch = useDispatch();
    const [openDelete, setOpenDelete] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity
    const handleDeleteOpen = () => {
        setOpenDelete(true);
    };

    const handleDeleteClose = () => {
        setOpenDelete(false);
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
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />
            <div className='shadow p-4 rounded-sm'>
                <div className='flex flex-row gap-4 justify-between items-center'>
                    <img src={`${import.meta.env.VITE_API_URL}/${vendor.profileImage}`} className='w-40 rounded-xl' />
                    <div className='flex flex-col gap-1'>
                        <div>
                            <span className='font-inter font-semibold'>Business Name:- </span>
                            <span>Tejasvi Kumar</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>GST No.:- </span>
                            <span>Tejasvi Kumar</span>
                        </div>
                    </div>
                </div>
                <div className='border border-gray-300 rounded p-3 mt-4 flex flex-row itms-center justify-between'>
                    <div>
                        <div>
                            <span className='font-inter font-semibold'>Name:- </span>
                            <span>{vendor.firstName} {vendor.lastName}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Phone:- </span>
                            <span>{vendor.phone}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Email:- </span>
                            <span>{vendor.email}</span>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span className='font-inter font-semibold'>Address:- </span>
                            <span>{vendor.address}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>City:- </span>
                            <span>{vendor.city}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>State:- </span>
                            <span>{vendor.state}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Pincode:- </span>
                            <span>{vendor.pincode}</span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row items-center justify-between mt-3'>
                    <button className='flex flex-row itemms-center justify-center px-4 py-2 bg-primary rounded text-white hover:bg-transparent hover:text-primary border border-primary cursor-pointer'>
                        <span className='flex flex-row'><UserCog className='mr-2' />Edit</span>
                    </button>
                    <button
                        onClick={handleDeleteOpen}
                        className='flex flex-row itemms-center justify-center px-4 py-2 bg-red-600 rounded text-white hover:bg-transparent hover:text-red-600 border border-red-600 cursor-pointer'>
                        <span className='flex flex-row'><Trash className='mr-2' />Delete</span>
                    </button>
                </div>
            </div >

            {/* Delete Dialog  */}
            <Dialog Dialog
                open={openDelete}
                onClose={handleDeleteClose}
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
        </>
    )
}
