import React from 'react'
import NavBar from '../../components/ui/NavBar'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { MapPin, Phone, Mail, Clock, Home } from 'lucide-react'
import ContactForm from '../../components/landing/ContactForm'
import { IconCard } from '../../components/landing/IconCard'
import Footer from '../../components/landing/Footer'
import { motion } from 'framer-motion'

export default function ContactUs() {
    return (
        <>
            <NavBar />

            <div className="min-h-screen">
                {/* Hero Banner with Breadcrumbs */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
                    <div className="relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h2>
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Contact Us', href: '/contact' },
                            ]}
                        />
                    </div>
                </motion.div>

                {/* Contact Information Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="container mx-auto px-4 py-12"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        <IconCard
                            icon={<Phone className="text-white" size={24} />}
                            title="Phone"
                            text="+91 9229207021"
                        />
                        <IconCard
                            icon={<Mail className="text-white" size={24} />}
                            title="Email"
                            text="Contact@repairomoto.in"
                        />
                        <IconCard
                            icon={<Home className="text-white" size={24} />}
                            title="Address"
                            text="5c/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 13"
                        />
                        <IconCard
                            icon={<Clock className="text-white" size={24} />}
                            title="Opening Hours"
                            text="Mon - Fri: 9:00 AM - 5:00 PM"
                        />
                    </div>
                </motion.div>

                {/* Contact Form  */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <ContactForm />
                </motion.div>

                {/* Map Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="mx-auto"
                >
                    <div className="rounded-sm overflow-hidden shadow-lg">
                        <iframe
                            src="https://www.google.com/maps/embed?...your-map-link..."
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Location Map"
                        ></iframe>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </>
    )
}
