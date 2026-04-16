import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Checkbox from '@mui/material/Checkbox';          // ✅ added import
import FormControlLabel from '@mui/material/FormControlLabel';
import Heading from './Heading';
import axiosClient from '../../service/axiosClient';
import AlertSnackBar from './AlertSnackBar';
import { useState } from 'react';
import CircularLoading from './CircularLoading';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

export default function SelectMechanicDialog({
    open,
    onClose,
    data,
    bookingId,
    currentMechanics = []   // ✅ destructure currentMechanics
}) {
    const [selectedMechanics, setSelectedMechanics] = useState(
        currentMechanics.map(m => m._id || m)
    );
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    const handleClose = () => {
        if (onClose) onClose();
    };

    // ✅ Toggle mechanic selection
    const handleToggleMechanic = (mechanicId) => {
        setSelectedMechanics(prev =>
            prev.includes(mechanicId)
                ? prev.filter(id => id !== mechanicId)
                : [...prev, mechanicId]
        );
    };

    const handleMechUpdate = async () => {
        if (selectedMechanics.length === 0) {
            setSnackBarMessage("Please select at least one mechanic.");
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            return;
        }
        try {
            setLoading(true);
            const response = await axiosClient.put(`api/admin/order/update/updateMechanic/${bookingId}`, {
                mechanicIds: selectedMechanics,
            });
            if (response.status === 200) {
                setSnackBarMessage("Mechanics updated successfully!");
                setSnackBarSeverity('success');
                setSnackBarOpen(true);
                onClose();
            } else {
                setSnackBarMessage("Failed to update mechanics.");
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        } catch (error) {
            console.error(error);
            setSnackBarMessage(error.message);
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
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
            <BootstrapDialog onClose={handleClose} open={open}>
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    <Heading heading={"Select Mechanics"} />
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {data.map((mechanic) => (
                        <FormControlLabel
                            key={mechanic._id}
                            control={
                                <Checkbox
                                    checked={selectedMechanics.includes(mechanic._id)}
                                    onChange={() => handleToggleMechanic(mechanic._id)}
                                />
                            }
                            label={
                                <div className='flex gap-4 items-center my-4 border border-gray-300 p-2 rounded'>
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${mechanic.profileImage}`}
                                        alt={`${mechanic.firstName} ${mechanic.lastName}`}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                    />
                                    <span>{`${mechanic.firstName} ${mechanic.lastName}`}</span>
                                </div>
                            }
                        />
                    ))}
                </DialogContent>
                <DialogActions>
                    <button
                        onClick={handleMechUpdate}
                        className='my-2 p-1 px-2 bg-primary rounded text-white cursor-pointer border border-primary hover:bg-transparent hover:text-black'
                    >
                        {loading ? <CircularLoading size={25} /> : "Update"}
                    </button>
                    <Button autoFocus onClick={handleClose}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    );
}