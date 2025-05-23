import React, { useEffect, useState } from 'react';
import OrderCard from '../../components/vendor/OrderCard';
import { useSelector } from 'react-redux';
import axiosClient from '../../service/axiosClient';

export default function VendorOrder() {
    const vendor = useSelector((state) => state.vendorAuth.vendor);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [vendorOrders, SetVendorOrders] = useState([]);

    useEffect(() => {
        const getAllBookingByVendorId = async () => {
            try {
                setLoading(true); // Set loading state to true
                const response = await axiosClient.get(`/api/admin/order/getorder/${vendor._id}`); // Use the vendor's _id
                if (response.status === 200) {
                    console.log("Bookings fetched successfully:", response);
                    const sortedOrders = response.data.data.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setBookings(sortedOrders);
                } else {
                    console.error("Failed to fetch bookings");
                }
            } catch (error) {
                console.error("Error fetching bookings:", error.response?.data?.message || error.message);
            } finally {
                setLoading(false); // Set loading state to false
            }
        };
        const getVendorOrderByVendorId = async () => {
            try {
                const response = await axiosClient.get(`/api/vendor/vendororder/getvendorOrder/${vendor._id}`)
                SetVendorOrders(response.data.vendorOrders);
            } catch (error) {
                console.log(error);
            }
        }
        getVendorOrderByVendorId();
        getAllBookingByVendorId();
    }, [vendor]); // Dependency array ensures this runs when the vendor changes

    return (
        <>
            <div className='grid grid-cols-1 md:grid-cols-2'>
                {loading ? (
                    <p>Loading...</p> // Show loading text while fetching data
                ) : (
                    bookings.length > 0 ? (
                        bookings.map((booking) => {
                            // Find the first matching vendorOrder for the current booking
                            const matchingVendorOrder = vendorOrders.find(
                                (vendorOrder) => vendorOrder.orderId === booking._id
                            );

                            return (
                                <OrderCard
                                    key={booking._id}
                                    booking={booking}
                                    vendorOrder={matchingVendorOrder} // Pass the first matching vendorOrder to the OrderCard
                                />
                            );
                        })
                    ) : (
                        <p>No bookings found</p> // Show message when no bookings are available
                    )
                )}
            </div>
        </>
    );
}
