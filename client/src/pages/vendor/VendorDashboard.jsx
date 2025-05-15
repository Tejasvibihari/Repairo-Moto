import React, { useEffect } from 'react'
import ProfileCard from '../../components/empolyee/ProfileCard'
import { useSelector } from 'react-redux';
import VendorProfileCard from '../../components/vendor/VendorProfileCard';
import OrderStatusCard from '../../components/empolyee/OrderStatusCard';
import axiosClient from '../../service/axiosClient';
import CircularLoading from '../../components/ui/CircularLoading';
import VendorRevenueCard from '../../components/vendor/VendorRevenueCard';

export default function VendorDashboard() {
    const vendor = useSelector((state) => state.vendorAuth.vendor);
    const [fetchOrder, setFetchOrder] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        const fetchVendorOrder = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/api/vendor/vendororder/getvendorOrder/${vendor._id}`);
                setFetchOrder(response.data.vendorOrders);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchVendorOrder();
    }, [])
    if (loading) {
        return (
            <>
                <div className='flex justify-center items-center h-screen flex-col space-y-4'>
                    <CircularLoading />
                    <span className='text-lg font-semibold text-gray-700'>
                        Loading.......
                    </span>
                </div>
            </>
        )
    }

    return (
        <>
            <VendorProfileCard key={vendor._id} vendor={vendor} />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                <OrderStatusCard
                    title="Total Orders"
                    count={fetchOrder.length}
                    icon="bag"
                    color="amber"
                    trend="+14% from last month"
                    className="w-full"
                />
                <VendorRevenueCard orders={fetchOrder} />
            </div>
        </>
    )
}
