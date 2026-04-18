import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, Star, Shield, MapPin, Bell } from 'lucide-react';

const appFeatures = [
    { icon: <Clock size={20} />, text: 'Book in under 60 seconds' },
    { icon: <MapPin size={20} />, text: 'Real-time mechanic tracking' },
    { icon: <Bell size={20} />, text: 'Instant repair status updates' },
    { icon: <Shield size={20} />, text: 'Verified & trusted mechanics' },
    { icon: <Star size={20} />, text: 'Rate & review your service' },
    { icon: <Wrench size={20} />, text: 'All bike brands supported' },
];

export default function MobileAppBanner() {
    return (
        <section
            id="download-app"
            className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white py-20 px-6 overflow-hidden"
            aria-labelledby="app-banner-title"
        >
            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-500 opacity-5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

                {/* Left: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    viewport={{ once: true }}
                >
                    <span className="inline-block bg-primary/20 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-primary/30">
                        📱 Now on Mobile
                    </span>

                    <h2 id="app-banner-title" className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
                        Book. Track. Done.{' '}
                        <span className="text-primary">All in the App.</span>
                    </h2>

                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        We've moved our entire booking experience to the <strong className="text-white">Repairomoto app</strong> for a smoother, faster, and smarter service — right from your pocket. Order repairs, track your mechanic live, and pay seamlessly.
                    </p>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                        {appFeatures.map((feature, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-3 text-gray-300 text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-primary flex-shrink-0">{feature.icon}</span>
                                {feature.text}
                            </motion.div>
                        ))}
                    </div>

                    {/* Download Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <motion.a
                            href="https://play.google.com/store/apps/details?id=com.repairomoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-xl shadow-xl hover:bg-gray-100 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label="Download Repairomoto on Google Play"
                        >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="none">
                                <path d="M3.18 23.76c.37.2.8.23 1.2.08l12.15-7.02-2.72-2.73L3.18 23.76z" fill="#EA4335" />
                                <path d="M20.82 10.18L17.6 8.34l-3.06 3.06 3.06 3.06 3.24-1.86c.92-.53.92-1.89-.02-2.42z" fill="#FBBC05" />
                                <path d="M4.38.24C3.98.09 3.55.12 3.18.32L13.81 11 16.53 8.28 4.38.24z" fill="#4285F4" />
                                <path d="M3.18.32C2.46.73 2 1.5 2 2.4v19.2c0 .9.46 1.67 1.18 2.08L13.82 13 3.18.32z" fill="#34A853" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs text-gray-500 font-medium">GET IT ON</span>
                                <span className="text-base font-bold">Google Play</span>
                            </div>
                        </motion.a>

                        {/* <motion.a
                            href="https://apps.apple.com/app/repairomoto"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-xl shadow-xl hover:bg-gray-100 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label="Download Repairomoto on the App Store"
                        >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="black">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs text-gray-500 font-medium">DOWNLOAD ON THE</span>
                                <span className="text-base font-bold">App Store</span>
                            </div>
                        </motion.a> */}
                    </div>

                    <p className="text-gray-500 text-sm mt-5">
                        ⭐⭐⭐⭐⭐ &nbsp;Rated 4.8/5 · 2,000+ downloads · Free to use
                    </p>
                </motion.div>

                {/* Right: Phone Mockup */}
                <motion.div
                    className="flex justify-center lg:justify-end"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <div className="relative">
                        {/* Glow ring behind phone */}
                        <div className="absolute inset-0 bg-primary opacity-20 rounded-[3rem] blur-2xl scale-110" aria-hidden="true" />

                        {/* Phone shell */}
                        <div className="relative bg-gray-900 border-4 border-gray-700 rounded-[3rem] w-64 h-[520px] shadow-2xl overflow-hidden flex flex-col">
                            {/* Notch */}
                            <div className="bg-black w-28 h-7 rounded-b-2xl mx-auto mt-0 z-10 flex items-center justify-center">
                                <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
                            </div>

                            {/* App Screen Content */}
                            <div className="flex-1 bg-white mx-2 mb-2 mt-1 rounded-b-[2rem] overflow-hidden flex flex-col">
                                {/* Status bar area */}
                                <div className="bg-primary px-4 py-3 flex items-center justify-between">
                                    <span className="text-white font-bold text-sm">Repairomoto</span>
                                    <Wrench size={16} className="text-white" />
                                </div>

                                {/* Mock screen */}
                                <div className="p-3 flex-1 flex flex-col gap-3 bg-gray-50">
                                    <div className="bg-primary/10 rounded-xl p-3">
                                        <p className="text-xs font-bold text-gray-800">Book a Mechanic</p>
                                        <p className="text-xs text-gray-500 mt-1">Select your bike & service</p>
                                        <div className="mt-2 bg-primary text-white text-xs text-center py-1.5 rounded-lg font-semibold">
                                            Book Now →
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-3 shadow-sm">
                                        <p className="text-xs font-bold text-gray-700 mb-2">Your Orders</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                                                <Wrench size={12} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-800">Oil Change</p>
                                                <p className="text-xs text-green-600">Mechanic On the Way</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-3 shadow-sm">
                                        <p className="text-xs font-bold text-gray-700 mb-2">Live Tracking</p>
                                        <div className="bg-gray-200 rounded-lg h-20 flex items-center justify-center">
                                            <MapPin size={20} className="text-primary" />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {[4, 5, 5, 4, 5].map((s, i) => (
                                            <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                                        ))}
                                        <span className="text-xs text-gray-500">4.8</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}