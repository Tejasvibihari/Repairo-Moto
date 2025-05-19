import React, { useEffect, useState } from 'react'
import OrderTable from '../../components/OrderTable'
import axiosClient from "../../service/axiosClient"
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';
import OrderFilter from '../../components/ui/OrderFilter';


export default function ManageOrder() {
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity
    const [allOrders, setAllOrders] = useState([]); // State to store all orders
    const [filteredOrders, setFilteredOrders] = useState([]); // State to store filtered orders
    const [loading, setLoading] = useState(false); // State to control loading state

    useEffect(() => {
        const getAllOrders = async () => {
            try {
                setLoading(true); // Set loading to true before making the request
                const response = await axiosClient.get('/api/admin/order/getallorder');
                setAllOrders(response.data); // Update state with the fetched orders
                setFilteredOrders(response.data); // Initialize filtered orders with all orders
                setLoading(false)
            } catch (error) {
                if (error.response) {
                    const errorMessage = error.response.data.message || `Error: ${error.response.status}`;
                    setSnackBarMessage(errorMessage);
                } else if (error.request) {
                    setSnackBarMessage('No response from the server. Please try again later.');
                } else {
                    setSnackBarMessage(error.message || 'An unexpected error occurred.');
                }
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
                setLoading(false);
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
            {loading ? (
                <div className="flex flex-col text-center justify-center items-center font-semibold">
                    <span>
                        <CircularLoading />
                    </span>
                    <span>
                        Loading Please Wait...
                    </span>
                </div>
            ) : allOrders.length <= 0 ? (
                <div className='flex text-center justify-center font-semibold'>No Order Found</div>
            ) : (
                <div>
                    {/* Add the OrderFilter component */}
                    <OrderFilter
                        orders={allOrders}
                        setFilteredOrders={setFilteredOrders}
                    />
                  
                    {/* Pass the filtered orders to the OrderTable */}
                    <OrderTable orders={filteredOrders} />
                </div>
            )}
        </>
    )
}