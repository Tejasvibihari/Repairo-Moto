import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutSection() {
    return (
        <section
            id="about-us"
            className="relative py-12 md:py-20 bg-white px-4 md:px-8 lg:px-16 overflow-hidden"
            aria-labelledby="about-heading"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left: Image Stack */}
                <div
                    className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] order-2 lg:order-1"
                    aria-hidden="true"
                >
                    <div className="absolute left-0 top-0 opacity-10 w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48">
                        {/* Decorative SVG */}
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path d="M97.6,55.7V44.3l-13.2-2.4..." />
                        </svg>
                    </div>

                    <div className="absolute top-0 left-0 w-full sm:w-3/4 md:w-64 h-48 sm:h-56 md:h-64 bg-yellow-50 rounded" />

                    <motion.div
                        className="relative z-10 ml-4 sm:ml-6 md:ml-8 mt-4 sm:mt-6 md:mt-8 max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:mx-0"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/images/pic9.jpeg"
                            alt="Mechanic working on a two-wheeler"
                            className="rounded shadow-lg w-full h-40 sm:h-48 md:h-60 object-cover"
                            loading="lazy"
                        />
                    </motion.div>

                    <div className="absolute bottom-0 right-0 sm:right-6 md:right-12 w-full sm:w-3/4 md:w-64 h-48 sm:h-56 md:h-64 bg-yellow-50 rounded" />

                    <motion.div
                        className="relative z-10 mr-4 sm:mr-6 md:mr-12 lg:mr-24 mt-4 sm:mt-6 md:mt-6 max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:mx-0"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/images/pic7.jpeg"
                            alt="Two-wheeler ready after repair"
                            className="rounded shadow-lg w-full h-40 sm:h-48 md:h-56 object-cover"
                            loading="lazy"
                        />
                    </motion.div>
                </div>

                {/* Right: Content */}
                <motion.div
                    className="order-1 lg:order-2"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center mb-4">
                        <div className="w-6 md:w-8 h-0.5 bg-primary mr-2 md:mr-3"></div>
                        <p className="text-xs sm:text-sm uppercase tracking-wide text-primary font-semibold">
                            KNOW ABOUT US
                        </p>
                    </div>

                    <h2
                        id="about-heading"
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight"
                    >
                        Where Expertise Meets<br className="hidden sm:block" /> Every Engine
                    </h2>

                    <p className="text-sm sm:text-base text-gray-700 mb-6 md:mb-8">
                        <strong>Repairo Moto</strong> is your trusted partner for two-wheeler maintenance and repairs.
                        We bring professional bike service directly to your doorstep—saving you time, hassle, and unnecessary trips to the garage.
                        From routine servicing to emergency fixes, our experienced mechanics are ready when you need them.
                    </p>

                    <ul className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 sm:mb-8 md:mb-10">
                        {[
                            'Professional Bike Repair Services',
                            'Reliable repairs to keep your two-wheeler in peak condition',
                            'Emergency bike repair available with fast turnaround',
                            'Quick and efficient doorstep servicing',
                        ].map((point, idx) => (
                            <li key={idx} className="flex items-center text-gray-800 text-sm sm:text-base">
                                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black text-white mr-3 sm:mr-4 flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                </span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center">
                        <motion.a
                            href="/about"
                            className="bg-primary hover:bg-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded inline-flex items-center text-xs sm:text-sm font-medium transition"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            aria-label="Read more about Repairo Moto"
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
