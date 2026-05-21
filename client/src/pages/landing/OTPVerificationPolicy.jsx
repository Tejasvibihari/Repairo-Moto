import React from "react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function OTPVerificationPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">OTP Verification Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'OTP Verification Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">SECURITY</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">OTP Verification Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                    </div>

                    <div className="space-y-8 text-gray-700">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Two-Factor OTP System</h2>
                            <p className="mb-3">Repairo Moto uses a two-factor OTP (One-Time Password) verification system to secure service transactions:</p>
                            <ul className="space-y-2">
                                {[
                                    "OTP 1: Sent before service commencement. Confirms customer authorization to begin work.",
                                    "OTP 2: Sent after service completion. Confirms customer acknowledgment of service completion.",
                                    "Security: OTPs are 6-digit numeric codes sent via SMS to registered mobile number.",
                                    "Encryption: All OTP communications are encrypted end-to-end.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. OTP 1 – Service Commencement Authorization</h2>
                            <ul className="space-y-2">
                                {[
                                    "Timing: Sent approximately 5 minutes before mechanic begins repair work.",
                                    "Validity: 15 minutes from issuance. OTP expires automatically.",
                                    "Purpose: Confirms you authorize the mechanic to commence repair work on your vehicle.",
                                    "Requirement: Mechanic cannot begin work without receiving the OTP from you.",
                                    "Evidence: Entry of OTP is logged as proof of your authorization.",
                                    "Legal Significance: OTP #1 verifies you explicitly permitted work initiation.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. OTP 2 – Service Completion Acknowledgment</h2>
                            <ul className="space-y-2">
                                {[
                                    "Timing: Sent immediately after mechanic completes repair and marks service as done.",
                                    "Validity: 15 minutes from issuance.",
                                    "Purpose: Confirms you acknowledge service completion and authorize payment processing.",
                                    "Requirement: Payment request triggers only after OTP #2 is entered.",
                                    "Evidence: Entry of OTP #2 is logged as proof of service completion acknowledgment.",
                                    "Legal Significance: OTP #2 verifies you accepted the completed work.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. OTP Security Best Practices</h2>
                            <ul className="space-y-2">
                                {[
                                    "NEVER Share OTPs: Do not share OTPs with anyone, even if they claim to be Repairo Moto staff.",
                                    "NEVER Disclose: Do not disclose OTPs in messages, emails, calls, or screenshots.",
                                    "Personal Authorization: OTPs are personal authorization codes. Sharing them forfeits your liability protection.",
                                    "Immediate Entry: Enter OTP immediately upon receipt; do not delay.",
                                    "Secure Device: Only enter OTPs on your personal, secure device.",
                                    "Beware of Phishing: Be cautious of phishing attempts requesting OTPs via fake calls or messages.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. OTP Expiry & Reissuance</h2>
                            <ul className="space-y-2">
                                {[
                                    "Auto-Expiry: All OTPs expire 15 minutes from issuance regardless of use.",
                                    "Reissuance: If OTP expires, request a new OTP via the app or call mechanic.",
                                    "Multiple Attempts: You may request up to 3 OTPs for a single service.",
                                    "Limit Protection: After 3 failed OTP attempts, service may be canceled to prevent abuse.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. OTP Misuse & Consequences</h2>
                            <ul className="space-y-2">
                                {[
                                    "Fraudulent OTP Entry: If you share OTP with unauthorized persons and they use it, you forfeit liability protection.",
                                    "Dispute Rejection: Claims of fraudulent charges made possible by OTP sharing will be rejected.",
                                    "Account Risk: Repeated OTP misuse may result in account suspension.",
                                    "Evidence: OTP entry is considered primary evidence of your authorization and service acknowledgment.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. OTP & Dispute Handling</h2>
                            <ul className="space-y-2">
                                {[
                                    "Dispute Basis: OTP entry is primary evidence in dispute cases.",
                                    "Burden of Proof: If you claim OTP was entered without authorization, the burden is on you to prove unauthorized access.",
                                    "Account Security: You are responsible for device security and OTP confidentiality.",
                                    "Legal Standing: OTP verification cannot be disputed if you personally entered the OTP.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Alternativ OTP Delivery</h2>
                            <ul className="space-y-2">
                                {[
                                    "SMS Delivery: Primary OTP delivery method via SMS to registered phone number.",
                                    "App Notification: OTPs also appear in app notifications for redundancy.",
                                    "Call if SMS Fails: If SMS fails, OTP may be delivered via automated voice call.",
                                    "Email Backup: OTP may be emailed to registered email address as additional backup.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Service in Absence of OTP</h2>
                            <ul className="space-y-2">
                                {[
                                    "Not Permitted: Mechanic cannot commence or complete service without proper OTP verification.",
                                    "Exception: In genuine emergencies (roadside breakdown), verification may occur post-service with customer consent.",
                                    "Post-Service Verification: If OTP is entered after service completion, service is considered verified.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact & Support</h2>
                            <p>
                                For OTP-related issues:<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Phone:{" "}
                                <a href="tel:+919229207021" className="text-blue-600 underline">+91 9229207021</a>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
