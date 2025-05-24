import React from 'react'
import NavBar from '../../components/ui/NavBar'
import { motion } from "framer-motion";
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import BikeProfileForm from '../../components/BikeProfileForm';

export default function AddBikeProfile() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Add Bike Profile</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Add Bike Profile' },
                        ]}
                    />
                </div>
            </motion.div>
            <div>
                <BikeProfileForm />
            </div>
        </>
    )
}
