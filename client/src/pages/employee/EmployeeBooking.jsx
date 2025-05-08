import React, { useState, useEffect } from 'react'
import AllBookingCard from '../../components/empolyee/AllBookingCard'
import axiosClient from '../../service/axiosClient';
import { useSelector } from 'react-redux';
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

    // Group bookings by date
    const groupBookingsByDate = (bookings) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create groups
        const todayBookings = [];
        const previousBookings = [];

        // Group bookings by date
        bookings.forEach(booking => {
            const bookingDate = new Date(booking.createdAt);
            bookingDate.setHours(0, 0, 0, 0);

            if (bookingDate.getTime() === today.getTime()) {
                todayBookings.push(booking);
            } else {
                previousBookings.push(booking);
            }
        });

        // Sort previous bookings by date (newest first)
        previousBookings.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });

        return { todayBookings, previousBookings };
    };

    // Group bookings by specific date for previous bookings
    const groupPreviousByDate = (bookings) => {
        const groupedBookings = {};

        bookings.forEach(booking => {
            const date = new Date(booking.createdAt);
            const dateStr = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groupedBookings[dateStr]) {
                groupedBookings[dateStr] = [];
            }

            groupedBookings[dateStr].push(booking);
        });

        // Sort dates in descending order (most recent first)
        const sortedDates = Object.keys(groupedBookings).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB - dateA;
        });

        return { groupedBookings, sortedDates };
    };

    // Render booking card based on employee position
    const renderBookingCard = (booking) => {
        const assignedVendor = vendors.find(v => v._id === booking.vendorId);

        if (employee.position === 'mechanic') {
            return (
                <AllBookingCard
                    booking={booking}
                    onSaveParts={handleSaveParts}
                />
            );
        } else if (employee.position === 'delivery') {
            return (
                <DeliveryOrderCard
                    order={booking}
                    vendor={assignedVendor}
                />
            );
        }

        return null;
    };

    if (loading) {
        return <div className='flex items-center h-screen w-full justify-center'><CircularLoading size={50} /> </div>
    }

    // Group the filtered bookings
    const { todayBookings, previousBookings } = groupBookingsByDate(filteredBookings);
    const { groupedBookings, sortedDates } = groupPreviousByDate(previousBookings);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className='mb-4'>
                <Heading heading="Recent Orders" />
            </div>

            {/* Filter section */}
            <BookingFilters onFilterChange={handleFilterChange} />

            {/* No bookings state */}
            {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found</p>
                </div>
            )}

            {/* Today's bookings section */}
            {todayBookings.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl font-bold text-blue-600">Today's Orders</h2>
                        <div className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {todayBookings.length}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {todayBookings.map((booking) => (
                            <div key={booking._id} className="w-full">
                                {renderBookingCard(booking)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previous bookings section */}
            {previousBookings.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-600">Previous Orders</h2>
                        <div className="ml-3 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {previousBookings.length}
                        </div>
                    </div>

                    {sortedDates.map(dateStr => (
                        <div key={dateStr} className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-500 mb-3">{dateStr}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {groupedBookings[dateStr].map((booking) => (
                                    <div key={booking._id} className="w-full">
                                        {renderBookingCard(booking)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}