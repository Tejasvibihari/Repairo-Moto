import React from 'react'
import NavBar from '../../components/ui/NavBar'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactUs() {
    return (
        < >
            <NavBar />


            <div className="min-h-screen">
                {/* Hero Banner with Breadcrumbs */}
                <div className="relative bg-cover bg-center bg-no-repeat h-64 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/bike-repair-image.png')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-0" />
                    <div className="relative z-10 text-center px-4">
                        <h2 className="text-4xl md:text-5xl font-bold mb-2">Contacts</h2>
                        <div className="flex justify-center">
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="flex items-center space-x-1 md:space-x-3">
                                    <li className="inline-flex items-center">
                                        <a href="/" className="text-sm text-gray-200 hover:text-white">Home</a>
                                    </li>
                                    <li>
                                        <div className="flex items-center">
                                            <span className="mx-1 text-gray-200">/</span>
                                            <span className="text-sm text-gray-200">Contact</span>
                                        </div>
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Contact Form and Info */}
                <div className="grid md:grid-cols-2 gap-8 px-4 md:px-8 lg:px-16 py-12 w-full mx-auto ">
                    {/* Left - Form */}
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                        <h3 className="text-3xl font-bold mb-2" style={{ color: '#e2a731' }}>Get In Touch!</h3>
                        <p className="text-gray-600 mb-6">Got any questions? Send us a message.</p>

                        <form className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full border border-gray-300 p-3 rounded outline-none focus:ring-1 focus:ring-opacity-50"
                                    style={{ focusRing: '#e2a731' }}
                                />
                                <input
                                    type="email"
                                    placeholder="address@youremail.com"
                                    className="w-full border border-gray-300 p-3 rounded outline-none focus:ring-1 focus:ring-opacity-50"
                                    style={{ focusRing: '#e2a731' }}
                                />
                            </div>
                            <textarea
                                rows={8}
                                placeholder="Your Question"
                                className="w-full border border-gray-300 p-3 rounded outline-none focus:ring-1 focus:ring-opacity-50"
                                style={{ focusRing: '#e2a731' }}
                            ></textarea>
                            <div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 text-white font-medium rounded transition-all duration-200 hover:bg-opacity-90 hover:shadow-md"
                                    style={{ backgroundColor: '#e2a731' }}
                                >
                                    Contact
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right - Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <MapPin style={{ color: '#e2a731' }} size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1">Post Address</h4>
                                    <p className="text-gray-700">123 Main Street, City, State, Zip Code</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Phone style={{ color: '#e2a731' }} size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1">Contact Phone</h4>
                                    <p className="text-gray-700">+1-909-123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Mail style={{ color: '#e2a731' }} size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1">E-mail Address</h4>
                                    <p className="text-gray-700">office@emaildomain.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Clock style={{ color: '#e2a731' }} size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-1">Opening Hours</h4>
                                    <p className="text-gray-700">Mon-Fri: 9:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optional: Map Section */}
                <div className="w-full ">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pb-12">

                        <h3 className="text-2xl font-bold mb-6" style={{ color: '#e2a731' }}>Find Us</h3>

                        {/* Map placeholder */}
                        <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345.67890!2d-73.9878584!3d40.7411509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMCcyOC4xIk4gNzPCsDU5JzE2LjMiVw!5e0!3m2!1sen!2sus!4v1619485896257!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Our Location"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
