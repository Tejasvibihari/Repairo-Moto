import React, { useEffect, useState } from 'react'
import OrderTable from '../../components/OrderTable'
import axiosClient from "../../service/axiosClient"
import AlertSnackBar from '../../components/ui/AlertSnackBar';

export default function ManageOrder() {
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity
    const [allOrders, SetAllOrders] = useState([]); // State to store all orders

    useEffect(() => {
        const getAllOrders = async () => {
            try {
                const response = await axiosClient.get('/api/admin/order/getallorder');
                // console.log(response.data)
                SetAllOrders(response.data); // Update state with the fetched orders
            } catch (error) {
                console.log(error);

                // Check if the error is an AxiosError and has a response
                if (error.response) {
                    // Extract the error message from the response
                    const errorMessage = error.response.data.message || `Error: ${error.response.status}`;
                    setSnackBarMessage(errorMessage); // Set the message to display in the Snackbar
                } else if (error.request) {
                    // Handle errors where the request was made but no response was received
                    setSnackBarMessage('No response from the server. Please try again later.');
                } else {
                    // Handle other errors (e.g., network issues)
                    setSnackBarMessage(error.message || 'An unexpected error occurred.');
                }
                setSnackBarSeverity('error'); // Set severity to error
                setSnackBarOpen(true); // Open the Snackbar
            }

        }
        getAllOrders()
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
            <OrderTable orders={allOrders} />
        </>
    )
}
