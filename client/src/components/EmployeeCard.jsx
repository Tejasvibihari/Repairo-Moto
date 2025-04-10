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
export default function EmployeeCard({ id, firstName, lastName, role, phone, email, profileImage, address, city, state, pinCode, referralCode }) {
    const [open, setOpen] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity
    const [loading, setLoading] = React.useState(false); // State to control loading spinner
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
            setLoading(true); // Start loading state
            const response = await axiosClient.delete(`/api/admin/employee/deleteemployee/${id}`);
            console.log(response.data.employees);
            setSnackBarMessage(response.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true); // Open the Snackbar
            setLoading(false); // Stop loading state
            handleDeleteClose()
            dispatch(setEmployee(response.data.employees)); // Update the employees in the Redux store
        } catch (error) {
            console.log(error);
            setSnackBarMessage(error.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('error'); // Set severity to error
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
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />
            <div className='border border-primary shadow-sm rounded-md p-4 mt-6 w-full'>
                <div className='flex flex-col gap-2 items-center justify-between'>
                    <div>
                        <img src={`${import.meta.env.VITE_API_URL}/${profileImage}`} alt={profileImage} className='w-24 h-24 rounded-full border border-primary shadow-md' />
                    </div>
                    <div className='flex flex-col gap-1 items-center justify-center'>
                        <span className='text-sm font-inter font-semibold'>{firstName} {lastName}</span>
                        <span className='text-sm font-inter font-semibold'>{role}</span>
                        <span className='text-sm font-inter'>{phone}</span>
                        <span className='text-sm font-inter'>{email}</span>
                        <span className='text-sm font-inter'>{referralCode}</span>
                        <span className='text-sm font-inter'>Rating</span>
                    </div>
                    <div className='flex gap-2'>
                        <button onClick={handleEditOpen} className='flex items-center justify-center bg-primary text-white py-2 rounded-md px-8 cursor-pointer hover:bg-transparent hover:text-primary border border-primary'>
                            <UserPen size={18} className='mr-2' /> Edit
                        </button>
                        <button onClick={handleDeleteOpen} className='flex items-center justify-center bg-transparent text-red-600 py-2 rounded-md px-8 cursor-pointer hover:bg-red-600 hover:text-white border border-primary'>
                            <Trash size={18} className='mr-2' />    Delete
                        </button>
                    </div>
                </div>
            </div>
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
                            role: role,
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
                        {loading ? <CircularLoading /> : <span className='flex flex-row'>      <Check className='mr-2' /> Yes</span>}
                    </button>
                </DialogActions>
            </Dialog >
        </>
    )
}
