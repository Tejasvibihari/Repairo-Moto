import React, { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField';
import { Plus } from 'lucide-react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar'; // Import the Snackbar component
import CircularLoading from './ui/CircularLoading';
export default function AddBikeModel() {
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('');
    const [brand, setBrand] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(''); // State to store the selected brand
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axiosClient.get("/api/admin/brands/getbrands");
                setBrand(response.data);
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };
        fetchBrands();
        console.log(brand);
    }, [])
    const addModel = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axiosClient.post("api/admin/brands/addmodel", { brandId: selectedBrand, modelName: model });
            console.log(response.data.message);
            setSnackBarMessage(response.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true); // Open the Snackbar
            setModel(''); // Clear the model input after submission
            setLoading(false);
        } catch (error) {
            console.log(error);
            setSnackBarMessage(error.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('error'); // Set severity to success
            setSnackBarOpen(true);
            setLoading(false); // Stop loading state
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
            <div className='shadow-sm border border-gray-300 rounded p-4'>
                <h1 className='text-kanit font-semibold border-l-4 pl-2 border-primary my-2'>
                    Add Bike Model
                </h1>
                <form onSubmit={addModel} className='flex flex-col gap-4 items-end justify-center mt-6 p-4 border border-gray-300 rounded'>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Select Brand</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Select Brand"
                            sx={{ marginBottom: 2 }} // Adds margin below the Select component
                            value={selectedBrand} // Bind the state to the Select component
                            onChange={(e) => setSelectedBrand(e.target.value)} // Update state on change
                        >
                            {brand && brand.map((b) => (
                                <MenuItem key={b._id} value={b._id}>
                                    {b.brandName}
                                </MenuItem>
                            ))}
                        </Select>
                        <TextField
                            onChange={(e) => setModel(e.target.value)}
                            value={model}
                            fullWidth id="outlined-basic" label="Bike Model" variant="outlined" />
                    </FormControl>
                    <button type="submit" className="flex flex-row items-center justify-center space-x-2 font-inter text-bold border py-2 rounded-sm border-primary cursor-pointer hover:bg-primary text-primary hover:text-white px-6 w-full">
                        {loading ? <div className='flex items-center justify-center'> <CircularLoading size={20} /></div> : <div className='flex flex-row space-x-2'><span><Plus /></span><span>Add Model</span></div>}
                    </button>
                </form>

            </div>
        </>
    )
}
