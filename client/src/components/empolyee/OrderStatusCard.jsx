import { useState } from 'react';
import { ShoppingBag, Clock, CheckCircle, TrendingUp, Package } from 'lucide-react';

export default function OrderStatusCard({
    title = "Total Orders",
    count = 258,
    icon = "bag",
    color = "blue",
    trend = "+14% from last month"
}) {
    // Define color schemes for different card types
    const colorSchemes = {
        blue: {
            bgGradient: "from-blue-600 to-cyan-500",
            iconBg: "bg-blue-700",
            accentColor: "rgba(79, 209, 255, 0.4)",
            secondaryColor: "rgba(255, 255, 255, 0.15)"
        },
        green: {
            bgGradient: "from-green-600 to-emerald-500",
            iconBg: "bg-green-700",
            accentColor: "rgba(52, 211, 153, 0.4)",
            secondaryColor: "rgba(255, 255, 255, 0.15)"
        },
        amber: {
            bgGradient: "from-amber-600 to-yellow-500",
            iconBg: "bg-amber-700",
            accentColor: "rgba(252, 211, 77, 0.4)",
            secondaryColor: "rgba(255, 255, 255, 0.15)"
        },
        purple: {
            bgGradient: "from-purple-600 to-fuchsia-500",
            iconBg: "bg-purple-700",
            accentColor: "rgba(232, 121, 249, 0.4)",
            secondaryColor: "rgba(255, 255, 255, 0.15)"
        }
    };

    // Get selected color scheme
    const scheme = colorSchemes[color] || colorSchemes.blue;

    // Map icon name to component
    const iconComponents = {
        bag: ShoppingBag,
        clock: Clock,
        check: CheckCircle,
        trend: TrendingUp,
        package: Package
    };

    // Select the icon component
    const IconComponent = iconComponents[icon] || ShoppingBag;

    return (
        <div className="w-full rounded-xl overflow-hidden shadow-lg">
            {/* Main card with gradient background */}
            <div className={`h-full bg-gradient-to-br ${scheme.bgGradient} relative`}>
                {/* Complex abstract pattern background */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Abstract SVG pattern overlay */}
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        {/* Abstract geometric shapes */}
                        <defs>
                            <pattern id="abstractPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                                {/* Circle elements */}
                                <circle cx="10" cy="10" r="8" fill="transparent" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <circle cx="90" cy="90" r="15" fill="transparent" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <circle cx="50" cy="30" r="20" fill={scheme.accentColor} opacity="0.2" />

                                {/* Line elements */}
                                <line x1="0" y1="30" x2="40" y2="0" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <line x1="60" y1="0" x2="100" y2="40" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <line x1="0" y1="70" x2="30" y2="100" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <line x1="70" y1="100" x2="100" y2="70" stroke={scheme.secondaryColor} strokeWidth="1" />

                                {/* Zigzag line */}
                                <polyline points="0,50 20,60 40,40 60,60 80,40 100,50" fill="none" stroke={scheme.secondaryColor} strokeWidth="1" />

                                {/* Rectangle elements */}
                                <rect x="40" y="70" width="20" height="20" fill="transparent" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <rect x="80" y="20" width="15" height="15" fill={scheme.accentColor} opacity="0.15" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#abstractPattern)" />

                        {/* Large accent elements */}
                        <circle cx="0" cy="0" r="80" fill={scheme.accentColor} opacity="0.2" />
                        <circle cx="100%" cy="100%" r="120" fill={scheme.accentColor} opacity="0.15" />

                        {/* Dynamic flow lines */}
                        <path d="M-50,0 C50,50 150,50 250,0 S450,50 550,0" stroke={scheme.secondaryColor} strokeWidth="1" fill="none" />
                        <path d="M-50,100 C50,150 150,150 250,100 S450,150 550,100" stroke={scheme.secondaryColor} strokeWidth="1" fill="none" />

                        {/* Abstract polygon */}
                        <polygon points="0,50 20,20 80,30 100,80 70,100 30,90" fill={scheme.accentColor} opacity="0.1" transform="translate(150, 50)" />
                    </svg>
                </div>

                {/* Floating geometric elements with blur for depth */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 blur-xl translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white opacity-10 blur-xl -translate-x-10 translate-y-10"></div>
                <div className="absolute top-1/4 right-1/4 w-16 h-16 rounded-full" style={{ background: scheme.accentColor, filter: 'blur(12px)' }}></div>
                <div className="absolute bottom-1/3 left-1/3 w-12 h-12" style={{ background: scheme.accentColor, filter: 'blur(10px)', transform: 'rotate(45deg)' }}></div>

                {/* Card content */}
                <div className="relative px-6 py-5 h-48">
                    <div className="relative flex flex-col h-full text-white">
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-lg ${scheme.iconBg} shadow-lg relative z-10`}>
                                <IconComponent size={24} className="text-white" />
                            </div>
                        </div>

                        <div className="mt-auto relative z-10">
                            <h3 className="text-lg font-medium">{title}</h3>
                            <div className="mt-2 flex items-baseline">
                                <p className="text-3xl font-bold">{count}</p>
                                {/* <span className="ml-2 text-sm font-medium opacity-80">{trend}</span> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}