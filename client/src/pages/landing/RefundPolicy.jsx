import React from "react";
import { Download } from "lucide-react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function RefundPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Refund &amp; Cancellation Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Refund & Cancellation Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">POLICY</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Refund &amp; Cancellation Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                        <p className="text-gray-600">
                            This policy outlines the cancellation and refund terms applicable to services booked through Repairo Moto. Please read this carefully to understand your rights and obligations.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-gray-700">

                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Booking &amp; Payment Structure</h2>
                            <ul className="space-y-2">
                                {[
                                    "No Upfront Fee: Repairo Moto does NOT charge an upfront booking fee.",
                                    "Payment After Service: Customers pay ONLY after service is verified and an invoice is generated.",
                                    "OTP Verification: Payment is initiated after the customer enters OTP #2 (completion verification).",
                                    "Cost Components: Invoice includes: inspection charge (if applicable), labour charge, parts charge (if any), and GST.",
                                    "Zero Advance Model: Since there is no advance payment, standard refund flows do not apply.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Cancellation Eligibility</h2>
                            <p className="mb-3"><strong>Cancellations are permitted ONLY before mechanic is assigned.</strong></p>
                            <ul className="space-y-2">
                                {[
                                    "Before Mechanic Assignment: Customer can cancel with full refund (if any pre-payment made).",
                                    "After Mechanic Assignment: Cancellation NOT permitted.",
                                    "After Mechanic Dispatch: Cancellation NOT permitted.",
                                    "After Mechanic Arrival: Cancellation NOT permitted.",
                                    "After Work Begins: Cancellation NOT permitted.",
                                    "After Service Completion: Cancellation NOT permitted. Quality concerns must be raised via Warranty Policy.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cancellation Request Process</h2>
                            <ul className="space-y-2">
                                {[
                                    "via App: Click 'Cancel Booking' in My Bookings section (only if eligible).",
                                    "via Email: Send cancellation request to repairomoto@gmail.com with booking ID.",
                                    "via Phone: Call +91 9229207021 during support hours (Mon–Sat, 9 AM–7 PM IST).",
                                    "Timeframe: Cancellations must be requested within 24 hours of booking for validity.",
                                    "Confirmation: You will receive cancellation confirmation via SMS and email.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Refund Processing for Eligible Cancellations</h2>
                            <ul className="space-y-2">
                                {[
                                    "Eligibility: Only cancellations before mechanic assignment are refundable.",
                                    "Refund Amount: Full amount of any pre-paid fees or advance payments.",
                                    "Processing Time: 5–7 business days to the original payment method (UPI or bank account).",
                                    "Bank Processing: Additional 2–3 business days may be required depending on your bank.",
                                    "Razorpay Disputes: If refund is not received, contact Razorpay's customer support with transaction ID.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Non-Cancellable Scenarios</h2>
                            <p className="mb-3">The following scenarios are NOT cancellable and NO refund is provided:</p>
                            <ul className="space-y-2">
                                {[
                                    "After Mechanic Assignment: Mechanic has been assigned to your booking.",
                                    "After Work Commencement: Inspection or repair work has started.",
                                    "Service Completed: Service has been completed and OTP #2 has been verified.",
                                    "Customer No-Show: Customer is not available at the service location at the scheduled time without prior notice.",
                                    "Fraudulent Bookings: Bookings made with false information, false vehicle details, or fraudulent intent are non-refundable.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Inspection Charge Policy</h2>
                            <p className="mb-3"><strong>IMPORTANT: Inspection charges are non-refundable even if the customer rejects the repair.</strong></p>
                            <ul className="space-y-2">
                                {[
                                    "Inspection is Chargeable: ₹0–₹300 (varies by service type and location).",
                                    "Payable Even If Repair Rejected: If the customer examines the vehicle after inspection and declines the repair quote, the inspection charge is still applicable.",
                                    "Why Non-Refundable: Inspection involves mechanic travel, vehicle diagnosis, and professional assessment.",
                                    "Invoice Generated: An inspection invoice is generated even if no further work is done.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Repairo Moto-Initiated Cancellations</h2>
                            <p className="mb-3">In rare cases, Repairo Moto may cancel a booking. Full refund is provided:</p>
                            <ul className="space-y-2">
                                {[
                                    "Force Majeure: Natural disaster, pandemic, government lockdown, or other unforeseeable events.",
                                    "Mechanic Unavailability: No mechanic available in the service area after repeated attempts.",
                                    "Technical Failure: Platform outage or system error preventing service delivery.",
                                    "Safety Concerns: Booking flagged as high-risk or involving unsafe conditions.",
                                    "System Error: Booking made in error due to platform glitch.",
                                    "Refund Timeline: Full refund within 5–7 business days.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Payment Disputes &amp; Chargebacks</h2>
                            <ul className="space-y-2">
                                {[
                                    "Report Within 7 Days: Payment disputes must be reported to repairomoto@gmail.com within 7 days of transaction.",
                                    "Evidence Required: Provide booking ID, transaction ID, and detailed explanation of the dispute.",
                                    "Investigation: Our team will investigate and respond within 5–7 business days.",
                                    "Chargeback Policy: Unauthorized chargeback disputes may result in account suspension and legal action.",
                                    "OTP Verification: Presence of OTP verification (OTP #1 and #2) is considered proof of customer authorization.",
                                    "Fraudulent Claims Rejected: Claims proven to be false or fraudulent will be rejected, and account may be terminated.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Promotional Credits &amp; Referral Rewards</h2>
                            <ul className="space-y-2">
                                {[
                                    "Non-Refundable: Promotional credits and referral rewards are NOT refundable or convertible to cash.",
                                    "Use on Bookings: Credits can be used to offset invoice amounts on future bookings.",
                                    "No Withdrawal: Credits cannot be withdrawn to your bank account or payment wallet.",
                                    "Full Payment Allowed: Credits can fully pay an invoice (₹0 payment due after credits applied).",
                                    "Expiration: Credits do NOT expire and remain valid indefinitely until used.",
                                    "Abuse Prevention: Misuse or creation of multiple accounts to generate credits will result in credit forfeiture and account suspension.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Quality Issues &amp; Warranty Claims</h2>
                            <p className="mb-3">For service quality concerns, please see our Warranty Policy:</p>
                            <ul className="space-y-2">
                                {[
                                    "NOT Refund-Eligible: Quality complaints are NOT treated as refundable issues.",
                                    "Warranty Claim Instead: Raise a warranty claim via My Bookings or email repairomoto@gmail.com.",
                                    "15-Day Window: Warranty claims must be filed within 15 days of service completion.",
                                    "Resolution Options: Redo of work, parts replacement, or compensation (as applicable).",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 11 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Account Suspension & Refund Restrictions</h2>
                            <ul className="space-y-2">
                                {[
                                    "Fraudulent Activity: Accounts involved in fraud, fake bookings, or chargeback abuse may be suspended.",
                                    "Suspended Account Refunds: Refunds to suspended accounts may be held pending investigation.",
                                    "Abuse of System: Multiple cancellations, referral fraud, or OTP misuse may result in refund denial.",
                                    "Banned Users: Permanently banned users forfeit all pending refunds and credits.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 12 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. GST & Business Accounts</h2>
                            <ul className="space-y-2">
                                {[
                                    "GST Invoice: Business account customers receive GST-compliant invoices.",
                                    "Refund Processing: GST refunds include the full invoice amount including GST.",
                                    "Input Credit: GST input credit is at the discretion of the business customer for tax compliance.",
                                    "No Adjustment: Repairo Moto does not adjust input tax credit; customers must file their own tax returns.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Appeals & Escalation</h2>
                            <ul className="space-y-2">
                                {[
                                    "Appeal Deadline: Appeals to refund denial must be submitted within 7 days of rejection notification.",
                                    "Escalation: Submit appeals to repairomoto@gmail.com with booking ID and supporting evidence.",
                                    "Review Period: Our grievance team will review appeals within 10 business days.",
                                    "Final Decision: Decision by grievance officer is final and binding.",
                                    "Legal Recourse: If unsatisfied, you may pursue claims under applicable Indian law in the jurisdiction of Patna, Bihar.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 14 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contact & Support</h2>
                            <p>
                                For refund or cancellation inquiries:<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Phone:{" "}
                                <a href="tel:+919229207021" className="text-blue-600 underline">+91 9229207021</a><br />
                                Support Hours: Monday–Saturday, 9:00 AM–7:00 PM IST<br />
                                Address: 5C/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 800013, Bihar, India
                            </p>
                        </div>

                        {/* Final Note */}
                        <p className="text-gray-500 text-sm mt-6">
                            This Refund &amp; Cancellation Policy is binding and supersedes all prior policies. For conflicts between this policy and other Repairo Moto policies, this document takes precedence for refund and cancellation matters.
                        </p>

                        {/* Download Button */}
                        <div className="pt-8">
                            <a
                                href="/pdf/RepairoMoto_RefundCancellationPolicy.pdf"
                                download="RepairoMoto_RefundCancellationPolicy.pdf"
                                className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                            >
                                <Download className="mr-2" size={18} />
                                Download Refund &amp; Cancellation Policy
                            </a>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
