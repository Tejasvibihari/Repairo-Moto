import {
    ContactRound, House, Store, Wrench,
    Facebook, Instagram, Twitter,
    Phone, Mail, MapPin, ShieldUser, PersonStanding
} from 'lucide-react';
import { Link } from "react-router-dom";
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-secondary text-white pt-16 pb-8" aria-label="Website Footer">
            <div className="max-w-7xl mx-auto px-6">

                {/* App Download Banner inside Footer */}
                <div className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-primary font-semibold text-sm mb-1 uppercase tracking-wider">📱 Now Available on Mobile</p>
                        <h3 className="text-white text-2xl font-bold">Book repairs on the go with our app</h3>
                        <p className="text-gray-400 text-sm mt-1">All booking & tracking features have moved to the Repairomoto app.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                        <a
                            href="https://play.google.com/store/apps/details?id=com.repairomoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 bg-white text-black px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                            aria-label="Download on Google Play"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none">
                                <path d="M3.18 23.76c.37.2.8.23 1.2.08l12.15-7.02-2.72-2.73L3.18 23.76z" fill="#EA4335" />
                                <path d="M20.82 10.18L17.6 8.34l-3.06 3.06 3.06 3.06 3.24-1.86c.92-.53.92-1.89-.02-2.42z" fill="#FBBC05" />
                                <path d="M4.38.24C3.98.09 3.55.12 3.18.32L13.81 11 16.53 8.28 4.38.24z" fill="#4285F4" />
                                <path d="M3.18.32C2.46.73 2 1.5 2 2.4v19.2c0 .9.46 1.67 1.18 2.08L13.82 13 3.18.32z" fill="#34A853" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs text-gray-500">GET IT ON</span>
                                <span className="text-sm font-bold">Google Play</span>
                            </div>
                        </a>
                        {/* <a
                            href="https://apps.apple.com/app/repairomoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 bg-white text-black px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                            aria-label="Download on App Store"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="black">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs text-gray-500">DOWNLOAD ON THE</span>
                                <span className="text-sm font-bold">App Store</span>
                            </div>
                        </a> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Logo & About */}
                    <section>
                        <img src="/logo/logo72.png" alt="Repairo Moto Logo" className="w-36 mb-4" />
                        <p className="text-gray-400 text-sm mb-6">
                            We provide professional bike and scooter repair services in Patna with expert mechanics and modern garages.
                        </p>
                        <nav aria-label="Social Media Links" className="flex space-x-5">
                            <a href="https://x.com/Repairomoto" aria-label="Twitter" title="Twitter" className="hover:text-primary hover:scale-110 transition-all duration-300">
                                <Twitter size={20} />
                            </a>
                            <a href="https://www.facebook.com/share/1D4UWBzREr/" aria-label="Facebook" title="Facebook" className="hover:text-primary hover:scale-110 transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="https://www.instagram.com/repairomoto" aria-label="Instagram" title="Instagram" className="hover:text-primary hover:scale-110 transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                        </nav>
                    </section>

                    {/* Navigation Links */}
                    <nav aria-label="Important Pages">
                        <h2 className="text-xl font-bold text-primary mb-6 border-l-4 border-primary pl-3">Important Links</h2>
                        <ul className="space-y-4 text-gray-300">
                            <li><Link to="/" title="Go to Home" className="flex items-center hover:text-primary"><House className="mr-3" size={20} /> Home</Link></li>
                            <li><Link to="/services" title="Our Services" className="flex items-center hover:text-primary"><Wrench className="mr-3" size={20} /> Services</Link></li>
                            <li><Link to="/terms" title="Terms & Conditions" className="flex items-center hover:text-primary"><ContactRound className="mr-3" size={20} /> Terms & Conditions</Link></li>
                            <li><Link to="/dashboard" title="Admin Panel" className="flex items-center hover:text-primary"><ShieldUser className="mr-3" size={20} /> Admin</Link></li>
                            <li><Link to="/employee/dashboard" title="Employee Dashboard" className="flex items-center hover:text-primary"><Wrench className="mr-3" size={20} /> Employee</Link></li>
                            <li><Link to="/vendor/dashboard" title="Vendor Panel" className="flex items-center hover:text-primary"><PersonStanding className="mr-3" size={20} /> Vendor</Link></li>
                        </ul>
                    </nav>

                    {/* Services */}
                    <nav aria-label="Our Services">
                        <h2 className="text-xl font-bold text-primary mb-6 border-l-4 border-primary pl-3">Our Services</h2>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-center hover:text-primary"><House className="mr-3" size={20} /> Servicing</li>
                            <li className="flex items-center hover:text-primary"><Store className="mr-3" size={20} /> Repairing</li>
                            <li className="flex items-center hover:text-primary"><Wrench className="mr-3" size={20} /> Full Engine</li>
                            <li className="flex items-center hover:text-primary"><ContactRound className="mr-3" size={20} /> Inspection</li>
                        </ul>
                    </nav>

                    {/* Contact Info */}
                    <address className="not-italic" aria-label="Contact Information">
                        <h2 className="text-xl font-bold text-primary mb-6 border-l-4 border-primary pl-3">Contact Us</h2>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-start hover:text-primary">
                                <MapPin className="mr-3 mt-1 flex-shrink-0" size={20} />
                                <span>5c/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 13</span>
                            </li>
                            <li className="flex items-center hover:text-primary">
                                <Phone className="mr-3" size={20} />
                                <a href="tel:+919229207021" title="Call Repairo Moto">+91 9229207021</a>
                            </li>
                            <li className="flex items-center hover:text-primary">
                                <Mail className="mr-3" size={20} />
                                <a href="mailto:contact@repairomoto.in" title="Email Repairo Moto">contact@repairomoto.in</a>
                            </li>
                        </ul>
                    </address>
                </div>

                {/* Bottom Footer */}
                <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} Designed and Developed by{' '}
                    <a className='text-primary' href='https://tejasvi.vercel.app/' target='_blank' rel="noopener noreferrer">Tejasvi Bihari</a>
                </div>
            </div>
        </footer>
    );
}