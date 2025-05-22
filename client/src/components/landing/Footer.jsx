import {
    ContactRound, HandCoins, House, Images, Rss, Store, Wrench,
    Facebook, Instagram, Twitter, Youtube,
    Phone, Mail, MapPin, ShieldUser, PersonStanding
} from 'lucide-react';
import { Link } from "react-router-dom";
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-secondary text-white pt-16 pb-8" aria-label="Website Footer">
            <div className="max-w-7xl mx-auto px-6">
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
                            <li className="flex items-start hover:text-primary"><MapPin className="mr-3 mt-1" size={20} /> <span>5c/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 13</span></li>
                            <li className="flex items-center hover:text-primary"><Phone className="mr-3" size={20} /> <a href="tel:+919229207021" title="Call Repairo Moto">+91 9229207021</a></li>
                            <li className="flex items-center hover:text-primary"><Mail className="mr-3" size={20} /> <a href="mailto:contact@repairomoto.in" title="Email Repairo Moto">contact@repairomoto.in</a></li>
                        </ul>
                    </address>
                </div>

                {/* Bottom Footer */}
                <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} Designed and Developed by <a className='text-primary' href='https://tejasvi.vercel.app/' target='_blank' rel="noopener noreferrer">Tejasvi Bihari</a>
                </div>
            </div>
        </footer>
    );
}
