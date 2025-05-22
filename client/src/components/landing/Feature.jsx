import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Warehouse, Bike } from 'lucide-react';

const services = [
    {
        icon: <Wrench className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Auto Fixers',
        description: 'Comprehensive bike repair services for all kinds of two-wheelers, handled by trained professionals.',
        image: '/images/pic1.jpeg',
        slug: 'auto-fixers',
    },
    {
        icon: <Bike className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Mechanic Masters',
        description: 'Expert mechanical solutions to keep your bike performing at its peak efficiency.',
        image: '/images/pic3.jpeg',
        slug: 'mechanic-masters',
    },
    {
        icon: <Warehouse className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Drive-In Garage',
        description: 'Modern bike garages with complete diagnostic tools and repair facilities.',
        image: '/images/pic16.jpeg',
        slug: 'drive-in-garage',
    },
];

export default function Feature() {
    return (
        <section className="bg-gray-50 py-16 px-6 md:px-20" aria-labelledby="feature-heading">
            {/* Header */}
            <header className="text-center mb-12">
                <div className="flex items-center justify-center">
                    <div className="w-6 md:w-8 h-0.5 bg-primary mr-2 md:mr-3"></div>
                    <p className="text-primary uppercase tracking-widest font-semibold text-sm mb-2">
                        Latest Service
                    </p>
                </div>

                <h2 id="feature-heading" className="text-3xl md:text-5xl font-bold text-gray-900">
                    Professional Bike Repairs <br /> Backed by the Best Services
                </h2>
            </header>

            {/* Service Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {services.map((service, idx) => (
                    <motion.article
                        key={idx}
                        className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition"
                        whileHover={{ y: -5 }}
                        aria-label={service.title}
                    >
                        <div className="p-6 flex-1">
                            <div className="mb-4">{service.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                            <a
                                href="#"
                                className="text-sm text-black font-medium inline-flex items-center hover:underline group"
                                aria-label={`Read more about ${service.title}`}
                            >
                                READ MORE
                                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                        <img
                            src={service.image}
                            alt={`${service.title} - professional bike repair service`}
                            className="h-48 w-full object-cover"
                            loading="lazy"
                        />
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
