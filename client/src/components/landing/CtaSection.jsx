import React from 'react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";

const MotionLink = motion(Link);
export default function CTASection() {
    return (
        <section className="relative bg-white text-center py-20 px-6 overflow-hidden">
            {/* Gradient Shapes */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-yellow-400 to-puyellow rple-600 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

            <motion.div
                className="relative z-10 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
            >
                <p className="text-sm font-medium text-yellow-600 bg-yellow-100 inline-block px-3 py-1 rounded-full mb-4">
                    Doorstep Bike Repairs
                </p>

                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                    Need Instant Bike Service at Your Doorstep?
                </h2>

                <p className="text-gray-600 text-lg md:text-xl mb-8">
                    Book a mechanic now and experience quick, reliable, and affordable two-wheeler repair!
                </p>

                <MotionLink
                    to="/user-order-booking"
                    className="bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-secondary transition duration-300 inline-block shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Book Now
                </MotionLink>
            </motion.div>
        </section>
    );
}
