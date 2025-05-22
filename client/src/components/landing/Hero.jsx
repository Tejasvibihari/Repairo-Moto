import React from 'react';
import { motion } from 'framer-motion';
import Bike from './Bike';
import { Link } from "react-router-dom";

const MotionLink = motion(Link);

export default function Hero() {
    return (
        <section
            className='grid grid-cols-1 md:grid-cols-2 hero h-screen bg-gradient-to-r from-black to-gray-900 text-white'
            aria-label="Hero section - Bike Repair Service"
        >
            <div className='flex flex-col space-y-6 items-start p-6 md:p-10 my-10 md:my-20 justify-center'>
                <motion.h1
                    className='text-4xl md:text-6xl font-bold text-primary'
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    Hassle-Free Bike Repairs at Your Doorstep
                </motion.h1>

                <motion.p
                    className='text-lg md:text-xl text-gray-300'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Affordable, reliable, and fast bike repair services delivered right where you are. Book now and get your two-wheeler running in no time!
                </motion.p>

                <MotionLink
                    to="/user-order-booking"
                    className='mt-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:bg-primary/90 transition'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Book a bike mechanic"
                >
                    Book a Mechanic Now
                </MotionLink>
            </div>

            <div className="hidden md:flex items-center justify-center" aria-hidden="true">
                {/* Ensure Bike component contains accessible SVG or <img alt="Bike Repair Illustration" /> */}
                <Bike />
            </div>
        </section>
    );
}
