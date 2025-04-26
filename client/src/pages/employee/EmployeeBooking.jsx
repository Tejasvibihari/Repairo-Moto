import React, { useState, useEffect } from 'react'
import AllBookingCard from '../../components/empolyee/AllBookingCard'
import axiosClient from '../../service/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import CircularLoading from '../../components/ui/CircularLoading';


export default function EmployeeBooking() {
    const employee = useSelector((state) => state.employeeAuth.employee)
    console.log(employee.id);
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    // Sample booking data - replace with your actual data source

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

            console.log('Parts updated successfully');
        } catch (error) {
            console.error('Error updating parts:', error);
        }
    };


    useEffect(() => {

        const getAllBookingByEmpId = async () => {
            try {
                setLoading(true); // Set loading state to true
                const response = await axiosClient.get(`/api/admin/order/getorder/${employee.id}`); // Use the employee's _id
                if (response.status === 200) {
                    console.log("Bookings fetched successfully:", response);
                    setBookings(response.data.data); // Update the bookings state with the fetched data
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

    if (loading) {
        return <div className='flex items-center h-screen w-full justify-center'><CircularLoading size={50} /> </div>
    }
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Employee Bookings</h1>

            {/* Responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map(booking => (
                    <div key={booking.id} className="w-full">
                        <AllBookingCard
                            key={booking._id}
                            booking={booking}
                            onSaveParts={handleSaveParts}
                        />
                    </div>
                ))}
            </div>

            {/* No bookings state */}
            {bookings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No bookings found</p>
                </div>
            )}
        </div>
    )
}