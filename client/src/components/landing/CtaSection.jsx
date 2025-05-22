import React from 'react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";

const MotionLink = motion(Link);

export default function CTASection() {
    return (
        <section
            className="relative bg-white text-center py-20 px-6 overflow-hidden"
            aria-labelledby="cta-title"
        >
            {/* Gradient Shapes - purely decorative */}
            <div
                className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"
                aria-hidden="true"
            />
            <div
                className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3"
                aria-hidden="true"
            />

            <motion.div
                className="relative z-10 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
            >
                <header>
                    <p className="text-sm font-medium text-yellow-600 bg-yellow-100 inline-block px-3 py-1 rounded-full mb-4">
                        Doorstep Bike Repairs
                    </p>

                    <h2 id="cta-title" className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Need Instant Bike Service at Your Doorstep?
                    </h2>
                </header>

                <p className="text-gray-600 text-lg md:text-xl mb-8">
                    Book a certified mechanic now and experience fast, affordable two-wheeler service at your convenience!
                </p>

                <MotionLink
                    to="/user-order-booking"
                    className="bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-secondary transition duration-300 inline-block shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Book a bike repair appointment now"
                >
                    Book Your Repair Appointment
                </MotionLink>
            </motion.div>
        </section>
    );
}
