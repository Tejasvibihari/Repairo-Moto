import React from 'react';
import { motion } from 'framer-motion';
import Bike from './Bike';

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
                    Affordable, reliable, and fast bike repair services delivered right where you are. Download our app and get your two-wheeler running in no time!
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    {/* Google Play Button */}
                    <a
                        href="https://play.google.com/store/apps/details?id=com.repairomoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                        aria-label="Download on Google Play"
                    >
                        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.18 23.76c.37.2.8.23 1.2.08l12.15-7.02-2.72-2.73L3.18 23.76z" fill="#EA4335" />
                            <path d="M20.82 10.18L17.6 8.34l-3.06 3.06 3.06 3.06 3.24-1.86c.92-.53.92-1.89-.02-2.42z" fill="#FBBC05" />
                            <path d="M4.38.24C3.98.09 3.55.12 3.18.32L13.81 11 16.53 8.28 4.38.24z" fill="#4285F4" />
                            <path d="M3.18.32C2.46.73 2 1.5 2 2.4v19.2c0 .9.46 1.67 1.18 2.08L13.82 13 3.18.32z" fill="#34A853" />
                        </svg>
                        <div className="flex flex-col leading-tight">
                            <span className="text-xs text-gray-500">GET IT ON</span>
                            <span className="text-sm font-bold">Google Play</span>
                        </div>
                    </a>

                    {/* App Store Button */}
                    {/* <a
                        href="https://apps.apple.com/app/repairomoto"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                        aria-label="Download on App Store"
                    >
                        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="black" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <div className="flex flex-col leading-tight">
                            <span className="text-xs text-gray-500">DOWNLOAD ON THE</span>
                            <span className="text-sm font-bold">App Store</span>
                        </div>
                    </a> */}
                </motion.div>

                <motion.p
                    className="text-sm text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    ⭐⭐⭐⭐⭐ &nbsp;4.8/5 from 2,000+ happy customers
                </motion.p>
            </div>

            <div className="hidden md:flex items-center justify-center" aria-hidden="true">
                <Bike />
            </div>
        </section>
    );
}