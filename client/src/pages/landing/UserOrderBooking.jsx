import React from 'react'
import NavBar from '../../components/ui/NavBar'
import Footer from '../../components/landing/Footer'
import UserBookingForm from '../../components/UserBookingForm'

export default function UserOrderBooking() {
    return (
        <>
            <NavBar />
            <div className='p-5 md:w-7xl mx-auto'>
                <UserBookingForm />
            </div>
            <Footer />
        </>
    )
}
