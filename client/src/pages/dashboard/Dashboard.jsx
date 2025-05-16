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
    const [vendor, setVendor] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [order, setOrder] = useState([]);

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
        const fetchVendor = async () => {
            try {
                const response = await axiosClient.get('/api/vendor/getallvendor');
                setVendor(response.data.vendors)
            } catch (error) {
                console.error("Error fetching vendor:", error);
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access"); // Set the message to display in the Snackbar
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        }
        const fetchEmployee = async () => {
            try {
                const response = await axiosClient.get('/api/admin/employee/getallemployee');
                setEmployee(response.data.employees)
            } catch (error) {
                console.error("Error fetching vendor:", error);
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access"); // Set the message to display in the Snackbar
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        }
        const fetchOrder = async () => {
            try {
                const response = await axiosClient.get('/api/admin/order/getallorder');
                setOrder(response.data)
            } catch (error) {
                console.error("Error fetching vendor:", error);
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access"); // Set the message to display in the Snackbar
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        }
        // const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        fetchOrder();
        fetchBrands()
        fetchVendor();
        fetchEmployee()
    }, [])
    const calculateRevenue = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0-based
        const currentYear = currentDate.getFullYear();

        return order.reduce((sum, order) => {
            const orderDate = new Date(order.createdAt);
            const orderMonth = orderDate.getMonth();
            const orderYear = orderDate.getFullYear();

            if (orderMonth === currentMonth && orderYear === currentYear) {
                return sum + (order?.total?.total || 0);
            }
            console.log(sum)
            return sum;
        }, 0);
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
            <div className="p-8 bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Bookings */}
                    <TotalBookingsCard totalBookings={order.length} />

                    {/* Order Status Cards */}
                    <OrderStatusCard status="Pending" count={order.filter((o) => o.status === "Pending").length} />
                    <OrderStatusCard status="In Progress" count={order.filter((o) => o.status === "In Progress").length} />
                    <OrderStatusCard status="Completed" count={order.filter((o) => o.status === "Completed").length} />

                    {/* Total Revenue */}
                    <TotalRevenueCard revenue={calculateRevenue()} />

                    {/* Staff Count Cards */}
                    <StaffCountCard
                        type="Mechanics"
                        count={employee.filter((e) => e.position === "mechanic").length}
                    />
                    <StaffCountCard type="Vendors" count={vendor.length} />
                    <StaffCountCard type="Delivery Staff" count={employee.filter((e) => e.position === "delivery").length} />
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2'>

            </div>
        </>

    )
}
