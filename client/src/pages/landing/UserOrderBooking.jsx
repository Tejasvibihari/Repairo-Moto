import React from 'react'
import ManualBookingForm from '../../components/ManualBookingForm'
import NavBar from '../../components/ui/NavBar'
import Footer from '../../components/landing/Footer'

export default function UserOrderBooking() {
    return (
        <>
            <NavBar />
            <div className='p-5 md:w-7xl mx-auto'>
                <ManualBookingForm />
            </div>
            <Footer />
        </>
    )
}
