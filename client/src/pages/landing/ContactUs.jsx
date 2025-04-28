import React from 'react'
import NavBar from '../../components/ui/NavBar'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { MapPin, Phone, Mail, Clock, Home } from 'lucide-react'
import ContactForm from '../../components/landing/ContactForm'
import {IconCard} from '../../components/landing/IconCard'
import Footer from '../../components/landing/Footer'

export default function ContactUs() {
    return (
        < >
            <NavBar />


            <div className="min-h-screen">
                {/* Hero Banner with Breadcrumbs */}
                <div className="relative bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
                    <div className="relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Contacts</h2>
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Contact Us', href: '/contact' },
                            ]}
                        />
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                        {/* Phone */}
                        <IconCard
                            icon={<Phone className="text-white" size={24} />}
                            title="Phone"
                            text="0123456789"
                        />

                        {/* Email */}
                        <IconCard
                            icon={<Mail className="text-white" size={24} />}
                            title="Email"
                            text="demo@example.com"
                        />

                        {/* Address */}
                        <IconCard
                            icon={<Home className="text-white" size={24} />}
                            title="Address"
                            text="Your address goes here"
                        />
                        {/* Working hours */}
                        <IconCard
                            icon={<Clock className="text-white" size={24} />}
                            title="Opening Hours"
                            text="Mon - Fri: 9:00 AM - 5:00 PM"

                        />
                    </div>
                </div>

                {/* Contact Form and Info */}
                <div >
                    <ContactForm />
                </div>

                {/* Map Section */}
                <div className=" mx-auto">
                
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
                </div>
            </div>

            <Footer />
        </>
    )
}
