import React, { useState } from 'react'
import NavBar from '../../components/ui/NavBar'
import Footer from '../../components/landing/Footer'
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import { Calendar, UserPlus, QrCode, BookOpen, CalendarPlus } from "lucide-react";
import { Link } from 'react-router-dom';
export default function UserDashboard() {

    const [activeCard, setActiveCard] = useState(null);

    const cards = [
        {
            id: "booking",
            title: "New Booking",
            description: "Schedule a new appointment",
            icon: <CalendarPlus size={24} />,
            color: "bg-red-500",
            link: "/user-order-booking"
        },
        {
            id: "bookings",
            title: "All Bookings",
            description: "View and manage all your bookings",
            icon: <Calendar size={24} />,
            color: "bg-blue-500",
            link: "/user-allbooking"
        },
        {
            id: "referrals",
            title: "My Referrals",
            description: "Track your referrals and rewards",
            icon: <UserPlus size={24} />,
            color: "bg-green-500",
            link: "/user-referral"
        },
        {
            id: "qrcode",
            title: "My QR Code",
            description: "Scan to share your profile",
            icon: <QrCode size={24} />,
            color: "bg-purple-500",
            link: "/user-qrcode"
        },

        {
            id: "profile",
            title: "My Account",
            description: "Schedule a new appointment",
            icon: <BookOpen size={24} />,
            color: "bg-red-500",
            link: "/user/profile"
        },
        {
            id: "bikeprofile",
            title: "Add Bike Profile",
            description: "Add Bike Profile",
            icon: <BookOpen size={24} />,
            color: "bg-red-500",
            link: "/user/add-bike-profile"
        }
    ];

    const handleCardClick = (id) => {
        setActiveCard(id);
        // Here you would typically navigate or show different content
        console.log(`Card ${id} clicked`);
    };
    return (
        <>
            <NavBar />
            <div
                className="relative bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold">Dashboard</h2>

                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Dasboard', href: '/user/dashboard' },
                        ]}
                    />
                </div>
            </div>
            <div className="p-6 max-w-5xl mx-auto my-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {cards.map((card) => (
                        <Link to={card.link}
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className={`flex flex-col items-center p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${activeCard === card.id ? "ring-2 ring-offset-2 ring-blue-600" : ""
                                } bg-white`}
                        >
                            <div className={`p-3 rounded-full ${card.color} text-white mb-4`}>
                                {card.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                            <p className="text-sm text-gray-600 text-center">{card.description}</p>
                            <div className={`w-full mt-4 h-1 rounded-full ${card.color} opacity-70`}></div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    )
}
