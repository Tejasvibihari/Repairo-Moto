import { Share2, Gift, Users, Store, Bell, Smartphone, QrCode, IndianRupee, Wrench, Award, CheckCircle, CreditCard } from "lucide-react";
import { useState } from "react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";

export default function ReferralEarning() {
    const [activeTab, setActiveTab] = useState('customer');
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const customerFaqs = [
        {
            question: "Is there a limit to how many friends I can refer?",
            answer: "No, there's no limit! Refer as many friends as you like and earn ₹50 for each successful referral."
        },
        {
            question: "How long does it take to receive my credits?",
            answer: "You'll receive your ₹50 credit within 24 hours after your friend completes their first service with us."
        },
        {
            question: "How can I track my referrals?",
            answer: "You can track all your referrals and pending/completed rewards in the 'My Referrals' section of your account."
        },
        {
            question: "How can I use my referral credits?",
            answer: "Your ₹50 referral credits can be used during your next purchase/service booking to reduce the total amount."
        },
        {
            question: "Do referral credits expire?",
            answer: "Yes, referral credits are valid for 6 months from the date they are added to your account."
        }
    ];

    const shopOwnerFaqs = [
        {
            question: "How do I get the QR code for my shop?",
            answer: "Contact us at +91 9229207021 to get your shop's QR code installed. Our team will visit your shop and set it up for free."
        },
        {
            question: "How does the commission structure work?",
            answer: "You earn commission based on order value: ₹49 for orders ≥₹2000, ₹149 for orders ≥₹3000, and ₹249 for orders ≥₹5000."
        },
        {
            question: "How can I withdraw my earnings?",
            answer: "You can withdraw your earnings directly to your bank account via UPI. Minimum withdrawal amount is ₹100."
        },
        {
            question: "When will I receive the commission?",
            answer: "All commission amounts will be credited to your account within 1 week after the service is completed."
        },
        {
            question: "How will I know about new bookings?",
            answer: "You'll receive SMS alerts for every booking - one when the booking is made and another when the service is completed."
        },
        {
            question: "Are there any charges for joining the program?",
            answer: "No, joining our shop owner program is completely free. We install the QR code and provide all support at no cost."
        }
    ];

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                🚀 Repairo Moto Partnership
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
                                Refer friends or become a partner shop - Choose your way to earn with India's leading bike service platform
                            </p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex justify-center mb-12">
                            <div className="bg-white/10 backdrop-blur-lg rounded-full p-2 flex">
                                <button
                                    onClick={() => setActiveTab('customer')}
                                    className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${activeTab === 'customer'
                                        ? 'bg-white text-purple-600 shadow-lg'
                                        : 'text-white hover:bg-white/20'
                                        }`}
                                >
                                    <Users className="inline mr-2 h-5 w-5" />
                                    Customer Referrals
                                </button>
                                <button
                                    onClick={() => setActiveTab('shop')}
                                    className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${activeTab === 'shop'
                                        ? 'bg-white text-purple-600 shadow-lg'
                                        : 'text-white hover:bg-white/20'
                                        }`}
                                >
                                    <Store className="inline mr-2 h-5 w-5" />
                                    Shop Partnership
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Referral Section */}
                {activeTab === 'customer' && (
                    <div className="py-16">
                        {/* Customer Benefits */}
                        <div className="max-w-6xl mx-auto px-4 md:px-8 mb-16">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Left Content */}
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                        Share the Joy, Earn Rewards! 🎁
                                    </h2>
                                    <p className="text-lg text-gray-600 mb-8">
                                        Share the joy of hassle-free bike servicing with friends and family.
                                        Earn ₹50 in credits when they complete their first service. Use your
                                        earned credits in your next purchase!
                                    </p>
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 mb-8">
                                        <div className="flex items-center justify-center text-white">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold">You Earn: ₹50</div>
                                                <div className="text-sm opacity-90">Credits for each successful referral</div>
                                                <div className="text-sm opacity-90 mt-2">💡 Use in your next purchase!</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* <button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg">
                                            <Share2 className="mr-2 h-5 w-5" />
                                            Share Now
                                        </button> */}
                                        <button
                                            onClick={() => document.getElementById('customer-how-it-works').scrollIntoView({ behavior: 'smooth' })}
                                            className="bg-white border-2 border-purple-500 text-purple-600 font-semibold px-8 py-4 rounded-xl hover:bg-purple-50 transition-all duration-300"
                                        >
                                            Learn More
                                        </button>
                                    </div>
                                </div>

                                {/* Right Illustration */}
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-8 relative overflow-hidden">
                                        <div className="absolute top-4 right-4">
                                            <div className="flex">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-500 -ml-1 shadow-md animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <Users className="text-white h-6 w-6" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-purple-600">₹50</div>
                                                    <div className="text-sm text-gray-500">Per Referral</div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-bold text-gray-800">Invite & Earn</div>
                                                <div className="text-sm text-gray-600">Share your code now</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How It Works - Customer */}
                        <div id="customer-how-it-works" className="bg-white py-16">
                            <div className="max-w-6xl mx-auto px-4 md:px-8">
                                <h2 className="text-3xl font-bold text-center mb-12">How Customer Referrals Work</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        {
                                            icon: <Share2 className="h-8 w-8 text-purple-500" />,
                                            title: "Share Your Code",
                                            description: "Share your unique referral code with friends and family who could use our bike servicing."
                                        },
                                        {
                                            icon: <Users className="h-8 w-8 text-purple-500" />,
                                            title: "Friend Books Service",
                                            description: "Your friend uses your referral code when booking their first service with Repairo Moto."
                                        },
                                        {
                                            icon: <CreditCard className="h-8 w-8 text-purple-500" />,
                                            title: "You Get Credits",
                                            description: "You earn ₹50 in credits that can be used in your next purchase or service booking!"
                                        }
                                    ].map((step, index) => (
                                        <div key={index} className="relative">
                                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                    {step.icon}
                                                </div>
                                                <h3 className="text-xl font-bold mb-4 text-gray-800">{step.title}</h3>
                                                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                            </div>
                                            {index < 2 && (
                                                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                                                    <div className="w-8 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shop Partnership Section */}
                {activeTab === 'shop' && (
                    <div className="py-16">
                        {/* Shop Owner Hero */}
                        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
                            <div className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                        🚀 अब आपकी दुकान से सीधी बुकिंग!
                                    </h2>
                                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                                        अब आपके ग्राहक सीधे आपके दुकान से बाइक सर्विस और रिपेयरिंग बुक कर सकते हैं!
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button className="bg-white text-orange-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                            <Smartphone className="inline mr-2 h-5 w-5" />
                                            Call Now: +91 9229207021
                                        </button>
                                        <button
                                            onClick={() => document.getElementById('shop-benefits').scrollIntoView({ behavior: 'smooth' })}
                                            className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                                        >
                                            View Benefits
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shop Commission Structure */}
                        <div id="shop-benefits" className="bg-white py-16">
                            <div className="max-w-6xl mx-auto px-4 md:px-8">
                                <h2 className="text-3xl font-bold text-center mb-4">💰 Commission Structure - दुकान मालिकों के लिए</h2>
                                <p className="text-center text-gray-600 mb-12 text-lg">Earn commission on every order processed through your shop</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                    {[
                                        {
                                            orderValue: "₹2000+",
                                            commission: "₹49",
                                            subtitle: "Orders ≥ ₹2000",
                                            icon: <Award className="h-8 w-8" />,
                                            color: "from-green-400 to-emerald-500"
                                        },
                                        {
                                            orderValue: "₹3000+",
                                            commission: "₹149",
                                            subtitle: "Orders ≥ ₹3000",
                                            icon: <Wrench className="h-8 w-8" />,
                                            color: "from-blue-400 to-cyan-500"
                                        },
                                        {
                                            orderValue: "₹5000+",
                                            commission: "₹249",
                                            subtitle: "Orders ≥ ₹5000",
                                            icon: <Gift className="h-8 w-8" />,
                                            color: "from-purple-400 to-pink-500"
                                        }
                                    ].map((tier, index) => (
                                        <div key={index} className="relative group">
                                            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                                <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                    {tier.icon}
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-600 mb-2">{tier.orderValue}</div>
                                                    <div className="text-3xl font-bold text-gray-800 mb-1">{tier.commission}</div>
                                                    <div className="text-sm text-gray-500">{tier.subtitle}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Withdrawal Information */}
                                <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl p-8 text-center text-white">
                                    <h3 className="text-2xl font-bold mb-4">💳 Easy Withdrawal Process</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-xl font-bold mb-2">Direct Bank Transfer</div>
                                            <p className="text-sm opacity-90">Withdraw directly to your bank account via UPI</p>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold mb-2">Minimum ₹100</div>
                                            <p className="text-sm opacity-90">Minimum withdrawal amount is ₹100</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shop Features */}
                        <div className="py-16 bg-gray-50">
                            <div className="max-w-6xl mx-auto px-4 md:px-8">
                                <h2 className="text-3xl font-bold text-center mb-12">Partnership Features</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        {
                                            icon: <Bell className="h-8 w-8 text-blue-500" />,
                                            title: "🔔 Booking Alerts",
                                            description: "हर बुकिंग का SMS आपको मिलेगा – एक बुकिंग के समय और एक सर्विस पूरी होने पर।",
                                            features: ["Real-time SMS notifications", "Booking confirmation alerts", "Service completion updates"]
                                        },
                                        {
                                            icon: <IndianRupee className="h-8 w-8 text-green-500" />,
                                            title: "💰 Quick Settlement",
                                            description: "कमीशन 1 हफ्ते के अंदर आपके अकाउंट में क्रेडिट होगा।",
                                            features: ["Weekly commission settlement", "Direct UPI withdrawal", "Transparent payment tracking"]
                                        },
                                        {
                                            icon: <QrCode className="h-8 w-8 text-purple-500" />,
                                            title: "📍 QR Code Setup",
                                            description: "QR Code लगवाने के लिए आज ही संपर्क करें!",
                                            features: ["Free QR code installation", "Custom shop branding", "Easy customer booking"]
                                        },
                                        {
                                            icon: <Store className="h-8 w-8 text-orange-500" />,
                                            title: "🚀 Complete Support",
                                            description: "आपके ग्राहक, आपकी दुकान, आपकी कमाई!",
                                            features: ["24/7 technical support", "Marketing assistance", "Business growth guidance"]
                                        }
                                    ].map((feature, index) => (
                                        <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {feature.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                                                    <p className="text-gray-600 mb-4">{feature.description}</p>
                                                    <ul className="space-y-1">
                                                        {feature.features.map((item, idx) => (
                                                            <li key={idx} className="flex items-center text-sm text-gray-500">
                                                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="py-16">
                            <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
                                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Partner with Us?</h2>
                                    <p className="text-xl mb-8 opacity-90">
                                        Join thousands of shop owners who are already earning with Repairo Moto
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <a href="tel:+919229207021" className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                            <Smartphone className="inline mr-2 h-5 w-5" />
                                            Call: +91 9229207021
                                        </a>
                                        {/* <button className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300">
                                            WhatsApp Us
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <div className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 md:px-8">
                        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            {(activeTab === 'customer' ? customerFaqs : shopOwnerFaqs).map((faq, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                                        <div className={`transform transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                    {openFaq === index && (
                                        <div className="px-6 pb-4">
                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
                    <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Start Earning with Repairo Moto Today!
                        </h2>
                        <p className="text-gray-300 mb-8">
                            {activeTab === 'customer'
                                ? 'Refer friends and earn ₹50 credits for every successful referral'
                                : 'Partner with us and earn commission on every order from your shop'
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
                                {activeTab === 'customer' ? 'Start Referring' : 'Become a Partner'}
                            </button>
                            <button
                                onClick={() => setActiveTab(activeTab === 'customer' ? 'shop' : 'customer')}
                                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                            >
                                {activeTab === 'customer' ? 'Explore Shop Partnership' : 'View Customer Referrals'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}