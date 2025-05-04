import React from 'react';
import { motion } from 'framer-motion';

export default function CTASection() {
    return (
        <section className="bg-primary text-white py-16 px-4 text-center overflow-hidden">
            <motion.div
                className="max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
            >
                <motion.h2
                    className="text-3xl md:text-4xl font-bold mb-4"
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Need Instant Bike Service at Your Doorstep?
                </motion.h2>

                <motion.p
                    className="text-lg md:text-xl mb-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Book a mechanic now and experience quick, reliable, and affordable two-wheeler repair!
                </motion.p>

                <motion.a
                    href="/contact"
                    className="bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition duration-300 inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    Book Now
                </motion.a>
            </motion.div>
        </section>
    );
}
