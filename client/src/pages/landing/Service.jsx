// File: Service.jsx
import { motion } from 'framer-motion';
import Navbar from '../../components/ui/NavBar';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Footer from '../../components/landing/Footer';
import { ArrowRight, Wrench, Settings, Gauge, HardDrive, Cog } from 'lucide-react';

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const services = [
    {
        title: 'Servicing',
        description: 'Regular maintenance service to keep your vehicle in optimal condition. Our comprehensive servicing includes fluid checks, filter replacements, and system inspections.',
        icon: <Wrench className="h-8 w-8 text-white" />,
        image: '/images/Engine.jpg'
    },
 
    {
        title: 'Repairing',
        description: 'Professional repair services for all types of vehicle issues. Our trained technicians can diagnose and fix problems with precision and care.',
        icon: <Settings className="h-8 w-8 text-white" />,
        image: '/images/bikerepair.jpg'
    },
    {
        title: 'Drive-In Garage',
        description: 'A car repair is a service provided to fix any issues or damages with your vehicle. Our drive-in facility makes servicing convenient and hassle-free.',
        icon: <Gauge className="h-8 w-8 text-white" />,
        image: '/images/bikemaintenance.jpg'
    },
    {
        title: 'Engine Work',
        description: 'Specialized engine services including diagnostics, tune-ups, and performance optimization to ensure your engine runs smoothly and efficiently.',
        icon: <Gauge className="h-8 w-8 text-white" />,
        image: '/images/bikers_04.jpg'
    },
    {
        title: 'Full Engine Service',
        description: 'Complete engine overhaul and rebuilding services for vehicles requiring major engine work. We restore performance and extend your engine',
        icon: <HardDrive className="h-8 w-8 text-white" />,
        image: '/images/Engine.jpg',
    },
    {
        title: 'Half Engine Service',
        description: 'Partial engine rebuilds and repairs targeting specific engine components. This cost-effective option addresses targeted issues without a full rebuild.',
        icon: <Cog className="h-8 w-8 text-white" />,
        image: '/images/bikerepair.jpg'
    },
];

export default function Services() {
    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <div
                className="relative bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
                <motion.div
                    className="relative z-10 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        Our Services
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Services', href: '/services' },
                            ]}
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* Services Section - Based on the image style */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.h3
                        className="text-3xl text-center font-bold text-primary mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        What We Offer
                    </motion.h3>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
                                variants={fadeIn}
                            >
                                <div className="flex flex-col h-full">
                                    {/* Icon */}
                                    <div className="mb-4">
                                        <div className="bg-primary h-16 w-16 rounded-lg flex items-center justify-center">
                                            {service.icon}
                                        </div>
                                    </div>

                                    {/* Title and Description */}
                                    <h4 className="text-xl font-bold mb-2">{service.title}</h4>
                                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                                        {service.description.substring(0, 60)}...
                                    </p>

                                    {/* Read More Button */}
                                    <div className="mt-auto">
                                        <button className="text-sm text-gray-600 hover:text-primary flex items-center uppercase font-medium">
                                            Read More <ArrowRight className="ml-1 h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Service Images Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="overflow-hidden rounded-lg"
                                variants={fadeIn}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-64 object-cover"
                                    />
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Service Process Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-3xl font-bold text-primary mb-4">Our Service Process</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We follow a structured approach to ensure quality service and customer satisfaction.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {['Diagnosis', 'Cost Estimate', 'Repair Work', 'Quality Check'].map((step, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-6 rounded-lg shadow-md text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-xl font-bold">{index + 1}</span>
                                </div>
                                <h4 className="text-lg font-bold mb-2">{step}</h4>
                                <p className="text-gray-600 text-sm">
                                    {step === 'Diagnosis' && 'We thoroughly inspect your vehicle to identify all issues.'}
                                    {step === 'Cost Estimate' && 'We provide a transparent cost estimate before proceeding.'}
                                    {step === 'Repair Work' && 'Our skilled technicians perform the necessary repairs.'}
                                    {step === 'Quality Check' && 'We ensure all repairs meet our quality standards.'}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-primary">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-3xl font-bold text-white mb-4">Ready to Service Your Vehicle?</h3>
                        <p className="text-white mb-8 max-w-2xl mx-auto">
                            Book an appointment today and experience our professional service.
                        </p>
                        <motion.button
                            className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Book Now
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </>
    );
}