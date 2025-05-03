
import { Share2, Gift, Users,  } from "lucide-react";
import NavBar from '../../components/ui/NavBar';
import Footer from '../../components/landing/Footer';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { motion } from 'framer-motion';

export default function ReferralEarning() {
  
    return (
        <>
            <NavBar />

            {/* Hero Section */}
            <div className="min-h-screen bg-gray-100">
                {/* Hero Section */}
                <div className="bg-white py-12 md:py-20">
                    <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center">
                        {/* Left Content */}
                        <div className="w-full md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Refer a friend
                            </h1>
                            <p className="text-lg text-gray-600 mb-8">
                                Share the joy of hassle-free bike servicing with friends and family.
                                Earn ₹200 in credits when they complete their first service, and
                                they'll get ₹150 off their first booking!
                            </p>
                            <div className="flex items-center space-x-4">
                                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-3 rounded-md flex items-center transition-colors">
                                    <Share2 className="mr-2 h-5 w-5" />
                                    Share Now
                                </button>
                                <a href="#how-it-works" className="text-yellow-500 font-medium hover:text-yellow-600">
                                    Learn more
                                </a>
                            </div>
                        </div>

                        {/* Right Illustration */}
                        <div className="w-full md:w-1/2 relative">
                            <div className="relative aspect-square max-w-md mx-auto">
                                {/* Placeholder for your actual illustration */}
                                <div className="absolute inset-0 bg-purple-100 rounded-full opacity-20"></div>
                                <div className="relative z-10">
                                    <div className="bg-white rounded-xl shadow-xl p-6 mb-4 max-w-sm mx-auto transform translate-y-10 relative">
                                        {/* Phone mockup with referral UI */}
                                        <div className="border-4 border-gray-800 rounded-3xl p-4 bg-gray-50 relative">
                                            <div className="w-20 h-1 bg-gray-800 rounded-full mx-auto mb-4"></div>
                                            <div className="bg-purple-100 rounded-lg p-4 flex flex-col items-center">
                                                <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mb-2">
                                                    <Users className="text-white h-8 w-8" />
                                                </div>
                                                <div className="h-12 w-12 bg-blue-300 rounded-full absolute top-20 right-12 flex items-center justify-center">
                                                    <Plus className="text-white" />
                                                </div>
                                                <div className="h-12 w-12 bg-blue-300 rounded-full absolute top-20 left-12 flex items-center justify-center">
                                                    <Plus className="text-white" />
                                                </div>
                                                <div className="text-center mt-2">
                                                    <div className="font-bold">Share & Earn</div>
                                                    <div className="text-sm text-gray-600">Invite friends now</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coins illustration */}
                                    <div className="absolute -bottom-6 right-4">
                                        <div className="flex">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-500 -ml-2 shadow-md"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Money bag illustration */}
                                    <div className="absolute bottom-10 right-12">
                                        <div className="w-16 h-20 bg-purple-600 rounded-b-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                

                {/* How It Works Section */}
                <div id="how-it-works" className=" bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Share2 className="h-8 w-8 text-yellow-500" />,
                                    title: "Share Your Code",
                                    description: "Share your unique referral code with friends and family who could use our bike servicing."
                                },
                                {
                                    icon: <Users className="h-8 w-8 text-yellow-500" />,
                                    title: "Friend Books a Service",
                                    description: "Your friend uses your referral code when booking their first service with Repairo Moto."
                                },
                                {
                                    icon: <Gift className="h-8 w-8 text-yellow-500" />,
                                    title: "Both Get Rewarded",
                                    description: "You earn ₹200 in credits, and your friend gets ₹150 off their first service!"
                                }
                            ].map((step, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            {[
                                {
                                    question: "Is there a limit to how many friends I can refer?",
                                    answer: "No, there's no limit! Refer as many friends as you like and earn rewards for each successful referral."
                                },
                                {
                                    question: "How long does it take to receive my credits?",
                                    answer: "You'll receive your ₹200 credit within 24 hours after your friend completes their first service with us."
                                },
                                {
                                    question: "How can I track my referrals?",
                                    answer: "You can track all your referrals and pending/completed rewards in the 'My Referrals' section of your account."
                                },
                                {
                                    question: "Do referral credits expire?",
                                    answer: "Yes, referral credits are valid for 6 months from the date they are added to your account."
                                }
                            ].map((faq, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                                    <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

               
               
            </div>

            <Footer />
        </>
    );
}
function Plus() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
