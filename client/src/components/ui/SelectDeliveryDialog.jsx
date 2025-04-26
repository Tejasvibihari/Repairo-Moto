import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Heading from './Heading';
import axiosClient from '../../service/axiosClient';
import AlertSnackBar from './AlertSnackBar';
import { useState } from 'react';
import CircularLoading from './CircularLoading';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function SelectDeliveryDialog({ open, onClose, data, bookingId }) {
    const [selectedDelivery, setSelectedDelivery] = useState(""); // State to store the selected delivery person ID
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity

    const handleClose = () => {
        if (onClose) {
            onClose(); // Ensure the onClose function is called
        }
    };

    const handleDeliveryUpdate = async () => {
        try {
            setLoading(true);
            if (!selectedDelivery) {
                setSnackBarMessage("Please select a delivery person before updating."); // Set the message to display in the Snackbar
                setSnackBarSeverity('warning'); // Set severity to warning
                setSnackBarOpen(true);
                setLoading(false);
                return;
            }

            const response = await axiosClient.put(`/api/admin/order/updateDelivery/${bookingId}`, {
                deliveryId: selectedDelivery, // Send the selected delivery person ID
            });

            if (response.status === 200) {
                setSnackBarMessage("Delivery person updated successfully!"); // Set the message to display in the Snackbar
                setSnackBarSeverity('success'); // Set severity to success
                setSnackBarOpen(true);
                setLoading(false);
                onClose(); // Close the dialog after successful update
            } else {
                setSnackBarMessage("Failed to update delivery person. Please try again."); // Set the message to display in the Snackbar
                setSnackBarSeverity('error'); // Set severity to error
                setSnackBarOpen(true);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error updating delivery person:", error);
            setSnackBarMessage(error.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('error'); // Set severity to error
            setSnackBarOpen(true);
            setLoading(false);
        }
    };

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

            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    <Heading heading={"Select Delivery Boy"} />
                    <IconButton
                        aria-label="close"
                        onClick={handleClose} // Call the handleClose function
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={selectedDelivery} // Bind the selected delivery person ID
                        onChange={(e) => setSelectedDelivery(e.target.value)} // Update the state when a delivery person is selected
                    >
                        {data.map((d, i) => (
                            <FormControlLabel
                                key={i}
                                value={d._id}
                                control={<Radio />}
                                label={
                                    <div className='flex gap-4 items-center my-4 border border-gray-300 p-2 rounded'>
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/${d.profileImage}`}
                                            alt={`${d.firstName} ${d.lastName}`}
                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                        />
                                        <span>{`${d.firstName} ${d.lastName}`}</span>
                                    </div>
                                }
                            />
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <button
                        onClick={handleDeliveryUpdate}
                        className='my-2 p-1 px-2 bg-primary rounded text-white cursor-pointer border border-primary hover:bg-transparent hover:text-black'
                    >
                        {loading ? <CircularLoading size={25} /> : "Update"}
                    </button>
                    <Button autoFocus onClick={handleClose}>
                        Close
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    );
}