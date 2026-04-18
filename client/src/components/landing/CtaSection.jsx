import React from 'react';
import { motion } from 'framer-motion';

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
                        Get Instant Bike Service — Right From Your Phone
                    </h2>
                </header>

                <p className="text-gray-600 text-lg md:text-xl mb-8">
                    Download the Repairomoto app and book a certified mechanic in seconds. Fast, affordable, and at your doorstep.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                        href="https://play.google.com/store/apps/details?id=com.repairomoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-gray-900 text-white px-7 py-3.5 rounded-full shadow-lg hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Download on Google Play"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none">
                            <path d="M3.18 23.76c.37.2.8.23 1.2.08l12.15-7.02-2.72-2.73L3.18 23.76z" fill="#EA4335" />
                            <path d="M20.82 10.18L17.6 8.34l-3.06 3.06 3.06 3.06 3.24-1.86c.92-.53.92-1.89-.02-2.42z" fill="#FBBC05" />
                            <path d="M4.38.24C3.98.09 3.55.12 3.18.32L13.81 11 16.53 8.28 4.38.24z" fill="#4285F4" />
                            <path d="M3.18.32C2.46.73 2 1.5 2 2.4v19.2c0 .9.46 1.67 1.18 2.08L13.82 13 3.18.32z" fill="#34A853" />
                        </svg>
                        Google Play
                    </motion.a>

                    {/* <motion.a
                        href="https://apps.apple.com/app/repairomoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-gray-900 text-white px-7 py-3.5 rounded-full shadow-lg hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Download on App Store"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="white">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        App Store
                    </motion.a> */}
                </div>
            </motion.div>
        </section>
    );
}