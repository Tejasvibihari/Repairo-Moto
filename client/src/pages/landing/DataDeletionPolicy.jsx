import React from "react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function DataDeletionPolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Data Deletion Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Data Deletion Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">PRIVACY</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Data Deletion Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                    </div>

                    <div className="space-y-8 text-gray-700">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Data Deletion Request Overview</h2>
                            <p className="mb-3">
                                Repairo Moto respects your privacy rights. This policy outlines how you can request deletion of your personal data and the process we follow. While we are committed to honoring deletion requests, certain records must be retained for legal and operational compliance.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data That Will Be Deleted</h2>
                            <p className="mb-3">The following data will be deleted upon account deletion request:</p>
                            <ul className="space-y-2">
                                {[
                                    "Personal Identifiers: Full name, email address, phone number (unless needed for compliance)",
                                    "Profile Information: Profile image, bio, preferences",
                                    "Account Credentials: Password hash and authentication tokens",
                                    "Active Session Data: Temporary cookies and session tokens",
                                    "FCM Tokens: Push notification tokens are cleared upon deletion",
                                    "Device Data: Device fingerprints and unique device IDs associated with the account",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data That Will NOT Be Deleted</h2>
                            <p className="mb-3">For legal, tax, and operational compliance, the following data will be retained indefinitely:</p>
                            <ul className="space-y-2">
                                {[
                                    "Invoices: All service invoices (required for GST compliance and financial audit)",
                                    "Payment Records: Transaction history (required for tax records, audit trails, fraud detection)",
                                    "Booking History: Service records for warranty, dispute resolution, and compliance",
                                    "Tax Records: GSTIN information and tax-related documents (required by Indian law)",
                                    "Legal Records: Any legal notices, complaints, or legal proceedings documentation",
                                    "Audit Logs: System logs for security, fraud detection, and operational audit",
                                    "Anonymized Data: Aggregated, anonymized usage data that cannot identify individuals",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Deletion Process</h2>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 1: Submit Deletion Request</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "In-App Request: Go to Settings → Account → Delete Account (if available)",
                                    "Email Request: Send deletion request to repairomoto@gmail.com with subject 'Account Deletion Request'",
                                    "Phone Request: Call +91 9229207021 during support hours (Mon–Sat, 9 AM–7 PM IST)",
                                    "Required Information: Full name, email, phone number, booking ID (if available)",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 2: Verification</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Identity Verification: We verify your identity by matching provided information with account records",
                                    "Security Check: Verification helps prevent unauthorized deletion requests",
                                    "Response Time: You will be contacted within 48 hours of request submission",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 3: Compliance Review</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Active Cases: If there are active disputes, warranty claims, or pending payments, deletion may be delayed",
                                    "Legal Hold: If account is involved in legal proceedings, deletion may be restricted",
                                    "Payment Pending: If outstanding balance exists, deletion may require payment settlement",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 4: Data Deletion Execution</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Primary System: Deletable data is removed from live production systems within 30 days",
                                    "Backup Systems: Data is removed from backup systems within 90 days",
                                    "Confirmation: You receive email confirmation of deletion completion",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Step 5: Permanent Deletion</h3>
                            <ul className="space-y-2 mb-4">
                                {[
                                    "Account Deactivation: Account is marked as deleted and becomes inaccessible",
                                    "Recovery Window: Deleted account cannot be recovered after 90-day retention period",
                                    "Final Purge: After 90 days, account data is permanently removed (except legally required records)",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Deletion Timeline</h2>
                            <ul className="space-y-2">
                                {[
                                    "Request Processing: 48 hours (verification and compliance review)",
                                    "Primary Deletion: 30 days (removal from active systems)",
                                    "Backup Deletion: 90 days (removal from all backup systems)",
                                    "Complete Purge: 90 days (final deletion, account unrecoverable)",
                                    "Retained Records: Indefinite (invoices, tax, audit logs per legal requirements)",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Partial Data Deletion</h2>
                            <p className="mb-3">You can also request deletion of specific data types without deleting your entire account:</p>
                            <ul className="space-y-2">
                                {[
                                    "Profile Image: Delete your profile picture (you can upload a new one)",
                                    "Preferences: Clear saved preferences and settings",
                                    "Device Tokens: Remove FCM tokens (if app uninstalled or removed)",
                                    "Browsing History: Clear app usage history and preferences",
                                    "Note: Booking history and invoices cannot be selectively deleted",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Deletion Restrictions</h2>
                            <p className="mb-3">Deletion requests may be restricted or delayed in the following scenarios:</p>
                            <ul className="space-y-2">
                                {[
                                    "Active Dispute: Ongoing warranty claims or damage disputes (until resolved)",
                                    "Pending Payment: Outstanding invoice balance (until settled or written off)",
                                    "Active Booking: Ongoing service booking (until completion and resolution)",
                                    "Legal Hold: Account involved in legal proceedings or investigation",
                                    "Fraud Suspicion: Account flagged for fraudulent activity (under investigation)",
                                    "Warranty Claim: 15-day warranty period not yet expired",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Automatic Account Deletion (Inactivity)</h2>
                            <ul className="space-y-2">
                                {[
                                    "Inactivity Period: Accounts inactive for 2+ years may be eligible for deletion",
                                    "Notification: Users are notified via email 30 days before automatic deletion",
                                    "Opt-Out: Users can prevent deletion by logging in or contacting support",
                                    "Retention Exception: Invoices and tax records are retained indefinitely",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Image & Document Deletion</h2>
                            <ul className="space-y-2">
                                {[
                                    "Service Photos: Automatically deleted 7 days after service completion (not affected by account deletion)",
                                    "Profile Images: Deleted upon account deletion (from live systems within 30 days)",
                                    "Service Invoices: Retained indefinitely (required for compliance, NOT deleted)",
                                    "Support Documents: Deleted with account unless part of legal records",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Legal & Compliance Retention</h2>
                            <p className="mb-3">Despite account deletion request, the following records are retained indefinitely for legal compliance:</p>
                            <ul className="space-y-2">
                                {[
                                    "GST Compliance: Invoices and GSTIN information (required by Indian GST Act)",
                                    "Income Tax: Financial records (required by Income Tax Act, 1961)",
                                    "AML Compliance: KYC data and transaction history (required by Financial Action Task Force guidelines)",
                                    "Dispute Resolution: Records related to legal claims, warranty disputes, or complaints",
                                    "Fraud Investigation: Records of accounts flagged for fraudulent activity",
                                    "Audit Trail: System logs for security and operational audit",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Verification & Confirmation</h2>
                            <ul className="space-y-2">
                                {[
                                    "Deletion Confirmation: Email confirmation sent upon successful deletion",
                                    "Certificate of Deletion: Upon request, a deletion certificate is provided",
                                    "Re-Registration: After account deletion, you can re-register with the same email",
                                    "No Account Recovery: Deleted accounts cannot be recovered after 90 days",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact & Support</h2>
                            <p>
                                To request data deletion:<br />
                                Email:{" "}
                                <a href="mailto:repairomoto@gmail.com" className="text-blue-600 underline">repairomoto@gmail.com</a><br />
                                Phone:{" "}
                                <a href="tel:+919229207021" className="text-blue-600 underline">+91 9229207021</a><br />
                                Subject Line: "Data Deletion Request"<br />
                                Support Hours: Monday–Saturday, 9:00 AM–7:00 PM IST
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
