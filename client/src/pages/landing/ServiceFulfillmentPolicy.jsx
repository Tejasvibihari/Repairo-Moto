import React from "react";
import { Download } from "lucide-react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function ServiceFulfillmentPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Service Fulfillment Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Service Fulfillment Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">OPERATIONS</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Service Fulfillment Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                        <p className="text-gray-600">
                            This policy defines how Repairo Moto fulfills service requests, manages mechanic deployment, handles service modifications, and ensures quality control. It applies to all customers using our platform.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-gray-700">

                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Service Availability &amp; Coverage</h2>
                            <ul className="space-y-2">
                                {[
                                    "Geographic Scope: Services are currently available in Patna and selected operational areas.",
                                    "Expansion Policy: We may expand to new areas from time to time. Check the app to confirm service availability in your area.",
                                    "Seasonal Availability: All services are available year-round, subject to force majeure conditions (natural disasters, lockdowns, etc.).",
                                    "Unavailable Areas: If your location is outside our service area, booking will not be allowed, and the app will show 'Service Not Available'.",
                                    "Verification: Location is verified via GPS coordinates during booking.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Service Types &amp; Scope</h2>
                            <p className="mb-3">Repairo Moto provides the following services:</p>
                            <ul className="space-y-2">
                                {[
                                    "Bike Repair: Engine repair, transmission issues, frame damage assessment.",
                                    "Bike Servicing: Regular maintenance, oil changes, filter replacements, fluid top-ups.",
                                    "Emergency Breakdown Assistance: Roadside towing, temporary fixes, emergency vehicle recovery.",
                                    "Tyre & Puncture Service: Puncture repair, tyre replacement, balancing, alignment.",
                                    "Battery Service: Battery replacement, terminal cleaning, charging.",
                                    "Electrical Repairs: Starter issues, alternator problems, wiring issues.",
                                    "Brake Service: Brake pad replacement, rotor grinding, brake fluid service.",
                                    "Suspension Repairs: Shock absorber replacement, spring issues, alignment.",
                                    "Spare Parts Replacement: Supply and installation of OEM and aftermarket parts.",
                                    "Washing &amp; Detailing: Basic wash, deep clean, protective coating.",
                                    "Pickup &amp; Drop Service: Vehicle transport to/from service location.",
                                    "Roadside Assistance (RSA): 24/7 emergency support for stranded vehicles.",
                                    "Inspection-Only Service: Diagnostic inspection without repair (chargeable).",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Booking & Mechanic Assignment</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 Booking Process</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "1. Select Service: Choose service type from the app.",
                                    "2. Provide Details: Enter bike brand, model, issue description, and service address.",
                                    "3. Quote Generation: Estimated price is displayed (indicative).",
                                    "4. Confirm Booking: Tap 'Confirm' to create the booking. No payment is due at this stage.",
                                    "5. Mechanic Assignment: Within 5–10 minutes, a mechanic is assigned and notified.",
                                    "6. Driver Dispatch: Mechanic begins travel to your location.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 Estimated Time of Arrival (ETA)</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "ETA Display: Real-time ETA is shown in the app based on current mechanic location.",
                                    "ETA Accuracy: ETA may vary by ±10 minutes depending on traffic and road conditions.",
                                    "Updated ETA: ETA updates in real-time as mechanic approaches.",
                                    "Late Mechanic Notification: If mechanic is running >20 minutes late, you will receive a notification.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. On-Site Service Execution</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Mechanic Arrival</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Arrival Notification: You receive an SMS/in-app notification when mechanic arrives.",
                                    "Identification: Mechanic displays ID card and vehicle registration details.",
                                    "Vehicle Location: Customer must point out the vehicle to the mechanic.",
                                    "Access: Customer must unlock the vehicle or provide access keys to mechanic.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 OTP #1 (Service Authorization)</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Purpose: Confirms that the customer authorizes the mechanic to begin work.",
                                    "Timing: Sent just before work begins.",
                                    "Validity: 15 minutes. Customer must provide this OTP to the mechanic.",
                                    "Requirement: Mechanic cannot begin work without OTP entry.",
                                    "Evidence: OTP verification is logged as proof of authorization.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 Before-Repair Photo</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Mandatory: Mechanic takes a photo of the vehicle/component BEFORE starting repair.",
                                    "Documentation: Photo is timestamped and logged in the system.",
                                    "Dispute Prevention: Serves as evidence for warranty and damage claims.",
                                    "Retention: Stored for 7 days after service completion.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.4 Vehicle Inspection &amp; Diagnosis</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Initial Assessment: Mechanic inspects the vehicle and identifies issues.",
                                    "Diagnostic Fee: Inspection charge (₹0–₹300) is incurred regardless of whether repair proceeds.",
                                    "Quote Generation: Revised quote is generated based on findings.",
                                    "Quote Approval: Customer MUST approve the revised quote before work commences.",
                                    "Price Transparency: Customer is informed of the exact cost before work begins.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.5 Repair Execution</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Quality Standards: All repairs are performed by trained, employed mechanics of Repairo Moto.",
                                    "Tools &amp; Parts: Mechanic uses appropriate tools, genuine parts, and best-practice techniques.",
                                    "Safety: All safety measures are followed; customer should maintain safe distance during work.",
                                    "Updates: Mechanic provides periodic updates on repair progress.",
                                    "Additional Charges: Any additional parts or labour charges must be approved by customer before proceeding.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.6 Service Completion &amp; After-Repair Photo</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Testing: Mechanic tests the repaired component to ensure functionality.",
                                    "After Photo: Photo of the vehicle/component is taken AFTER repair completion.",
                                    "Timestamped: Photo is logged with timestamp for record.",
                                    "Invoice Generation: Admin generates official invoice with itemized charges.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.7 OTP #2 (Service Completion)</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Purpose: Confirms service completion and customer acknowledgment.",
                                    "Timing: Sent after work is fully completed.",
                                    "Validity: 15 minutes.",
                                    "Requirement: Customer provides OTP to mechanic; mechanic enters in system.",
                                    "Invoice Trigger: Payment request is triggered after OTP #2 verification.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment &amp; Invoice</h2>
                            <ul className="space-y-2">
                                {[
                                    "Timing: Payment request is sent after OTP #2 verification.",
                                    "Eligible Payment Methods: Razorpay (online), cash payment.",
                                    "Invoice: Digital invoice is generated and available in My Bookings.",
                                    "GST Invoice: Business account customers receive GST-compliant invoices.",
                                    "Payment Confirmation: Receipt and invoice are sent via email and SMS.",
                                    "No Cash Handling: Cash is handled securely; customer can request receipt immediately.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Dynamic Pricing & Quote Adjustments</h2>
                            <ul className="space-y-2">
                                {[
                                    "Pre-Booking Estimate: Initial quote provided during booking is INDICATIVE only.",
                                    "Inspection-Based Pricing: Final pricing is determined after physical inspection.",
                                    "Quote Changes: If final quote is HIGHER than initial estimate, customer approval is required.",
                                    "Customer Protection: Work will NOT commence without customer approval of revised quote.",
                                    "Lower Quotes: If final quote is LOWER than initial, customer pays the lower amount (no disputes).",
                                    "Additional Parts: Any additional parts discovered during repair require customer approval + quote amendment.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Service Delays &amp; Rescheduling</h2>
                            <ul className="space-y-2">
                                {[
                                    "Mechanic Delayed >30 mins: Automatic ₹50–100 discount is applied to the final invoice.",
                                    "Customer Reschedule: If customer requests to reschedule, a new booking is created with new slot.",
                                    "No-Show by Customer: If customer is unavailable at the scheduled time without notice, booking is marked as 'No-Show' after 30 minutes wait.",
                                    "No-Show Charges: Inspection fee (₹100–200) may be charged for no-show bookings.",
                                    "Rescheduling via App: Customer can reschedule directly in the app before mechanic arrives.",
                                    "Rescheduling via Support: Contact support for complex rescheduling requests.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Quality Assurance &amp; Inspection</h2>
                            <ul className="space-y-2">
                                {[
                                    "Post-Service Follow-up: Customers may receive a follow-up call within 24 hours to verify satisfaction.",
                                    "Photo Evidence: Before/after photos are used for quality verification and dispute resolution.",
                                    "Mechanic Ratings: Customers can rate mechanics (1–5 stars) after service completion.",
                                    "Quality Review: Low-rated services are reviewed internally for quality control.",
                                    "Poor Performance: Mechanics with consistently low ratings are retrained or removed.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Customer Responsibilities</h2>
                            <ul className="space-y-2">
                                {[
                                    "Accurate Information: Provide correct bike details, service address, and issue description.",
                                    "Vehicle Access: Ensure the vehicle is accessible and unlocked when mechanic arrives.",
                                    "Presence: Customer should be present or nominate an authorized representative.",
                                    "OTP Security: Do not share OTPs with unauthorized persons.",
                                    "Quote Approval: Approve revised quotes before work commences.",
                                    "Payment Settlement: Pay invoices promptly after service completion.",
                                    "Warranty Reporting: Report warranty issues within 15 days of service completion.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Force Majeure &amp; Service Interruptions</h2>
                            <ul className="space-y-2">
                                {[
                                    "Unforeseen Events: Natural disasters, pandemics, lockdowns, or government restrictions may delay or prevent service.",
                                    "Cancellation: In such cases, bookings may be cancelled with full refund by Repairo Moto.",
                                    "Notification: Customers will be notified immediately of service interruptions.",
                                    "Rescheduling: Services will resume as soon as conditions permit.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Service Records &amp; History</h2>
                            <ul className="space-y-2">
                                {[
                                    "Service History: All service records are stored in the app under 'My Bookings'.",
                                    "Invoice Retention: Invoices are permanently retained for tax and warranty purposes.",
                                    "Service Documentation: Photos, timestamps, and service notes are archived.",
                                    "Download: Customers can download invoices and service reports anytime.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Dispute Resolution</h2>
                            <ul className="space-y-2">
                                {[
                                    "First Contact: Report any issues immediately to support@repairomoto.in.",
                                    "Investigation: Repairo Moto investigates service quality disputes within 5–7 business days.",
                                    "Resolution: Issues are resolved fairly based on evidence (photos, service logs, timestamps).",
                                    "Appeals: If unsatisfied, escalate to the Grievance Officer within 7 days.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact & Support</h2>
                            <p>
                                For service-related inquiries:<br />
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
                            This Service Fulfillment Policy ensures transparent, quality-driven service delivery. All customers are expected to follow this policy for optimal service experience.
                        </p>

                        {/* Download Button */}
                        <div className="pt-8">
                            <a
                                href="/pdf/RepairoMoto_ServiceFulfillmentPolicy.pdf"
                                download="RepairoMoto_ServiceFulfillmentPolicy.pdf"
                                className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                            >
                                <Download className="mr-2" size={18} />
                                Download Service Fulfillment Policy
                            </a>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
