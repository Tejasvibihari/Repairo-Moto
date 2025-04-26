import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function EmployeeNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Array of navigation links
    const navLinks = [
        { name: 'Dashboard', path: '/employee/dashboard' },
        { name: 'All Booking', path: '/employee/all-booking' },
        { name: 'Profile', path: '/employee/profile' },
        {
            name: 'Referral & Earning', path: '/employee/referral'
        },
    ];

    return (
        <nav className="bg-white shadow-md w-full">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between md:w-7xl">
                {/* Logo */}
                <div className="text-xl font-bold text-primary">
                    <img src="/logo/textlogo150.png" alt="Logo" className="h-12 inline-block mr-2" />
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6 mx-auto">
                    {navLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.path}
                            className="text-gray-700 hover:text-primary font-semibold font-nunito hover:border-b-2 pb-1"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
                {/* <Link to="/user-order-booking">
                    <button className="bg-primary text-white px-4 py-2 cursor-pointer hover:bg-secondary hidden md:block">
                        Book Appointment
                    </button>
                </Link> */}

                {/* Hamburger Icon for Mobile */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300 ease-in-out md:hidden`}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="text-xl font-bold text-primary">
                        <img src="/logo/textlogo150.png" alt="Logo" className="h-12 inline-block mr-2" />
                    </div>
                    <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col space-y-4 px-4 py-6">
                    {navLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.path}
                            className="text-gray-700 hover:text-primary"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <button className="bg-primary text-white cursor-pointer px-4 py-2 hover:bg-secondary">
                        Sign In
                    </button>
                </div>
            </div>
        </nav>
    );
}