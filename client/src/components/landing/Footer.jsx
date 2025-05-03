import { ContactRound, HandCoins, House, Images, Rss, Store, Wrench, Facebook, Instagram, Twitter, Youtube, Phone, Mail, Clock, MapPin } from 'lucide-react';
import { Link } from "react-router-dom";
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-secondary text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Logo Section */}
                    <div className="">
                        <img src="./logo/logo72.png" alt="Logo" className="w-36 mb-4" />
                        <p className="text-gray-400 text-sm mb-6">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Temporibus labore itaque quas, sed deleniti.
                        </p>
                        <div className="flex space-x-5 ">
                            <Link to="#" className="hover:text-primary  hover:scale-110 hover:opacity-80 transition-all duration-300">
                                <Twitter size={20} />
                            </Link>
                            <Link to="#" className="hover:text-primary hover:scale-110 hover:opacity-80 transition-all duration-300 ">
                                <Facebook size={20} />
                            </Link>
                            <Link to="#" className="hover:text-primary hover:scale-110 hover:opacity-80 transition-all duration-300">
                                <Instagram size={20} />
                            </Link>
                            <Link to="#" className="hover:text-primary hover:scale-110 hover:opacity-80 transition-all duration-300">
                                <Youtube size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Important Links */}
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-6 border-l-4 border-primary pl-3">Important Links</h2>
                        <ul className="space-y-4 text-gray-300">
                            <li>
                                <Link to="/" className="flex items-center hover:text-primary transition">
                                    <House className="mr-3" size={20} /> Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="flex items-center hover:text-primary transition">
                                    <Store className="mr-3" size={20} /> About
                                </Link>
                            </li>
                            <li>
                                <Link to="/services" className="flex items-center hover:text-primary transition">
                                    <Wrench className="mr-3" size={20} /> Services
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="flex items-center hover:text-primary transition">
                                    <ContactRound className="mr-3" size={20} /> Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="flex items-center hover:text-primary transition">
                                    <Rss className="mr-3" size={20} /> Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="flex items-center hover:text-primary transition">
                                    <Images className="mr-3" size={20} /> Gallery
                                </Link>
                            </li>
                            <li>
                                <Link to="/referral" className="flex items-center hover:text-primary transition">
                                    <HandCoins className="mr-3" size={20} /> Referral & Earning
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="flex items-center hover:text-primary transition">
                                    <ContactRound className="mr-3" size={20} /> Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Our Services */}
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-6 border-l-4 border-primary pl-3">Our Services</h2>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-center cursor-pointer hover:text-primary transition">
                                <House className="mr-3" size={20} /> Servicing
                            </li>
                            <li className="flex items-center cursor-pointer hover:text-primary transition">
                                <Store className="mr-3" size={20} /> Repairing
                            </li>
                            <li className="flex items-center cursor-pointer hover:text-primary transition">
                                <Wrench className="mr-3" size={20} /> Full Engine
                            </li>
                            <li className="flex items-center cursor-pointer hover:text-primary transition">
                                <ContactRound className="mr-3" size={20} /> Inspection
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-6 border-l-4 border-primary pl-3">Contact Us</h2>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-center cursor-pointer hover:text-primary transition">
                                <MapPin className="mr-3 mt-1" size={20} /> Address: 5c/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 13.
                            </li>
                            <li className="flex items-center cursor-pointer hover:text-primary transition">
                                <Phone className="mr-3" size={20} />
                                Phone: +91 9229207021
                            </li>
                            <li className="flex items-center cursor-pointer hover:text-primary transition">
                                <Mail className="mr-3" size={20} />
                                Email: Contact@repairomoto.in
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Footer */}
                <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()}  Repairo Moto Made with ❤️ by You.
                </div>
            </div>
        </footer>
    );
}
