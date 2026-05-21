import React from "react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function CookiePolicy() {
    return (
        <>
            <NavBar />
            <motion.div
                className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Cookie Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Cookie Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">TECHNICAL</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Cookie Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                    </div>

                    <div className="space-y-8 text-gray-700">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies?</h2>
                            <p className="mb-3">
                                Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit a website or use an app. They contain information about your browsing activity, preferences, and login session.
                            </p>
                            <ul className="space-y-2">
                                {[
                                    "Purpose: Cookies are used to improve user experience, remember preferences, and analyze usage patterns.",
                                    "Types: First-party cookies (set by us), third-party cookies (set by partners).",
                                    "Duration: Session cookies (deleted when browser closes) and persistent cookies (remain stored).",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Types of Cookies We Use</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Session Cookies</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Login Session: Maintain your login session while using the app or website.",
                                    "Temporary Storage: Deleted automatically when you close the browser or log out.",
                                    "Security: Prevent unauthorized access and protect account security.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Analytics Cookies</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Usage Tracking: Track which pages you visit, time spent, and navigation patterns.",
                                    "Anonymized: Data is anonymized and aggregated; individual users are not identified.",
                                    "Tools: Google Analytics or similar tools are used for analysis.",
                                    "Purpose: Improve app/website performance, identify bottlenecks, and optimize user experience.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Marketing & Tracking Cookies</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Referral Source: Track how you discovered Repairo Moto (organic search, ads, referral, etc.).",
                                    "Campaign Tracking: Monitor effectiveness of promotional campaigns.",
                                    "Retargeting: Remember your visit to show relevant ads on other websites (optional).",
                                    "Opt-Out: You can opt out of marketing cookies in your settings.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.4 Preference Cookies</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "User Preferences: Remember your language preference, theme (light/dark), and UI settings.",
                                    "Customization: Personalize your experience based on saved preferences.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Third-Party Cookies</h2>
                            <ul className="space-y-2">
                                {[
                                    "Razorpay Payment Gateway: Cookies for secure payment processing.",
                                    "Google Analytics: For website usage analytics.",
                                    "Facebook Pixel: For marketing campaign tracking (if applicable).",
                                    "Firebase: For app analytics and crash reporting.",
                                    "Consent: We obtain consent before using third-party cookies.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How to Manage Cookies</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Browser Settings</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Accept All: Allow all cookies.",
                                    "Block All: Reject all cookies (may affect functionality).",
                                    "Selective: Allow only specific types of cookies.",
                                    "Clear Cookies: Manually delete cookies from browser history.",
                                    "Instructions: Check your browser's settings menu for cookie preferences.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 In-App Settings</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Cookie Preferences: Go to Settings → Privacy → Cookie Preferences.",
                                    "Analytics: Toggle analytics cookies on/off.",
                                    "Marketing: Opt out of marketing cookies.",
                                    "Session: Session cookies cannot be disabled (required for login).",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Impact of Disabling Cookies</h2>
                            <ul className="space-y-2">
                                {[
                                    "Session Cookies: Disabling these prevents login and app functionality.",
                                    "Analytics: App performance insights are lost; we cannot optimize user experience.",
                                    "Marketing: Ad targeting becomes less effective.",
                                    "Preferences: Your saved settings may not be remembered.",
                                    "Recommendation: Allow session cookies; optional analytics/marketing cookies can be disabled.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookie Security & Privacy</h2>
                            <ul className="space-y-2">
                                {[
                                    "Encryption: Sensitive cookies (session, auth tokens) are encrypted.",
                                    "No Sensitive Data: We do not store passwords, payment details, or SSN in cookies.",
                                    "HTTPS Only: Cookies are transmitted over secure HTTPS connections.",
                                    "Expiry: Cookies expire automatically based on set duration.",
                                    "Secure Flag: Security-sensitive cookies have the secure flag enabled.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Legal Basis for Cookies</h2>
                            <ul className="space-y-2">
                                {[
                                    "Session Cookies: No consent required; necessary for service delivery.",
                                    "Analytics Cookies: Consent obtained via cookie banner on website.",
                                    "Marketing Cookies: Explicit opt-in required before deployment.",
                                    "Compliance: Our cookie practices comply with Indian privacy laws and GDPR (if applicable).",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookie Banner & Consent</h2>
                            <ul className="space-y-2">
                                {[
                                    "Consent Banner: When you first visit our website, a cookie consent banner appears.",
                                    "Options: Accept All, Reject Non-Essential, or Customize Preferences.",
                                    "Record of Consent: Your choice is recorded and remembered.",
                                    "Change Preferences: You can update cookie preferences anytime in Settings.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact & Support</h2>
                            <p>
                                For cookie-related questions:<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Address: 5C/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 800013, Bihar, India
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
