import React from "react";
import { Download } from "lucide-react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Privacy Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Privacy Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">PRIVACY</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Privacy Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                        <p className="text-gray-600">
                            Repairo Moto is committed to protecting your privacy. This Privacy Policy explains how Shantram Private Limited (trading as Repairo Moto) collects, uses, discloses, and safeguards your information when you use our mobile application, website, and services. Please read this policy carefully.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-gray-700">

                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">1.1 Information You Provide</h3>
                            <ul className="space-y-2">
                                {[
                                    "Full name",
                                    "Email address",
                                    "Mobile phone number",
                                    "Service address / delivery address",
                                    "Profile image / avatar",
                                    "Bike details (brand, model, registration number, VIN, colour, fuel type)",
                                    "GST registration number (if switching to business account)",
                                    "Business name and tax identification (if business account)",
                                    "Payment information (via Razorpay; we do not store card details)",
                                    "Support tickets and communication records",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">1.2 Information Collected Automatically</h3>
                            <ul className="space-y-2">
                                {[
                                    "Foreground location data: Collected ONLY when you actively request a service booking. Used for mechanic dispatch and service optimization.",
                                    "Device metadata: Device type, OS version, app version, unique device identifier",
                                    "Firebase Cloud Messaging tokens: For push notifications (booking updates, mechanic arrival, payment reminders, promotional alerts)",
                                    "Service timestamps: When you book, when mechanic is assigned, when mechanic arrives, when service starts, when service completes",
                                    "Service status logs: Service stage progression, OTP verification, cancellation reasons",
                                    "Image metadata: Before and after repair photos uploaded by mechanics (stored with timestamps and job IDs)",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">1.3 Camera & Location Permissions</h3>
                            <ul className="space-y-2">
                                {[
                                    "Camera: Used by customers for profile image uploads and by mechanics for before/after service documentation (images stored securely).",
                                    "Location (Foreground Only): Collected during active service booking to pinpoint your location for mechanic dispatch. NO continuous background tracking or passive surveillance.",
                                    "Notifications: Push notification tokens stored to send service updates, booking confirmations, and promotional messages.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <ul className="space-y-2">
                                {[
                                    "Service Delivery: Process your service requests, assign mechanics, track service progress, generate invoices",
                                    "OTP Verification: Use one-time passwords to verify your identity and service authorization (OTP 1 before work, OTP 2 after completion)",
                                    "Communication: Send service updates, booking confirmations, payment reminders, support responses, and appointment notifications",
                                    "Payment Processing: Process payments through Razorpay. We do not store sensitive card data.",
                                    "Business Account Management: Store GST details for business customers to generate compliant tax invoices",
                                    "Analytics & Improvement: Anonymized usage patterns to improve service quality, fix technical issues, optimize mechanic routing",
                                    "Marketing & Promotions: Send promotional offers, referral rewards notifications, and new feature announcements (opt-out available)",
                                    "Legal Compliance: Maintain tax records, audit logs, and invoice history as required by Indian law",
                                    "Dispute Resolution: Analyse booking history, images, and service records to fairly resolve complaints and warranty claims",
                                    "Fraud Prevention: Detect and prevent fraudulent bookings, payment fraud, referral abuse, and other suspicious activity",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Retention</h2>
                            <ul className="space-y-2">
                                {[
                                    "Service Images (Before/After): Retained for 7 days after order completion, then permanently deleted.",
                                    "Invoices & Payment Records: Retained indefinitely for tax and audit compliance (as per Indian GST and income tax rules).",
                                    "Account Information: Retained as long as your account remains active. Upon account deletion (via support request), personal identifying information is removed within 30 days, but invoice and tax records may be retained for legal compliance.",
                                    "Booking History: Retained for 2 years to handle dispute resolution and warranty claims.",
                                    "FCM Tokens & Device Identifiers: Retained while the app is installed; purged upon app uninstallation.",
                                    "Audit Logs: Retained for 1 year for security and compliance purposes.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
                            <ul className="space-y-2">
                                {[
                                    "Encryption: All data in transit is encrypted using HTTPS/TLS. Sensitive information is encrypted at rest.",
                                    "Payment Security: Payment processing is handled exclusively by Razorpay, a PCI-DSS compliant payment gateway. We do not store card data.",
                                    "Access Controls: Only authorized Repairo Moto personnel have access to customer data, and only for legitimate business purposes.",
                                    "Regular Audits: We conduct periodic security assessments and maintain logs of data access.",
                                    "No Third-Party Sales: We do NOT sell your personal data to third parties.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sharing of Information</h2>
                            <p className="mb-3">We share your information only as follows:</p>
                            <ul className="space-y-2">
                                {[
                                    "Mechanics (Employees): Your name, phone, service address, and bike details are shared with assigned mechanics to perform the booked service.",
                                    "Vendors: Spare parts suppliers may receive anonymized service details to fulfill parts orders (no personal identifying information shared).",
                                    "Payment Gateway: Your payment details are shared with Razorpay for transaction processing.",
                                    "Legal Authorities: If required by law, court order, or government request, we may disclose information.",
                                    "Third-Party Service Providers: We may use analytics platforms and cloud hosting providers (e.g., AWS) that process data under confidentiality agreements.",
                                    "NOT Shared: We do not share your data with marketing companies, data brokers, or unaffiliated third parties for commercial purposes.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights & Choices</h2>
                            <ul className="space-y-2">
                                {[
                                    "Access: You can view and download your personal data by logging into your account.",
                                    "Correction: You can update your profile information, bike details, and address anytime.",
                                    "Deletion: You may request account deletion by emailing repairomoto@gmail.com. Certain records (invoices, tax documents) may be retained for legal compliance.",
                                    "Opt-Out of Marketing: You can opt out of promotional emails and SMS via account settings or by replying to promotional messages.",
                                    "Location Permissions: You can revoke foreground location permissions at any time via device settings; however, this may affect service booking accuracy.",
                                    "Notification Preferences: Manage notification settings in the app (service notifications cannot be disabled as they are critical).",
                                    "Data Portability: Upon request, we can provide your data in a structured, portable format.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. OTP & Verification Security</h2>
                            <ul className="space-y-2">
                                {[
                                    "Two-Factor OTP: Repairo Moto uses OTP (one-time passwords) for service verification:",
                                    "OTP 1 (Before Service): Sent to your phone before mechanics begins work. Entering OTP confirms you authorize work to commence.",
                                    "OTP 2 (After Service): Sent after service completion. Entering OTP confirms you acknowledge service completion.",
                                    "OTP Validity: 15 minutes from issuance. OTPs expire automatically and cannot be reused.",
                                    "Misuse Consequences: Sharing OTPs with unauthorized persons may result in fraudulent claims being rejected and account suspension.",
                                    "Never Share OTPs: Repairo Moto personnel will never ask for your OTP. Do not share with anyone.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
                            <p>
                                Repairo Moto is not designed for children under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal information, we will delete such information immediately and terminate the minor's account.
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies & Tracking Technologies</h2>
                            <p className="mb-3">Our website and app use cookies and similar technologies:</p>
                            <ul className="space-y-2">
                                {[
                                    "Session Cookies: Maintain your login session and remember preferences.",
                                    "Analytics Cookies: Track user behaviour to improve app performance and user experience (anonymized).",
                                    "Marketing Cookies: Remember your referral source and track promotional campaign effectiveness.",
                                    "Cookie Control: You can disable cookies in your browser settings; however, this may affect app functionality.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Third-Party Links & Services</h2>
                            <p>
                                Our Platform may contain links to third-party websites (e.g., Razorpay for payments). We are not responsible for the privacy practices of third-party services. Please review their privacy policies independently. This Privacy Policy applies only to Repairo Moto services.
                            </p>
                        </div>

                        {/* Section 11 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Material changes will be notified via in-app notification or email at least 7 days before taking effect. Your continued use of the Platform after the effective date constitutes acceptance of the updated policy.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact &amp; Data Protection Officer</h2>
                            <p>
                                If you have privacy concerns, data requests, or wish to exercise your rights, please contact:<br />
                                <strong>Shantram Private Limited (Repairo Moto)</strong><br />
                                5C/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 800013, Bihar, India<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Phone:{" "}
                                <a href="tel:+919229207021" className="text-blue-600 underline">+91 9229207021</a><br />
                                GSTIN: 10AAXCS3327A1ZO<br />
                                Data Protection Contact: Raushan Kumar, <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a>
                            </p>
                        </div>

                        {/* Final Note */}
                        <p className="text-gray-500 text-sm mt-6">
                            This Privacy Policy is part of our Terms &amp; Conditions and is binding upon acceptance. For complaints, please contact our Grievance Officer or reach out to us at the contact details above.
                        </p>

                        {/* Download Button */}
                        <div className="pt-8">
                            <a
                                href="/pdf/RepairoMoto_PrivacyPolicy.pdf"
                                download="RepairoMoto_PrivacyPolicy.pdf"
                                className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                            >
                                <Download className="mr-2" size={18} />
                                Download Privacy Policy
                            </a>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
