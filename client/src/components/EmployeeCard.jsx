import React from 'react'
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

export default function EmployeeCard() {
    const [open, setOpen] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);

    const handleClickOpen = () => {
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

    return (
        <>
            <div className='border border-primary shadow-sm rounded-md p-4 mt-6 w-full'>
                <div className='flex flex-col gap-2 items-center justify-between'>
                    <div>
                        <img src="https://via.placeholder.com/150" alt="Employee" className='w-24 h-24 rounded-full border border-primary shadow-md' />
                    </div>
                    <div className='flex flex-col gap-1 items-center justify-center'>
                        <span className='text-sm font-inter font-semibold'>John Doe</span>
                        <span className='text-sm font-inter font-semibold'>Role</span>
                        <span className='text-sm font-inter'>6205731150</span>
                        <span className='text-sm font-inter'>tejasvibihari2000@gmail.com</span>
                        <span className='text-sm font-inter'>Rating</span>
                    </div>
                    <div className='flex gap-2'>
                        <button onClick={handleClickOpen} className='flex items-center justify-center bg-primary text-white py-2 rounded-md px-8 cursor-pointer hover:bg-transparent hover:text-primary border border-primary'>
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
                    <EditEmployeeForm />
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
                <DialogTitle id="alert-dialog-title">
                    <Heading heading={"Delete Employee"} />
                </DialogTitle>
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
                        onClick={handleDeleteClose}
                        autoFocus
                        className='flex flex-row cursor-pointer bg-red-600 text-white border hover:border-red-600 px-4 py-2 rounded hover:text-red-600 hover:bg-transparent'
                    >
                        <Check className='mr-2' /> Yes
                    </button>
                </DialogActions>
            </Dialog>
        </>
    )
}
