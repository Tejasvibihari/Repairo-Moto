import React from 'react'
import NavBar from '../../components/ui/NavBar'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { MapPin, Phone, Mail, Clock, } from 'lucide-react'
import ContactForm from '../../components/landing/ContactForm'

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

                <div className="container mx-auto px-4 py-12 mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Address Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-b-2 border-primary hover:shadow-lg transition-all">
                            <div className="flex items-center justify-center w-14 h-14 rounded bg-primary mb-4">
                                <MapPin className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Address</h3>
                            <p className="text-gray-700">
                                6391 Celina, Delaware <br />
                                Mirpur, Bangladesh
                            </p>
                        </div>

                        {/* Phone Number Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-b-2 border-primary hover:shadow-lg transition-all">
                            <div className="flex items-center justify-center w-14 h-14 rounded bg-primary mb-4">
                                <Phone className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Phone Number</h3>
                            <p className="text-gray-700">
                                (629) 555-0129 <br />
                                01254693326
                            </p>
                        </div>

                        {/* Opening Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-b-2 border-primary hover:shadow-lg transition-all">
                            <div className="flex items-center justify-center w-14 h-14 rounded bg-primary mb-4">
                                <Clock className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Opening</h3>
                            <p className="text-gray-700">
                                Sun - 10AM to 5PM <br />
                                Thurs - 9AM to 8PM
                            </p>
                        </div>

                        {/* E-mail Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-b-2 border-primary hover:shadow-lg transition-all">
                            <div className="flex items-center justify-center w-14 h-14 rounded bg-primary mb-4">
                                <Mail className="text-white" size={28} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">E-mail</h3>
                            <p className="text-gray-700">
                                michael.mitc@example.com <br />
                                nafiz0121@gmail.com
                            </p>
                        </div>

                    </div>
                </div>

                {/* Contact Form and Info */}
                <div >
                   <ContactForm />
                </div>

                {/* Map Section */}
                <div className=" mx-auto p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary"></h3>
                    <div className="rounded-lg overflow-hidden shadow-lg">
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
        </>
    )
}
