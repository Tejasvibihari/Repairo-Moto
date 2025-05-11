import React, { useState } from 'react'
import { Check, CircleX, Trash, UserPen, X } from 'lucide-react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Heading from './ui/Heading';
import AddEmployeeForm from './AddEmployeeForm';
import EditEmployeeForm from './EditEmployeeForm';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import { useDispatch } from 'react-redux';
import { setEmployee } from '../app/slice/employeeSlice';

export default function EmployeeCard({ id, firstName, lastName, position, phone, email, profileImage, address, city, state, pinCode, referralCode }) {
    const [open, setOpen] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [loading, setLoading] = React.useState(false);
    const dispatch = useDispatch()

    const handleEditOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDeleteOpen = () => {
        setOpenDelete(true);
    };

    const handleDeleteClose = () => {
        setOpenDelete(false);
    };

    const handleDelete = async (id) => {
        try {
            console.log(id)
            setLoading(true);
            const response = await axiosClient.delete(`/api/admin/employee/deleteemployee/${id}`);
            console.log(response.data.employees);
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            setLoading(false);
            handleDeleteClose()
            dispatch(setEmployee(response.data.employees));
        } catch (error) {
            console.log(error);
            setSnackBarMessage(error.message);
            setSnackBarSeverity('error');
        }
    }

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />

            {/* Redesigned Employee Card */}
            <div className='bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-primary my-4'>
                <div className='flex flex-col p-6'>
                    {/* Profile Image Section */}
                    <div className='flex justify-center mb-4'>
                        <div className='relative'>
                            <img
                                src={`${import.meta.env.VITE_API_URL}${profileImage}`}
                                alt={`${firstName} ${lastName}`}
                                className='w-28 h-28 rounded-full object-cover border-4 border-primary shadow-md'
                            />
                            <div className='absolute bottom-0 right-0 bg-primary text-white rounded-full p-1'>
                                <UserPen size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Employee Details Section */}
                    <div className='text-center mb-4'>
                        <h3 className='text-lg font-bold text-primary mb-1'>{firstName} {lastName}</h3>
                        <span className='inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2'>{position}</span>

                        <div className='grid grid-cols-1 gap-2 mt-3'>
                            <div className='text-sm text-gray-700'>{phone}</div>
                            <div className='text-sm text-gray-700'>{email}</div>
                            <div className='text-sm font-semibold text-primary'>{referralCode}</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3 mt-2'>
                        <button
                            onClick={handleEditOpen}
                            className='flex-1 flex items-center justify-center bg-primary text-white py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-transparent hover:text-primary border border-primary'
                        >
                            <UserPen size={16} className='mr-2' /> Edit
                        </button>
                        <button
                            onClick={handleDeleteOpen}
                            className='flex-1 flex items-center justify-center bg-transparent text-red-600 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-red-600 hover:text-white border border-red-600'
                        >
                            <Trash size={16} className='mr-2' /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Dialog - No changes to functionality */}
            <Dialog
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries());
                            const email = formJson.email;
                            console.log(email);
                            handleClose();
                        },
                    },
                }}
            >
                <DialogContent>
                    <EditEmployeeForm
                        initialData={{
                            id: id,
                            firstName: firstName,
                            lastName: lastName,
                            phone: phone,
                            email: email,
                            position: position,
                            address: address,
                            city: city,
                            state: state,
                            pinCode: pinCode,
                            profileImage: profileImage
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDelete}
                onClose={handleDeleteClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Heading heading={"Delete Employee"} />

                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you Sure Want to Delete Employee
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <button className='flex flex-row cursor-pointer hover:bg-primary hover:text-white border border-primary px-4 py-2 rounded text-primary'
                        onClick={handleDeleteClose}>
                        <X className='mr-2' />No</button>
                    <button
                        onClick={() => handleDelete(id)}
                        autoFocus
                        className='flex flex-row cursor-pointer bg-red-600 text-white border hover:border-red-600 px-4 py-2 rounded hover:text-red-600 hover:bg-transparent'
                    >
                        {loading ? <CircularLoading /> : <span className='flex flex-row'><Check className='mr-2' /> Yes</span>}
                    </button>
                </DialogActions>
            </Dialog>
        </>
    )
}