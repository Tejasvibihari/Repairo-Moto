'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, UserCheck, ShoppingCart, Wrench, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: <Calendar className="h-6 w-6" aria-hidden="true" />,
        title: "Booking Done",
        desc: "Schedule your service quickly",
        color: "bg-blue-500"
    },
    {
        icon: <UserCheck className="h-6 w-6" aria-hidden="true" />,
        title: "Mechanic Assigned",
        desc: "We assign an expert technician",
        color: "bg-purple-500"
    },
    {
        icon: <ShoppingCart className="h-6 w-6" aria-hidden="true" />,
        title: "Parts Order",
        desc: "Genuine parts are arranged",
        color: "bg-yellow-500"
    },
    {
        icon: <Wrench className="h-6 w-6" aria-hidden="true" />,
        title: "Repair",
        desc: "Bike is repaired with care",
        color: "bg-red-500"
    },
    {
        icon: <CheckCircle className="h-6 w-6" aria-hidden="true" />,
        title: "Done 👍",
        desc: "Ready to ride again",
        color: "bg-green-500"
    }
];

export default function HowItWorksCurved() {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
        setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    return (
        <section className="relative py-12 md:py-20 bg-white overflow-hidden" aria-labelledby="how-it-works">
            <div className="text-center mb-10 md:mb-12 px-4">
                <h2 id="how-it-works" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    How It Works
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
                    Our streamlined bike service process.
                </p>
            </div>

            {/* Desktop & Tablet View */}
            <div className="hidden sm:block relative w-full max-w-7xl mx-auto px-4" role="list" aria-label="Service steps">
                <svg
                    className="absolute top-16 left-0 w-full h-40 pointer-events-none"
                    viewBox="0 0 1000 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        d="M 0 50 Q 250 0 500 50 T 1000 50"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>

                <div className="flex justify-between items-start relative z-10">
                    {steps.map((step, i) => (
                        <motion.article
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className={`flex flex-col items-center text-center ${isTablet ? 'w-1/5 px-1' : 'w-1/5'}`}
                            role="listitem"
                            aria-label={`${step.title} - ${step.desc}`}
                        >
                            <div className={`rounded-full ${step.color} h-12 w-12 md:h-14 md:w-14 flex items-center justify-center text-white shadow-lg mb-3 md:mb-4`}>
                                {step.icon}
                            </div>
                            <h3 className="text-sm md:text-md font-semibold text-gray-800">{step.title}</h3>
                            <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">{step.desc}</p>
                        </motion.article>
                    ))}
                </div>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden w-full max-w-lg mx-auto px-6">
                <div className="relative">
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200" aria-hidden="true"></div>

                    {steps.map((step, i) => (
                        <motion.article
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="flex items-start mb-12 relative"
                            role="listitem"
                            aria-label={`${step.title} - ${step.desc}`}
                        >
                            <div className={`rounded-full ${step.color} h-12 w-12 flex items-center justify-center text-white shadow-lg z-10 shrink-0`}>
                                {step.icon}
                            </div>
                            <div className="ml-4 pt-1">
                                <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
