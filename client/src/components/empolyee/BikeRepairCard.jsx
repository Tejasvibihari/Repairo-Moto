import { useState } from 'react';
import { Wrench, Settings, Calendar, FileText } from 'lucide-react';
import { Link } from "react-router-dom";

export default function BikeRepairCard({
    completedOrders = 16,
    date = new Date()
}) {
    // Format today's date
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    }).format(date);

    return (
        <div className=" h-full w-full rounded-xl overflow-hidden shadow-lg">
            {/* Main card with mechanical-themed gradient background - new color scheme */}
            <div className="h-full bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 relative">


                {/* Mechanical pattern background */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        {/* Gear patterns */}
                        <defs>
                            <pattern id="gearPattern" width="80" height="80" patternUnits="userSpaceOnUse">
                                {/* Main gear */}
                                <path d="M40,10 L44,10 L46,0 L34,0 L36,10 Z M40,70 L36,70 L34,80 L46,80 L44,70 Z M10,40 L10,44 L0,46 L0,34 L10,36 Z M70,40 L70,36 L80,34 L80,46 L70,44 Z M18,18 L21,21 L14,28 L7,21 L14,14 Z M62,18 L59,21 L66,28 L73,21 L66,14 Z M18,62 L21,59 L14,52 L7,59 L14,66 Z M62,62 L59,59 L66,52 L73,59 L66,66 Z"
                                    fill="#555" stroke="#777" strokeWidth="1" />
                                <circle cx="40" cy="40" r="10" fill="#333" stroke="#777" strokeWidth="1" />

                                {/* Secondary small gear */}
                                <path d="M15,70 L17,70 L18,65 L14,65 L15,70 Z M15,80 L13,80 L12,85 L18,85 L17,80 Z M5,75 L5,77 L0,78 L0,72 L5,73 Z M25,75 L25,73 L30,72 L30,78 L25,77 Z M8,68 L10,70 L6,74 L4,72 L8,68 Z M22,68 L20,70 L24,74 L26,72 L22,68 Z M8,82 L10,80 L6,76 L4,78 L8,82 Z M22,82 L20,80 L24,76 L26,78 L22,82 Z"
                                    fill="#666" stroke="#777" strokeWidth="0.5" transform="translate(55, 5)" />
                                <circle cx="70" cy="20" r="5" fill="#444" stroke="#777" strokeWidth="0.5" />

                                {/* Chain pattern */}
                                <path d="M0,40 C5,40 5,35 10,35 C15,35 15,40 20,40 C25,40 25,35 30,35 C35,35 35,40 40,40 C45,40 45,35 50,35 C55,35 55,40 60,40 C65,40 65,35 70,35 C75,35 75,40 80,40"
                                    fill="none" stroke="#777" strokeWidth="1" strokeDasharray="2,1" />

                                {/* Scattered bolts */}
                                <circle cx="10" cy="10" r="2" fill="#555" stroke="#999" strokeWidth="0.5" />
                                <circle cx="70" cy="70" r="2" fill="#555" stroke="#999" strokeWidth="0.5" />
                                <circle cx="20" cy="50" r="2" fill="#555" stroke="#999" strokeWidth="0.5" />
                                <circle cx="60" cy="30" r="2" fill="#555" stroke="#999" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#gearPattern)" />

                        {/* Large gear in background */}
                        <g transform="translate(-40, -40) scale(2)">
                            <path d="M40,10 L44,10 L46,0 L34,0 L36,10 Z M40,70 L36,70 L34,80 L46,80 L44,70 Z M10,40 L10,44 L0,46 L0,34 L10,36 Z M70,40 L70,36 L80,34 L80,46 L70,44 Z M18,18 L21,21 L14,28 L7,21 L14,14 Z M62,18 L59,21 L66,28 L73,21 L66,14 Z M18,62 L21,59 L14,52 L7,59 L14,66 Z M62,62 L59,59 L66,52 L73,59 L66,66 Z"
                                fill="rgba(100, 100, 100, 0.1)" stroke="rgba(150, 150, 150, 0.2)" strokeWidth="0.5" />
                            <circle cx="40" cy="40" r="15" fill="rgba(50, 50, 50, 0.1)" stroke="rgba(150, 150, 150, 0.2)" strokeWidth="0.5" />
                        </g>

                        {/* Additional large gear in bottom right */}
                        <g transform="translate(180, 120) scale(1.8)">
                            <path d="M40,10 L44,10 L46,0 L34,0 L36,10 Z M40,70 L36,70 L34,80 L46,80 L44,70 Z M10,40 L10,44 L0,46 L0,34 L10,36 Z M70,40 L70,36 L80,34 L80,46 L70,44 Z M18,18 L21,21 L14,28 L7,21 L14,14 Z M62,18 L59,21 L66,28 L73,21 L66,14 Z M18,62 L21,59 L14,52 L7,59 L14,66 Z M62,62 L59,59 L66,52 L73,59 L66,66 Z"
                                fill="rgba(100, 100, 100, 0.1)" stroke="rgba(150, 150, 150, 0.2)" strokeWidth="0.5" />
                            <circle cx="40" cy="40" r="15" fill="rgba(50, 50, 50, 0.1)" stroke="rgba(150, 150, 150, 0.2)" strokeWidth="0.5" />
                        </g>

                        {/* Wrench icon overlay */}
                        <path d="M30,30 C32,25 38,23 42,28 L70,55 C75,60 70,70 65,65 L38,38 C33,33 28,35 30,30 Z M37,28 C40,28 42,30 42,33 C42,36 40,38 37,38 C34,38 32,36 32,33 C32,30 34,28 37,28 Z"
                            fill="rgba(150, 150, 150, 0.1)" stroke="rgba(200, 200, 200, 0.2)" strokeWidth="0.5" transform="translate(100, 50) rotate(45)" />
                    </svg>
                </div>

                {/* Top metal texture bar - updated color */}
                <div className="h-2 w-full bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-400"></div>

                {/* Card content */}
                <div className="px-6 py-5">
                    {/* Date section with metal finish - updated color */}
                    <div className="flex items-center mb-4">
                        <div className="p-2 rounded bg-gradient-to-b from-indigo-300 to-indigo-500 shadow-inner z-1">
                            <Calendar size={20} className="text-indigo-900" />
                        </div>
                        <div className="ml-3 z-1">
                            <p className="text-indigo-200 text-xs uppercase tracking-wide font-bold">Today</p>
                            <p className="text-white font-medium">{formattedDate}</p>
                        </div>
                    </div>

                    {/* Divider with bolts - updated color */}
                    <div className="relative h-px bg-indigo-700 my-4">
                        <div className="absolute left-0 top-1/2 w-2 h-2 rounded-full bg-indigo-400 border border-indigo-500 -translate-y-1/2"></div>
                        <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full bg-indigo-400 border border-indigo-500 -translate-y-1/2"></div>
                    </div>

                    {/* Completed orders with gear icon - updated color */}
                    <div className="flex items-center z-1">
                        <div className="p-3 rounded-lg bg-gradient-to-b from-purple-500 to-purple-700 shadow-lg relative overflow-hidden z-1">
                            <Wrench size={22} className="text-white relative z-10" />
                            {/* Mini gear animation */}
                            <div className="absolute -bottom-1 -right-1 opacity-20">
                                <Settings size={16} className="text-white" />
                            </div>
                        </div>
                        <div className="ml-3 z-1">
                            <h3 className="text-indigo-200 text-sm font-medium z-1">Completed Today</h3>
                            <div className="flex items-baseline">
                                <p className="text-3xl font-bold text-white">{completedOrders}</p>
                                {/* <span className="ml-2 text-sm text-indigo-300">of {totalOrders} orders</span> */}
                            </div>
                        </div>
                    </div>

                    {/* Spacer to replace progress bar */}
                    <div className="h-4"></div>

                    {/* Single action button - updated color and centered */}
                    <div className="mt-5 flex justify-center">
                        <Link to="/employee/all-booking" className="z-1 px-6 py-2 bg-gradient-to-b from-primary to-orange-700  text-white text-sm font-medium rounded shadow flex items-center cursor-pointer">
                            <FileText size={16} className="mr-2" />
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}