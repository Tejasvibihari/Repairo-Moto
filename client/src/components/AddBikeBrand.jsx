import { useState } from 'react';
import axiosClient from '../service/axiosClient.js';
import CircularLoading from './ui/CircularLoading.jsx';
import TextField from '@mui/material/TextField';
import { Plus } from 'lucide-react';
import AlertSnackBar from './ui/AlertSnackBar.jsx';

export default function AddBikeBrand() {
    const [brand, setBrand] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity

    const addBrand = async (e) => {
        e.preventDefault();
        console.log("Hello");
        try {
            setLoading(true);
            const response = await axiosClient.post("api/admin/brands/addbrand", { brandName: brand });
            console.log(response);
            setSnackBarMessage(response.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true); // Open the Snackbar
            setBrand(''); // Clear the model input after submission
            setLoading(false);
        } catch (error) {
            console.log(error);
            setSnackBarMessage(error.message); // Set the message to display in the Snackbar
            setSnackBarSeverity("error"); // Set the message to display in the Snackbar
            setSnackBarOpen(true);
            setLoading(false); // Stop loading state
        }
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
            <div className='shadow-sm border border-gray-300 rounded p-4'>
                <h1 className='text-kanit font-semibold border-l-4 pl-2 border-primary my-2'>
                    Add Bike Brand
                </h1>
                <form onSubmit={addBrand} className='flex flex-col gap-4 items-end justify-center mt-6 p-4 border border-gray-300 rounded'>
                    <TextField
                        onChange={(e) => setBrand(e.target.value)}
                        value={brand}
                        fullWidth
                        id="outlined-basic"
                        label="Bike Brand"
                        variant="outlined"
                        required
                        placeholder='Enter Bike Brand'
                    />
                    <button type="submit" className="flex flex-row items-center justify-center space-x-2 font-inter text-bold border py-2 rounded-sm border-primary cursor-pointer hover:bg-primary text-primary hover:text-white px-6 w-full">
                        {loading ? <div className='flex items-center justify-center'> <CircularLoading size={20} /></div> : <div className='flex flex-row space-x-2'><span><Plus /></span><span>Add Model</span></div>}
                    </button>
                </form>
            </div>
        </>
    );
}