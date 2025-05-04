// File: Service.jsx
import { motion } from 'framer-motion';
import Navbar from '../../components/ui/NavBar';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Footer from '../../components/landing/Footer';
import { ArrowRight, Wrench, Settings, Gauge, HardDrive, Cog, CheckCircle, Cpu } from 'lucide-react';
import ServiceCards from '../../components/landing/ServiseCard';



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


            {/* Specialized Service Highlights Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-3xl font-bold text-primary mb-4">Our Specialized Services</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We offer comprehensive automotive services with expert technicians and quality parts
                        </p>
                    </motion.div>

                    <ServiceCards />
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



            {/* Engine Services Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-3xl font-bold text-primary mb-4">Engine Services</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            From minor tune-ups to complete rebuilds, our engine specialists have you covered
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Engine Work",
                                description: "Diagnostics and repairs for all types of engine issues"
                            },
                            {
                                title: "Full Engine Service",
                                description: "Complete engine overhaul and rebuilding services"
                            },
                            {
                                title: "Half Engine Service",
                                description: "Targeted repairs for specific engine components"
                            }
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-lg shadow-lg overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="bg-primary h-2 w-full"></div>
                                <div className="p-6">
                                    <h4 className="text-xl font-bold mb-3">{service.title}</h4>
                                    <p className="text-gray-600 text-sm mb-5">{service.description}</p>
                                    <a href="#" className="text-xs font-bold text-gray-700 hover:text-primary tracking-wider uppercase flex items-center">
                                        LEARN MORE <ArrowRight className="ml-1 h-3 w-3" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="relative bg-white text-center py-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-yellow-400 to-puyellow rple-600 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

                <div className="container mx-auto px-4">
                    <motion.div
                        className="relative z-10 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-sm font-medium text-yellow-600 bg-yellow-100 inline-block px-3 py-1 rounded-full mb-4">Ready to Service Your Vehicle?</h3>

                        <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Book an appointment today and experience our professional service.
                        </p>
                        <motion.a
                            href="/contact"
                            className="bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-secondary transition duration-300 inline-block shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Book Now
                        </motion.a>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </>
    );
}