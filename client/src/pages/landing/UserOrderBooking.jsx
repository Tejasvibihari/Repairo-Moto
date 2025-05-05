import React from 'react'
import NavBar from '../../components/ui/NavBar'
import Footer from '../../components/landing/Footer'
import UserBookingForm from '../../components/UserBookingForm'
import { motion } from "framer-motion";
import Breadcrumbs from '../../components/ui/Breadcrumbs';

export default function UserOrderBooking() {
    return (
        <>
            <NavBar />
            <motion.div
                className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Booking Form</h2>
                    <Breadcrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Booking' },
                        ]}
                    />
                </div>
            </motion.div>
            <div className='p-5 md:w-7xl mx-auto'>
                <UserBookingForm />
            </div>
            <Footer />
        </>
    )
}
