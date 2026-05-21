import React from "react";
import { Download } from "lucide-react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function ReferralRewardsPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Referral Rewards Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Referral Rewards Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">PROMOTIONS</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Referral Rewards Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                        <p className="text-gray-600">
                            Repairo Moto's Referral Rewards Program allows customers to earn promotional credits by referring friends to our platform. This policy outlines the rules, rewards structure, and anti-abuse measures for the program.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-gray-700">

                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Program Overview</h2>
                            <ul className="space-y-2">
                                {[
                                    "Program Name: Repairo Moto Referral Rewards Program",
                                    "Purpose: Incentivize customer acquisition through word-of-mouth referrals.",
                                    "Referral Method: Each existing customer receives a unique referral code via the app.",
                                    "How It Works: When a friend uses the referral code to sign up, both the referrer and the referred user earn credits.",
                                    "Reward Type: Credits are platform promotional credits, NOT real money or cash.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Reward Structure</h2>
                            <ul className="space-y-2">
                                {[
                                    "Referrer Reward: ₹50 promotional credit (for each successful referral)",
                                    "Referred User Reward: ₹50 promotional credit (after completing first booking)",
                                    "Total Combined Reward: ₹100 (₹50 + ₹50)",
                                    "Reward Frequency: Unlimited referrals. Each referral earns ₹50 for referrer.",
                                    "Example: If you refer 10 friends who complete bookings, you earn ₹500 in credits.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Eligibility Criteria</h2>
                            <ul className="space-y-2">
                                {[
                                    "Referrer: Must have an active Repairo Moto account in good standing (no bans or suspensions).",
                                    "Referred User: Must be a new user (first-time signup on Repairo Moto platform).",
                                    "Not Previously Registered: Referred user must not have registered before using a referral code.",
                                    "Completion Requirement: Referred user MUST complete their first service booking to earn rewards.",
                                    "Validity: Referral code is valid indefinitely; referred user can complete first booking anytime.",
                                    "Age: Both referrer and referred user must be 18+ years of age.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How to Participate</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 1: Get Referral Code</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Open Repairo Moto app.",
                                    "Tap 'Profile' or 'My Account'.",
                                    "Select 'Referral' or 'Invite Friends'.",
                                    "Your unique referral code is displayed (e.g., REF12345XYZ).",
                                    "Share the code via WhatsApp, SMS, email, or other messaging apps.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 2: Friend Signs Up</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Friend downloads Repairo Moto app.",
                                    "During signup, Friend enters the referral code.",
                                    "Signup is completed with referral code registered.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 3: Friend Completes First Booking</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Friend books and completes any service (minimum booking ₹50 or more).",
                                    "Service is completed and payment is made.",
                                    "Both accounts are credited with ₹50 each (₹50 referrer, ₹50 referred user).",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 4: Use Credits</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Credits are instantly added to your account.",
                                    "On the next booking, credits are automatically applied.",
                                    "If credits cover the full invoice amount, payment is ₹0.",
                                    "Remaining credits can be used on future bookings.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Credit Characteristics</h2>
                            <ul className="space-y-2">
                                {[
                                    "Non-Monetary: Credits are promotional platform benefits, NOT real currency.",
                                    "Non-Withdrawable: Credits CANNOT be withdrawn to bank account, UPI, or wallet.",
                                    "Non-Refundable: Credits are not refundable or convertible to cash under any circumstances.",
                                    "No Redemption: Credits cannot be exchanged for cash or physical rewards.",
                                    "No Expiration: Credits DO NOT expire and remain valid indefinitely until used.",
                                    "Full Payment Allowed: Credits can fully pay an invoice (₹0 customer payment).",
                                    "Partial Use: Credits can partially offset an invoice.",
                                    "Only for Bookings: Credits can ONLY be used for Repairo Moto service bookings.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Anti-Abuse & Fraud Prevention</h2>
                            <p className="mb-3"><strong>Repairo Moto strictly prohibits fraudulent referral activity.</strong> Violators forfeit credits and face account suspension.</p>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.1 Prohibited Activities</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Self-Referrals: Using your own referral code to sign up with multiple accounts.",
                                    "Fake Referrals: Creating fake accounts to generate referral credits.",
                                    "Shared Device Fraud: Multiple people using the same device to create accounts and share referral credits.",
                                    "Invitation Farming: Repeatedly creating and deleting accounts to generate credits.",
                                    "Coordinated Referral Abuse: Collusion with others to create fraudulent referral chains.",
                                    "Unauthorized Code Usage: Using another person's referral code without authorization.",
                                    "Reselling Credits: Attempting to sell credits to other users.",
                                    "System Manipulation: Any attempt to bypass referral verification or earn undeserved credits.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.2 Detection & Consequences</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Monitoring: Repairo Moto monitors referral patterns for anomalies.",
                                    "IP Analysis: Multiple accounts from the same IP address are flagged.",
                                    "Device Fingerprinting: Multiple accounts from the same device are investigated.",
                                    "Payment Pattern Analysis: Unusual payment patterns trigger review.",
                                    "Immediate Action: Upon detection of fraud, all fraudulent credits are FORFEITED immediately.",
                                    "Account Suspension: Fraudulent accounts are suspended or permanently banned.",
                                    "No Appeal Process: Fraud penalties are final and not subject to appeal.",
                                    "Legal Action: Repairo Moto reserves the right to pursue legal action for significant fraud.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Credit Management &amp; Account Balance</h2>
                            <ul className="space-y-2">
                                {[
                                    "Credit Visibility: Your current credit balance is visible in 'My Account' → 'Wallet & Credits'.",
                                    "Transaction History: All credit transactions (earned, used) are logged and visible.",
                                    "Real-Time Updates: Credit balance updates instantly upon earning or spending.",
                                    "Automatic Application: Credits are automatically applied to bookings (no manual entry needed).",
                                    "Partial Use: If booking amount < available credits, you can choose to use all or partial credits.",
                                    "No Minimum Balance: You can use credits even if remaining balance is low.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Program Modifications & Termination</h2>
                            <ul className="space-y-2">
                                {[
                                    "Right to Modify: Repairo Moto reserves the right to modify referral reward amounts, eligibility criteria, or program terms at any time.",
                                    "Notice Period: Changes will be announced via in-app notification or email at least 7 days before taking effect.",
                                    "Program Suspension: Repairo Moto may suspend or terminate the referral program at any time.",
                                    "Credit Validity During Suspension: Credits earned before suspension remain valid and can be used.",
                                    "No Compensation: Termination of the program does not entitle users to refunds or compensation.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Credits & Account Deletion</h2>
                            <ul className="space-y-2">
                                {[
                                    "Account Deletion: If a user's account is deleted, all unused credits are forfeited.",
                                    "No Refund: Credits are non-refundable upon account deletion.",
                                    "Suspension: If an account is suspended for fraud or policy violation, credits are frozen and may be forfeited.",
                                    "Reinstatement: If a suspended account is reinstated, credits may be restored at Repairo Moto's discretion.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Dispute Resolution for Referral Issues</h2>
                            <ul className="space-y-2">
                                {[
                                    "Missing Credits: If referral credits are not credited within 24 hours of referred user's first booking completion, contact support immediately.",
                                    "Investigation: Repairo Moto investigates credit discrepancies within 5–7 business days.",
                                    "Manual Crediting: If an error is confirmed, credits are manually added to the account.",
                                    "False Claims: Claims of fraudulent credit deduction (when credits were actually used) will be denied.",
                                    "Escalation: For disputes, email repairomoto@gmail.com with booking IDs and referral details.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Tax & Legal Compliance</h2>
                            <ul className="space-y-2">
                                {[
                                    "Credits NOT Income: Referral credits are promotional benefits, not income or monetary compensation.",
                                    "No 1099 Reporting: Repairo Moto does not issue tax reporting forms (1099 or equivalent) for credits earned.",
                                    "User Responsibility: Users are responsible for determining tax implications of their use of credits, if any, in their jurisdiction.",
                                    "Government Compliance: Credits are non-taxable promotional incentives under Indian law (subject to user's individual tax situation).",
                                    "Anti-Money Laundering: The referral program complies with AML regulations; suspicious activity is reported to authorities if required.",
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Liability Disclaimer</h2>
                            <ul className="space-y-2">
                                {[
                                    "No Guarantee: Repairo Moto does not guarantee specific earnings from the referral program.",
                                    "No Warranty: Credits are provided 'as-is' without warranty.",
                                    "System Errors: In case of system errors causing credit loss, Repairo Moto will investigate but liability is limited to credit restoration only.",
                                    "No Compensation: Users forfeit any claims for compensation beyond credit restoration.",
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
                                For referral program questions or credit disputes:<br />
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
                            This Referral Rewards Policy is binding and exclusive. Participation in the referral program constitutes acceptance of all terms. Repairo Moto reserves the right to enforce this policy and take action against violators.
                        </p>

                        {/* Download Button */}
                        <div className="pt-8">
                            <a
                                href="/pdf/RepairoMoto_ReferralRewardsPolicy.pdf"
                                download="RepairoMoto_ReferralRewardsPolicy.pdf"
                                className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                            >
                                <Download className="mr-2" size={18} />
                                Download Referral Rewards Policy
                            </a>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
