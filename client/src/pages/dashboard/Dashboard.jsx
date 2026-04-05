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
import CompletedOrdersChart from '../../components/CompletedOrdersChart';
import RevenueChart from '../../components/RevenueChart';

export default function Dashboard() {
    const dispatch = useDispatch();
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [vendor, setVendor] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [order, setOrder] = useState([]); // will store array of orders

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axiosClient.get('/api/admin/brands/getBrands');
                dispatch(setBrands(response.data))
            } catch (error) {
                console.error("Error fetching brands:", error);
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access");
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
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access");
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        }

        const fetchEmployee = async () => {
            try {
                const response = await axiosClient.get('/api/admin/employee/getallemployee');
                setEmployee(response.data.employees)
            } catch (error) {
                console.error("Error fetching employee:", error);
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access");
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        }

        const fetchOrder = async () => {
            try {
                const response = await axiosClient.get('/api/admin/order/getallorder');
                // Handle both old (array) and new (object with data) response formats
                if (Array.isArray(response.data)) {
                    setOrder(response.data);
                } else if (response.data.success && Array.isArray(response.data.data)) {
                    setOrder(response.data.data);
                } else {
                    setOrder([]);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access");
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        }

        fetchOrder();
        fetchBrands();
        fetchVendor();
        fetchEmployee();
    }, [dispatch])

    const calculateRevenue = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return order.reduce((sum, orderItem) => {
            const orderDate = new Date(orderItem.createdAt);
            const orderMonth = orderDate.getMonth();
            const orderYear = orderDate.getFullYear();

            if (orderMonth === currentMonth && orderYear === currentYear) {
                // total can be a nested object (total.total) or a direct number
                const amount = orderItem.total?.total || orderItem.total || 0;
                return sum + amount;
            }
            return sum;
        }, 0);
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    }

    // Safely compute counts with optional chaining
    const pendingCount = order.filter(o => o.status === "Pending").length;
    const inProgressCount = order.filter(o => o.status === "In Progress").length;
    const completedCount = order.filter(o => o.status === "Completed" || o.status === "Invoice Generated").length;
    const mechanicCount = employee.filter(e => e.position === "mechanic").length;
    const deliveryCount = employee.filter(e => e.position === "delivery").length;

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />
            <div className="p-8 bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <TotalBookingsCard totalBookings={order.length} />
                    <OrderStatusCard status="Pending" count={pendingCount} />
                    <OrderStatusCard status="In Progress" count={inProgressCount} />
                    <OrderStatusCard status="Completed" count={completedCount} />
                    <TotalRevenueCard revenue={calculateRevenue()} />
                    <StaffCountCard type="Mechanics" count={mechanicCount} />
                    <StaffCountCard type="Vendors" count={vendor.length} />
                    <StaffCountCard type="Delivery Staff" count={deliveryCount} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="w-full">
                    <CompletedOrdersChart />
                </div>
                <div className="w-full">
                    <RevenueChart />
                </div>
            </div>
        </>
    )
}