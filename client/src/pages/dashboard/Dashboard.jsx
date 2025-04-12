import { useState } from 'react'
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import axiosClient from '../../service/axiosClient';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBrands } from '../../app/slice/brandSlice';


export default function Dashboard() {
    const dispatch = useDispatch();
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity


    useEffect(() => {
        const fetchBrands = async () => {

            try {
                const response = await axiosClient.get('/api/admin/brands/getBrands');
                dispatch(setBrands(response.data))
            } catch (error) {
                console.error("Error fetching brands:", error);
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access"); // Set the message to display in the Snackbar
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }

        }
        fetchBrands()
    }, [])
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
            <div className='text-primary'>Dashboard</div>
        </>

    )
}
