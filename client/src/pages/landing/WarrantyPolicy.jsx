import React from "react";
import { Download } from "lucide-react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function WarrantyPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Warranty Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Warranty Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">GUARANTEE</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Warranty Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                        <p className="text-gray-600">
                            Repairo Moto stands behind the quality of our workmanship. This Warranty Policy outlines the terms of coverage for repair services performed by our mechanics and the process for claiming warranty benefits.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-gray-700">

                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Workmanship Warranty Coverage</h2>
                            <ul className="space-y-2">
                                {[
                                    "Duration: 15 calendar days from the date of service completion.",
                                    "Coverage Scope: Defects in labour and workmanship quality directly caused by the repair work performed by our mechanics.",
                                    "Applicable Services: All repair services including engine repairs, suspension work, electrical repairs, brake repairs, and similar mechanical work.",
                                    "Single Component: Warranty applies to the specific component or system repaired, not the entire vehicle.",
                                    "Excluded: Warranty does NOT cover spare parts, even if supplied by Repairo Moto.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. What IS Covered</h2>
                            <p className="mb-3">The following issues are eligible for warranty claims:</p>
                            <ul className="space-y-2">
                                {[
                                    "Poor Workmanship: Repair completed incorrectly, causing the same problem to recur within 15 days.",
                                    "Quality Defects: Parts improperly installed, missing fasteners, or connections not secured.",
                                    "Insufficient Repair: Repair work incomplete or not addressing the root cause of the issue.",
                                    "Premature Failure: Component fails within 15 days due to defects in repair quality (not manufacturing defect).",
                                    "Example: Engine develops knocking sounds 5 days after repair due to improper assembly = WARRANTY ELIGIBLE.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. What is NOT Covered</h2>
                            <p className="mb-3"><strong>Warranty explicitly DOES NOT cover:</strong></p>
                            <ul className="space-y-2">
                                {[
                                    "Spare Parts: NO warranty on spare parts, components, or accessories supplied with the service.",
                                    "Accidental Damage: Damage caused by accident, collision, or impact after service completion.",
                                    "Misuse or Negligence: Damage from customer misuse, overloading, or failure to follow maintenance instructions.",
                                    "Wear and Tear: Normal wear of components, degradation due to age or usage.",
                                    "Unrelated Failures: Failure of other components or systems not involved in the original repair.",
                                    "Third-Party Interference: Repairs, modifications, or interference by mechanics outside Repairo Moto.",
                                    "Electrical Faults: Electrical system issues unrelated to the serviced component.",
                                    "External Factors: Damage from environmental conditions (rust, water ingress, extreme heat/cold).",
                                    "Driver Behaviour: Issues resulting from harsh driving, improper vehicle handling, or failure to follow operational guidelines.",
                                    "Missing Preventive Maintenance: Damage from lack of regular maintenance (oil changes, fluid top-ups, etc.).",
                                    "Claims After 15 Days: Issues reported more than 15 days after service completion.",
                                    "Cosmetic Issues: Surface scratches, paint chips, or minor cosmetic defects.",
                                    "OEM Parts Warranty: Manufacturer defects in OEM spare parts (handled by manufacturer, not Repairo Moto).",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Warranty Claim Process</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 1: Report Within 15 Days</h3>
                            <p className="mb-3">
                                Contact Repairo Moto immediately upon discovering an issue. Claims must be reported within 15 calendar days of service completion.
                            </p>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Email: repairomoto@gmail.com",
                                    "Phone: +91 9229207021",
                                    "In-App: Tap 'My Bookings' → Select booking → 'Raise Warranty Claim'",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 2: Provide Documentation</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Booking ID: Original booking reference number.",
                                    "Description: Detailed explanation of the issue.",
                                    "Photographic Evidence: Photos/video of the problem (if visible).",
                                    "Service Timeline: When the problem first appeared.",
                                    "Vehicle Condition: Current mileage and usage since repair.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 3: Investigation</h3>
                            <p className="mb-3">
                                Our team will review the claim, analyze before/after images from the original service, and assess eligibility. Investigation period: 5–7 business days.
                            </p>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 4: Resolution</h3>
                            <p>
                                If the claim is approved, we will offer one of the following solutions at our discretion:
                            </p>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Free Redo: Mechanic redoes the repair at no cost.",
                                    "Component Replacement: Replaces the component with a new one at no cost.",
                                    "Partial Compensation: Issues resolved without full redo; reasonable compensation offered.",
                                    "Service Credit: Store credit for future bookings.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Denied Claims</h2>
                            <ul className="space-y-2">
                                {[
                                    "Claim Denial Reasons: Warranty denial is issued if the issue falls outside coverage (accidental damage, wear & tear, misuse, unrelated failure, or third-party interference detected).",
                                    "Evidence-Based: Denial is supported by photographic evidence, service records, and expert assessment.",
                                    "Notification: You will be notified in writing with reasons for denial.",
                                    "Appeals: You may appeal within 7 days by providing additional evidence.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Spare Parts — NO Warranty</h2>
                            <ul className="space-y-2">
                                {[
                                    "Zero Parts Warranty: Repairo Moto provides NO warranty on spare parts, accessories, or components supplied during service.",
                                    "Manufacturer Warranty: Some spare parts may carry manufacturer's warranty; contact the parts manufacturer directly.",
                                    "Parts Defects: Manufacturing defects in parts are the responsibility of the parts supplier/manufacturer.",
                                    "Installation vs. Parts: Our workmanship warranty covers installation quality only, not the part itself.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Warranty Claim Fees</h2>
                            <ul className="space-y-2">
                                {[
                                    "Free Processing: No fee to file or process a warranty claim.",
                                    "Free Inspection: Inspection for warranty validity is free.",
                                    "Free Redo (If Approved): Approved warranty claims receive free repair redo or component replacement.",
                                    "Rejected Claims: If claim is denied, diagnostic fee of ₹200–500 may apply (charged only for denied claims at mechanic's discretion).",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Warranty Claim Timing</h2>
                            <ul className="space-y-2">
                                {[
                                    "15-Day Window: All warranty claims must be filed within 15 calendar days of service completion.",
                                    "Last Day Filing: Claims filed on day 15 at 11:59 PM are accepted; claims filed on day 16 are rejected.",
                                    "Issue Discovery vs. Claim Filing: If you discover an issue on day 10 but file the claim on day 14, it is valid. Issue timing matters.",
                                    "Delayed Filing: Late claims (after 15 days) are automatically rejected regardless of when the issue appeared.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Fraudulent Claims</h2>
                            <ul className="space-y-2">
                                {[
                                    "False Claims Rejected: Claims proven to be false, misleading, or fraudulent are immediately rejected.",
                                    "Consequences: Fraudulent claims may result in account suspension or permanent ban.",
                                    "Evidence Review: Before/after images and service logs are reviewed for signs of fraud.",
                                    "Example of Fraud: Claiming damage to a different vehicle system as being caused by our repair.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Warranty &amp; Third-Party Repairs</h2>
                            <ul className="space-y-2">
                                {[
                                    "Warranty Void if Modified: If you take the vehicle to another mechanic before filing a warranty claim, warranty is VOID.",
                                    "Evidence Inspection: We will inspect the vehicle to determine if third-party work was performed.",
                                    "Protective Measure: This protects warranty integrity and prevents false claims.",
                                    "Correct Process: File warranty claim FIRST; do not perform additional repairs until claim is resolved.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Warranty &amp; Multiple Bookings</h2>
                            <ul className="space-y-2">
                                {[
                                    "Independent Warranties: Each booking has its own 15-day warranty period.",
                                    "Not Cumulative: Warranties do not stack or carry over between bookings.",
                                    "New Repair = New Warranty: If you book another service 10 days after the first, the second service gets a fresh 15-day warranty from its completion date.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Limit of Liability</h2>
                            <ul className="space-y-2">
                                {[
                                    "Maximum Compensation: Warranty claim compensation shall not exceed the original service charge paid.",
                                    "Example: If you paid ₹2,000 for engine repair and have a warranty claim, maximum compensation is ₹2,000.",
                                    "No Consequential Damages: Repairo Moto is not liable for indirect damages (loss of vehicle use, transportation costs, lost income, etc.).",
                                    "No Punitive Damages: Warranty does not cover punitive or exemplary damages.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Warranty Claim Appeals</h2>
                            <ul className="space-y-2">
                                {[
                                    "Appeal Deadline: Appeals must be submitted within 7 days of claim denial.",
                                    "Escalation Contact: Email repairomoto@gmail.com with booking ID and supporting documentation.",
                                    "Review by Grievance Officer: An independent review will be conducted.",
                                    "Final Decision: Grievance officer's decision is binding.",
                                    "Further Recourse: If unsatisfied, pursue legal remedies under applicable Indian law.",
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
                                For warranty claims or inquiries:<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Phone:{" "}
                                <a href="tel:+919229207021" className="text-blue-600 underline">+91 9229207021</a><br />
                                In-App: My Bookings → 'Raise Warranty Claim'<br />
                                Support Hours: Monday–Saturday, 9:00 AM–7:00 PM IST<br />
                                Address: 5C/12 Manna Singh Lane, Vivekanand Marg, North S.K Puri, Boring Road, Patna - 800013, Bihar, India
                            </p>
                        </div>

                        {/* Final Note */}
                        <p className="text-gray-500 text-sm mt-6">
                            This Warranty Policy is binding and exclusive. It supersedes all other warranties (express or implied) not explicitly stated herein. Warranty claims are processed fairly and transparently based on evidence and service records.
                        </p>

                        {/* Download Button */}
                        <div className="pt-8">
                            <a
                                href="/pdf/RepairoMoto_WarrantyPolicy.pdf"
                                download="RepairoMoto_WarrantyPolicy.pdf"
                                className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                            >
                                <Download className="mr-2" size={18} />
                                Download Warranty Policy
                            </a>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
