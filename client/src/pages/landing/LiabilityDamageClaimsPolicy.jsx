import React from "react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function LiabilityDamageClaimsPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Liability &amp; Damage Claims Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Liability & Damage Claims' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">LEGAL</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Liability &amp; Damage Claims Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                    </div>

                    <div className="space-y-8 text-gray-700">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Liability Framework</h2>
                            <ul className="space-y-2">
                                {[
                                    "Operational Responsibility: Repairo Moto operates as a vehicle repair company and assumes operational responsibility for service quality.",
                                    "Employee Liability: All mechanics are employees of Shantram Private Limited; we assume full liability for their actions during service.",
                                    "Limited Liability: Liability is limited to reasonable compensation for documented damages caused during service delivery.",
                                    "No Unlimited Liability: We do not accept unlimited liability or compensation for all claims.",
                                    "Evidence-Based Assessment: All damage claims are assessed based on documented evidence (photos, service records, witness statements).",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Types of Damage Claims</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Mechanic-Caused Damage</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Direct Damage: Physical damage to the vehicle caused directly by mechanic actions (e.g., dropping tools, accidental impacts).",
                                    "Component Damage: Damage to vehicle components during repair work (e.g., breaking a bolt, stripping threads).",
                                    "Covered: Repairo Moto will compensate for mechanic-caused damage upon verification.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Pre-Existing Damage</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Not Covered: Damage that existed prior to service is not the liability of Repairo Moto.",
                                    "Verification: Before-repair images are used to verify pre-existing damage.",
                                    "Disclaimer: Customers must inform mechanics of pre-existing damage to avoid confusion.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Post-Service Damage (Not Caused by Repair)</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Not Covered: Damage occurring after service completion is not Repairo Moto's liability.",
                                    "Examples: Accident, collision, weather damage, theft, vandalism after service.",
                                    "Customer Responsibility: Customer assumes liability for vehicle post-service.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Damage Claim Process</h2>
                            <ul className="space-y-2">
                                {[
                                    "Immediate Reporting: Report damage to mechanic immediately upon discovery (before leaving service location if possible).",
                                    "Photo Documentation: Capture high-quality photos of the damage from multiple angles.",
                                    "File Claim Within 48 Hours: Submit damage claim within 48 hours of service completion at repairomoto@gmail.com.",
                                    "Booking ID Required: Include booking ID and detailed description of damage.",
                                    "Evidence Submission: Attach photos, repair estimates, and any witness statements.",
                                    "Investigation: Repairo Moto investigates claim within 5–7 business days.",
                                    "Evaluation: Damage is evaluated based on evidence and service records.",
                                    "Resolution: Approved claims result in compensation or repair authorization.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Compensation Limits</h2>
                            <ul className="space-y-2">
                                {[
                                    "Maximum Liability: Repairo Moto's liability for mechanic-caused damage shall not exceed the service charge paid.",
                                    "Example: If service cost ₹2,000 and mechanic causes ₹5,000 damage, compensation is limited to ₹2,000.",
                                    "Assessment: Damage repair cost does not exceed compensation limit.",
                                    "No Punitive Damages: No punitive or exemplary damages are paid.",
                                    "No Indirect Damages: No compensation for loss of vehicle use, rental costs, or lost income.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Evidence & Documentation</h2>
                            <ul className="space-y-2">
                                {[
                                    "Before-Repair Images: Primary evidence of vehicle condition before service.",
                                    "After-Repair Images: Primary evidence of vehicle condition after service.",
                                    "Repair Quotes: Obtain repair quotes from authorized third-party mechanics.",
                                    "Photos of Damage: Clear, timestamped photos showing the damage.",
                                    "Witness Statements: If available, statements from people present during service.",
                                    "Service Records: Mechanic notes and service logs are reviewed for context.",
                                    "Evidence Review: Claims lacking sufficient evidence may be denied.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. False Claims & Fraud</h2>
                            <ul className="space-y-2">
                                {[
                                    "Zero Tolerance: False or fraudulent damage claims are not tolerated.",
                                    "Detection: Claims are analyzed for inconsistencies or fabrication.",
                                    "Consequences: False claims result in immediate claim rejection and account suspension.",
                                    "Legal Action: Significant fraud may trigger legal action.",
                                    "Examples of Fraud: Submitting unrelated damage as mechanic-caused, inflated repair quotes, collusion with repair shops.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Resolution Options</h2>
                            <ul className="space-y-2">
                                {[
                                    "Option 1 - Direct Repair: Repairo Moto arranges repair with authorized mechanic at our cost.",
                                    "Option 2 - Compensation: Repairo Moto reimburses repair costs (capped at liability limit).",
                                    "Option 3 - Parts Replacement: Damaged components are replaced at Repairo Moto's cost.",
                                    "Customer Choice: Customer may choose preferred resolution option (within liability limit).",
                                    "Approval Required: All resolution options require Repairo Moto approval.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Denial & Appeals</h2>
                            <ul className="space-y-2">
                                {[
                                    "Denial Reasons: Claim denial is issued if evidence is insufficient or damage is not mechanic-caused.",
                                    "Written Notification: Denial is communicated in writing with specific reasons.",
                                    "Appeal Window: Appeals must be filed within 7 days of denial.",
                                    "Appeal Process: Submit appeal with additional evidence to repairomoto@gmail.com.",
                                    "Grievance Officer: Appeal is reviewed by independent grievance officer.",
                                    "Final Decision: Grievance officer's decision is final and binding.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Insurance & Third-Party Claims</h2>
                            <ul className="space-y-2">
                                {[
                                    "Insurance Notification: If the vehicle is insured, customer may file claim with insurer for mechanic-caused damage.",
                                    "Repairo Moto Liability: Repairo Moto is liable regardless of insurance status.",
                                    "Insurance Coordination: If insurer pays, customer should notify Repairo Moto to avoid duplicate compensation.",
                                    "Legal Liability: Repairo Moto does not provide insurance; customers are responsible for vehicle insurance.",
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
                                For damage claims:<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Phone:{" "}
                                <a href="tel:+919229207021" className="text-blue-600 underline">+91 9229207021</a><br />
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
