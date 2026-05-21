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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Terms &amp; Conditions</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Terms & Conditions' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">AGREEMENT</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Terms &amp; Conditions</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                        <p className="text-gray-600">
                            By downloading, registering on, or using the Repairo Moto mobile application or website, you agree to be bound by these Terms &amp; Conditions and all policies incorporated herein by reference, including our Privacy Policy, Refund Policy, and Warranty Policy. If you do not agree, do not use the Platform.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-gray-700">

                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Definitions</h2>
                            <ul className="space-y-2">
                                {[
                                    "\"Platform\" means the Repairo Moto application, website, and related services operated by Shantram Private Limited.",
                                    "\"User\" or \"Customer\" means any registered individual who books or requests services through the Platform.",
                                    "\"Mechanic\" means an employee of Shantram Private Limited trained to provide vehicle repair and maintenance services.",
                                    "\"Vendor\" means a spare parts supplier providing components through the Platform.",
                                    "\"Service\" means any vehicle repair, maintenance, inspection, or related job facilitated through the Platform.",
                                    "\"Order\" or \"Booking\" means a confirmed service request placed by a User.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
                            <p>
                                You must be at least 18 years of age and capable of entering a binding contract under applicable Indian law. By using the Platform, you represent and warrant that you meet these requirements.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration &amp; Security</h2>
                            <ul className="space-y-2">
                                {[
                                    "You must provide accurate, current, and complete information during registration.",
                                    "You are responsible for maintaining the confidentiality of your login credentials and OTP. Do not share OTPs with anyone, including persons claiming to be Repairo Moto representatives.",
                                    "You must notify us immediately at repairomoto@gmail.com if you suspect unauthorised access to your account.",
                                    "We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Services &amp; Bookings</h2>
                            <ul className="space-y-2">
                                {[
                                    "Repairo Moto is operated by Shantram Private Limited as a vehicle repair and maintenance service company. We directly employ and manage all mechanics who provide services.",
                                    "Services include bike repair, servicing, emergency breakdown assistance, battery replacement, tyre puncture repair, engine repair, oil change, washing, spare parts replacement, pickup/drop, and roadside assistance.",
                                    "Services are currently available in Patna and selected operational areas, with plans for future geographic expansion.",
                                    "Service descriptions, ETAs, and cost estimates displayed before booking are indicative. Final charges may vary upon physical inspection.",
                                    "Users must be present or ensure authorised access to the vehicle at the time of service.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 5 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Pricing &amp; Payments</h2>
                            <ul className="space-y-2">
                                {[
                                    "Pricing may include: fixed service charges, inspection charges, labour charges, parts charges, and applicable GST.",
                                    "All payments are to be made through the Platform via Razorpay or cash. We do not store payment card details.",
                                    "We use Razorpay PCI-DSS compliant payment gateway for online transactions. We do not store payment card information.",
                                    "Invoices / service receipts will be made available in the app after service completion. Business account customers receive GST invoices.",
                                    "In the event of a payment dispute, contact us within 7 days of the transaction at repairomoto@gmail.com.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 6 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cancellations &amp; Refunds</h2>
                            <p className="mb-3">Cancellation and refund rights are governed by our Refund &amp; Cancellation Policy. Key points:</p>
                            <ul className="space-y-2">
                                {[
                                    "Cancellations are permitted only before mechanic assignment to a booking.",
                                    "After mechanic assignment or dispatch, cancellations are not permitted.",
                                    "After service completion, no cancellation is possible. Quality issues must be raised under the Warranty Policy.",
                                    "For eligible cancellations, refunds of advance payments will be processed within 5–7 business days.",
                                    "Cancellation by Repairo Moto (force majeure, mechanic unavailability): Full refund of any advance payment.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 7 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Warranty &amp; Guarantees</h2>
                            <ul className="space-y-2">
                                {[
                                    "We offer a 15-day workmanship warranty on repair services.",
                                    "Warranty covers defects directly attributable to labour and workmanship quality during the original service.",
                                    "Warranty does NOT cover: accidental damage, misuse, negligence, wear and tear, third-party interference, or electrical faults unrelated to the serviced component.",
                                    "NO WARRANTY is provided on spare parts supplied through Repairo Moto.",
                                    "To claim warranty, raise an issue via My Bookings in the app or email repairomoto@gmail.com within 15 days of service completion.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 8 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. User Conduct</h2>
                            <p className="mb-3">You agree not to:</p>
                            <ul className="space-y-2">
                                {[
                                    "Provide false service requests, fraudulent payment information, or misleading vehicle details.",
                                    "Harass, threaten, or abuse any Service Partner or Repairo Moto personnel.",
                                    "Attempt to reverse-engineer, decompile, or interfere with the Platform's infrastructure.",
                                    "Use the Platform for any unlawful purpose or in violation of applicable law.",
                                    "Create multiple accounts to abuse referral credits or promotional offers.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 9 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Data Privacy &amp; OTP Security</h2>
                            <ul className="space-y-2">
                                {[
                                    "We collect and process your personal information in accordance with our Privacy Policy.",
                                    "We use two-factor OTP verification: OTP 1 authorizes service commencement, OTP 2 confirms service completion.",
                                    "OTP validity is 15 minutes. Never share OTPs with anyone.",
                                    "OTP misuse or sharing may result in disputes being rejected.",
                                    "We do not sell or share your personal data with third parties.",
                                    "We collect foreground location data only for service booking and dispatch purposes.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 10 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Intellectual Property</h2>
                            <p>
                                All content on the Platform, including the Repairo Moto logo, interface design, text, and software, is the property of Shantram Private Limited or its licensors and is protected under Indian copyright and trademark law. You may not reproduce, distribute, or create derivative works without prior written consent.
                            </p>
                        </div>

                        {/* Section 11 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Disclaimer of Warranties</h2>
                            <p>
                                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE". TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SHANTRAM PRIVATE LIMITED DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE SERVICE.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Limitation of Liability &amp; Damage Claims</h2>
                            <ul className="space-y-2">
                                {[
                                    "Shantram Private Limited's aggregate liability to any User shall not exceed the amount paid by the User for the specific service in question.",
                                    "We are not liable for indirect, incidental, consequential, or punitive damages.",
                                    "Damage claims must be supported by photographic evidence and submitted within 7 days of service completion.",
                                    "Before/after images uploaded by mechanics are considered primary evidence in damage disputes.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 13 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Governing Law &amp; Dispute Resolution</h2>
                            <p>
                                These Terms are governed by the laws of India. Any dispute shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction of courts in Patna, Bihar, India.
                            </p>
                        </div>

                        {/* Section 14 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Changes to Terms</h2>
                            <p>
                                Repairo Moto reserves the right to update these Terms at any time. Material amendments will be notified via in-app notification or email at least 7 days before taking effect. Continued use of the Platform after the effective date constitutes acceptance.
                            </p>
                        </div>

                        {/* Section 15 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Contact &amp; Grievance Officer</h2>
                            <p>
                                For any questions, complaints, or legal notices, please contact:<br />
                                <strong>Shantram Private Limited (Repairo Moto)</strong><br />
                                5C/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 800013, Bihar, India<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Phone:{" "}
                                <a href="tel:+919229207021" className="text-blue-600 underline">+91 9229207021</a><br />
                                Website:{" "}
                                <a href="https://repairomoto.in" className="text-blue-600 underline">https://repairomoto.in</a><br />
                                GSTIN: 10AAXCS3327A1ZO<br />
                                Support Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST<br />
                                Grievance Officer: Raushan Kumar, <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a>
                            </p>
                        </div>

                        {/* Final Note */}
                        <p className="text-gray-500 text-sm mt-6">
                            Besides these Terms, we also publish a{" "}
                            <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a>,{" "}
                            <a href="/refund-policy" className="text-blue-600 underline">Refund &amp; Cancellation Policy</a>, and{" "}
                            <a href="/warranty-policy" className="text-blue-600 underline">Warranty Policy</a> — all of which are incorporated into these Terms by reference.
                        </p>

                        {/* Download Button */}
                        <div className="pt-8">
                            <a
                                href="/pdf/RepairoMoto_TermsAndConditions.pdf"
                                download="RepairoMoto_TermsAndConditions.pdf"
                                className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                            >
                                <Download className="mr-2" size={18} />
                                Download Terms &amp; Conditions
                            </a>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}