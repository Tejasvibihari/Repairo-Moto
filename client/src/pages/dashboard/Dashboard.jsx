import { useState } from 'react'
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import axiosClient from '../../service/axiosClient';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBrands } from '../../app/slice/brandSlice';
import TotalBookingsCard from '../../components/TotalBookingCard';
import OrderStatusCard from '../../components/OrderStatusCard';
import TotalRevenueCard from '../../components/TotalRevenueCard';
import StaffCountCard from '../../components/StaffCountCard';
import MechanicManagement from '../../components/MechanicStatus';


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
    const [dashboardData, setDashboardData] = useState({
        totalBookings: 1245,
        pendingOrders: 84,
        inProgressOrders: 156,
        completedOrders: 1005,
        totalRevenue: 125750,
        totalMechanics: 35,
        totalVendors: 12,
        totalDeliveryStaff: 28
    });
    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />
            <div className="p-8 bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Bookings */}
                    <TotalBookingsCard totalBookings={dashboardData.totalBookings} />

                    {/* Order Status Cards */}
                    <OrderStatusCard status="Pending" count={dashboardData.pendingOrders} />
                    <OrderStatusCard status="In Progress" count={dashboardData.inProgressOrders} />
                    <OrderStatusCard status="Completed" count={dashboardData.completedOrders} />

                    {/* Total Revenue */}
                    <TotalRevenueCard revenue={dashboardData.totalRevenue} />

                    {/* Staff Count Cards */}
                    <StaffCountCard type="Mechanics" count={dashboardData.totalMechanics} />
                    <StaffCountCard type="Vendors" count={dashboardData.totalVendors} />
                    <StaffCountCard type="Delivery Staff" count={dashboardData.totalDeliveryStaff} />
                </div>
            </div>
          <div className='grid grid-cols-1 md:grid-cols-2'>
                <MechanicManagement />
                <MechanicManagement />
          </div>
        </>

    )
}
