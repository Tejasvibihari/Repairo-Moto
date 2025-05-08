import React, { useState, useEffect } from 'react'
import AllBookingCard from '../../components/empolyee/AllBookingCard'
import axiosClient from '../../service/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import CircularLoading from '../../components/ui/CircularLoading';
import Heading from '../../components/ui/Heading';
import DeliveryOrderCard from '../../components/empolyee/DeliveryOrderCard';
import BookingFilters from '../../components/ui/BookingFilters';


export default function EmployeeBooking() {
    const employee = useSelector((state) => state.employeeAuth.employee)
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    const [filteredBookings, setFilteredBookings] = useState([])
    const [vendors, setVendors] = useState([])

    const handleSaveParts = async (bookingId, updatedParts) => {
        try {
            // Send API request to update the parts in backend
            await axiosClient.put(`/api/bookings/${bookingId}/update-parts`, {
                partsUsed: updatedParts,
            });

            // Update frontend bookings state
            setBookings(prevBookings =>
                prevBookings.map(b =>
                    b._id === bookingId ? { ...b, partsUsed: updatedParts } : b
                )
            );

            // Also update filtered bookings
            setFilteredBookings(prevBookings =>
                prevBookings.map(b =>
                    b._id === bookingId ? { ...b, partsUsed: updatedParts } : b
                )
            );

            console.log('Parts updated successfully');
        } catch (error) {
            console.error('Error updating parts:', error);
        }
    };

    useEffect(() => {
        const getAllBookingByEmpId = async () => {
            try {
                setLoading(true); // Set loading state to true
                const response = await axiosClient.get(`/api/admin/order/getorder/${employee._id}`); // Use the employee's _id
                const vendorResponse = await axiosClient.get(`/api/vendor/getallvendor`);
                if (response.status === 200) {
                    setBookings(response.data.data); // Update the bookings state with the fetched data
                    setFilteredBookings(response.data.data); // Initialize filtered bookings with all bookings
                    setVendors(vendorResponse.data.vendors); // Update the vendors state with the fetched data
                    console.log(response.data.data)
                    console.log(vendorResponse.data.vendors)
                } else {
                    console.error("Failed to fetch bookings");
                }
            } catch (error) {
                console.error("Error fetching bookings:", error.response?.data?.message || error.message);
            } finally {
                setLoading(false); // Set loading state to false
            }
        };
        getAllBookingByEmpId()
    }, [employee]); // Dependency array ensures this runs when the employee changes

    const handleFilterChange = (filters) => {
        let results = [...bookings];

        // Filter by search term (name or order number)
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            results = results.filter(booking =>
                (booking.customerName && booking.customerName.toLowerCase().includes(searchLower)) ||
                (booking.orderNumber && booking.orderNumber.toLowerCase().includes(searchLower))
            );
        }

        // Filter by status
        if (filters.status) {
            results = results.filter(booking => booking.status === filters.status);
        }

        // Filter by date range
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setHours(0, 0, 0, 0);
            results = results.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate >= startDate;
            });
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            results = results.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate <= endDate;
            });
        }

        setFilteredBookings(results);
    };

    if (loading) {
        return <div className='flex items-center h-screen w-full justify-center'><CircularLoading size={50} /> </div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className='mb-4'>
                <Heading heading="Recent Order" />
            </div>

            {/* Filter section */}
            <BookingFilters onFilterChange={handleFilterChange} />

            {/* Responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredBookings.map((booking) => {
                    const assignedVendor = vendors.find(v => v._id === booking.vendorId);

                    return (
                        <div key={booking._id} className="w-full">
                            {employee.position === 'mechanic' && (
                                <AllBookingCard
                                    booking={booking}
                                    onSaveParts={handleSaveParts}
                                />
                            )}

                            {employee.position === 'delivery' && (
                                <DeliveryOrderCard
                                    order={booking}
                                    vendor={assignedVendor}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* No bookings state */}
            {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found</p>
                </div>
            )}
        </div>
    )
}