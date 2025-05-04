import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutSection() {
    return (
        <section className="relative py-12 md:py-20 bg-white px-4 md:px-8 lg:px-16 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left: Image Stack with Gears - Responsive */}
                <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] order-2 lg:order-1">
                    {/* Background Gear SVG */}
                    <div className="absolute left-0 top-0 opacity-10 w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M97.6,55.7V44.3l-13.2-2.4c-0.8-2.7-1.8-5.3-3.1-7.7l7.7-11.1L79.1,13.2L68,20.9c-2.4-1.3-5-2.3-7.7-3.1L57.9,4.6H44.3l-2.4,13.2c-2.7,0.8-5.3,1.8-7.7,3.1L23.1,13.2L13.2,23.1l7.7,11.1c-1.3,2.4-2.3,5-3.1,7.7L4.6,44.3v13.4l13.2,2.4c0.8,2.7,1.8,5.3,3.1,7.7l-7.7,11.1l9.9,9.9l11.1-7.7c2.4,1.3,5,2.3,7.7,3.1l2.4,13.2h13.4l2.4-13.2c2.7-0.8,5.3-1.8,7.7-3.1l11.1,7.7l9.9-9.9L81,67.8c1.3-2.4,2.3-5,3.1-7.7L97.6,55.7z M51.1,73.6c-12.1,0-22-9.9-22-22c0-12.1,9.9-22,22-22c12.1,0,22,9.9,22,22C73.1,63.8,63.3,73.6,51.1,73.6z" />
                        </svg>
                    </div>

                    {/* Top background rectangle - responsive */}
                    <div className="absolute top-0 left-0 w-full sm:w-3/4 md:w-64 h-48 sm:h-56 md:h-64 bg-yellow-50 rounded" />

                    {/* Main top image (mechanic working) - responsive */}
                    <motion.div
                        className="relative z-10 ml-4 sm:ml-6 md:ml-8 mt-4 sm:mt-6 md:mt-8 max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:mx-0"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <img
                            src='/images/pic9.jpeg'
                            alt="Mechanic Working"
                            className="rounded shadow-lg w-full h-40 sm:h-48 md:h-60 object-cover"
                        />
                    </motion.div>

                    {/* Bottom background rectangle - responsive */}
                    <div className="absolute bottom-0 right-0 sm:right-6 md:right-12 w-full sm:w-3/4 md:w-64 h-48 sm:h-56 md:h-64 bg-yellow-50 rounded" />

                    {/* Bottom image - responsive */}
                    <motion.div
                        className="relative z-10 mr-4 sm:mr-6 md:mr-12 lg:mr-24 mt-4 sm:mt-6 md:mt-6 max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:mx-0"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <img
                            src='/images/pic7.jpeg'
                            alt="Bike"
                            className="rounded shadow-lg w-full h-40 sm:h-48 md:h-56 object-cover"
                        />
                    </motion.div>
                </div>

                {/* Right: Text Content - Responsive */}
                <motion.div
                    className="order-1 lg:order-2"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    {/* Red line and Know About Us text */}
                    <div className="flex items-center mb-4">
                        <div className="w-6 md:w-8 h-0.5 bg-primary mr-2 md:mr-3"></div>
                        <p className="text-xs sm:text-sm uppercase tracking-wide text-primary font-semibold">
                            KNOW ABOUT US
                        </p>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                        Where Expertise Meets<br className="hidden sm:block" /> Every Engine
                    </h2>

                    {/* Description text */}
                    <p className="text-sm sm:text-base text-gray-700 mb-6 md:mb-8">
                        Et purus duis sollicitudin dignissim habitant. Egestas nulla quis venenatis
                        cras sed eu massa eu faucibus. Urna fusce
                    </p>

                    {/* Bullet points - responsive */}
                    <ul className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 sm:mb-8 md:mb-10">
                        {[
                            'Professional Bike Repair Services',
                            'A Bike repair is a service provided to fix',
                            'Get Your Bike Fixed Right Away Bike Repair',
                            'Quick and Efficient Bike Repairs',
                        ].map((point, idx) => (
                            <li key={idx} className="flex items-center text-gray-800 text-sm sm:text-base">
                                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white mr-3 sm:mr-4 flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                </span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Read More button - responsive */}
                    <div className="flex items-center">
                        <motion.a
                            href="#"
                            className="bg-primary hover:bg-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded inline-flex items-center text-xs sm:text-sm font-medium transition"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            READ MORE
                            <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}