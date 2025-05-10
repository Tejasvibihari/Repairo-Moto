// ...keep your imports
import React from "react";
import { Download } from "lucide-react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function Terms() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Booking Form</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Booking' },
                        ]}
                    />
                </div>
            </motion.div>
            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">AGREEMENT</div>
                        <h1 className="text-4xl font-bold text-primary mb-6">Terms of Service</h1>
                        <p className="text-gray-600">
                            We know it's tempting to skip these Terms of Service, but it's important to establish what you can expect from us as you use Repairo Moto services, and what we expect from you.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6 text-gray-700">
                        {/* Introduction */}
                        <p>
                            These Terms of Service reflect the way Repairo Moto business works, the laws that apply to our company, and certain things we've always believed to be true...
                        </p>

                        {/* Summary List */}
                        <ul className="space-y-3">
                            {[
                                "What you can expect from us...",
                                "What we expect from you...",
                                "Content in Repairo Moto services...",
                                "In case of problems or disagreements..."
                            ].map((item, index) => (
                                <li key={index} className="flex">
                                    <div className="mr-3 text-blue-600">•</div>
                                    <div>{item}</div>
                                </li>
                            ))}
                        </ul>

                        <p className="font-medium mt-6">
                            Understanding these terms is important because, to use our services, you must accept these terms.
                        </p>

                        {/* Section 1 */}
                        <div className="pt-4 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">1. Services Offered</h2>
                            <p>
                                Repairo Moto provides doorstep two-wheeler servicing and repair...
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900">2. Booking & Service Process</h2>
                            <ul className="space-y-2">
                                {[
                                    "Book via our website, WhatsApp, or approved channels.",
                                    "Service is confirmed based on mechanic availability.",
                                    "Ensure proper access and safety at your address.",
                                    "Delays may occur due to traffic or weather."
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h2 className="text-xl font-semibold text-gray-900">3. Pricing & Payments</h2>
                            <ul className="space-y-2">
                                {[
                                    "Prices are confirmed at booking and may vary.",
                                    "Additional charges require approval before work proceeds.",
                                    "Payments accepted via UPI, cash, or online mode.",
                                    "Invoices are provided digitally post service."
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            {/* Inserted Sections 4–10 Below */}
                            <h2 className="text-xl font-semibold text-gray-900 pt-4">4. Cancellations and Refunds</h2>
                            <ul className="space-y-2">
                                {[
                                    "User Cancellations: You may cancel your booking up to 5 hours before the scheduled appointment without penalty.",
                                    "Last-Minute Cancellation: Cancellations made within 5 hours of the appointment time will incur a nominal fee, which will be added to your next booking.",
                                    "Service Failure Refund: If we fail to provide service due to our fault, a full refund or rescheduling will be offered."
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h2 className="text-xl font-semibold text-gray-900 pt-4">5. Warranty and Liability</h2>
                            <ul className="space-y-2">
                                {[
                                    "Service Warranty: We offer a 15-day warranty on the services we perform.",
                                    "Parts Warranty: We do not offer warranty on spare parts or any products provided.",
                                    "Exclusions: Warranty does not cover damage due to misuse, accidents, or modifications by third parties.",
                                    "Liability: Repairo Moto is not liable for any indirect or consequential loss. Liability is limited to the amount paid for the specific service."
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h2 className="text-xl font-semibold text-gray-900 pt-4">6. User Responsibilities</h2>
                            <ul className="space-y-2">
                                {[
                                    "Ensure accurate vehicle information and location are provided.",
                                    "Cooperate with our staff during service.",
                                    "Do not engage in any activity that could compromise safety or violate applicable laws."
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h2 className="text-xl font-semibold text-gray-900 pt-4">7. Data Privacy</h2>
                            <p>
                                We collect and process your personal information in accordance with our <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a>. By using our services, you consent to this collection and use.
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900 pt-4">8. Intellectual Property</h2>
                            <p>
                                All content, logos, and branding related to Repairo Moto are the intellectual property of the company and may not be used without written permission.
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900 pt-4">9. Changes to Terms</h2>
                            <p>
                                Repairo Moto reserves the right to update these Terms at any time. Changes will be effective upon posting on our website. Continued use of services after changes constitutes acceptance.
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900 pt-4">10. Contact</h2>
                            <p>
                                For any questions, complaints, or legal notices, please contact:<br />
                                <strong>Repairo Moto</strong><br />
                                Number 5C, 5C, 12, Boring Rd, Sri Krishna Puri, Patna, Bihar 800013<br />
                                Email: <a href="mailto:support@repairmoto.com" className="text-blue-600 underline">support@repairmoto.com</a><br />
                                Phone: <a href="tel:9229207021" className="text-blue-600 underline">9229207021</a>
                            </p>
                        </div>

                        {/* Final Note */}
                        <p className="mt-6">
                            Besides these terms, we also publish a Privacy Policy...
                        </p>

                        {/* Download Button */}
                        <div className="pt-8">
                            <a
                                href="/pdf/RepairoMoto_TermsAndConditions.pdf"
                                download="RepairoMoto_TermsAndConditions.pdf"
                                className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                            >
                                <Download className="mr-2" size={18} />
                                Download Terms & Conditions
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
