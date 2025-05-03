'use client';

import { motion } from 'framer-motion';
import { Calendar, UserCheck, ShoppingCart, Wrench, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: <Calendar className="h-6 w-6" />,
        title: "Booking Done",
        desc: "Schedule your service quickly",
        color: "bg-blue-500"
    },
    {
        icon: <UserCheck className="h-6 w-6" />,
        title: "Mechanic Assigned",
        desc: "We assign an expert technician",
        color: "bg-purple-500"
    },
    {
        icon: <ShoppingCart className="h-6 w-6" />,
        title: "Parts Order",
        desc: "Genuine parts are arranged",
        color: "bg-yellow-500"
    },
    {
        icon: <Wrench className="h-6 w-6" />,
        title: "Repair",
        desc: "Bike is repaired with care",
        color: "bg-red-500"
    },
    {
        icon: <CheckCircle className="h-6 w-6" />,
        title: "Done 👍",
        desc: "Ready to ride again",
        color: "bg-green-500"
    }
];

export default function HowItWorksCurved() {
    return (
        <section className="relative py-20 bg-white overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">How It Works</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Our streamlined bike service process.
                </p>
            </div>

            <div className="relative w-full max-w-7xl mx-auto px-4">
                {/* Curved Line */}
                <svg
                    className="absolute top-16 left-0 w-full h-40 pointer-events-none"
                    viewBox="0 0 1000 100"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M 0 50 Q 250 0 500 50 T 1000 50"
                        stroke="#D1D5DB"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>

                <div className="flex justify-between items-end relative z-10">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center w-1/5"
                        >
                            <div className={`rounded-full ${step.color} h-14 w-14 flex items-center justify-center text-white shadow-lg mb-4`}>
                                {step.icon}
                            </div>
                            <h4 className="text-md font-semibold text-gray-800">{step.title}</h4>
                            <p className="text-sm text-gray-500">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
