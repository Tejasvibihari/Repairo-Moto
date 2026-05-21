import React from "react";
import NavBar from "../../components/ui/NavBar";
import Footer from "../../components/landing/Footer";
import BreadCrumbs from "../../components/ui/BreadCrumbs";
import { motion } from "framer-motion";

export default function VehicleImageCapturePolicy() {
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
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Vehicle Image Capture Policy</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'Vehicle Image Capture Policy' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="bg-white min-h-screen py-12 px-4 md:px-16">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <div className="text-gray-400 uppercase text-sm font-medium mb-2">DOCUMENTATION</div>
                        <h1 className="text-4xl font-bold text-primary mb-2">Vehicle Image Capture Policy</h1>
                        <p className="text-sm text-gray-400 mb-4">Effective Date: 21 May 2026 &nbsp;|&nbsp; Issued by Shantram Private Limited &nbsp;|&nbsp; Governing Law: Laws of India; Jurisdiction: Patna, Bihar</p>
                    </div>

                    <div className="space-y-8 text-gray-700">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Purpose of Vehicle Image Capture</h2>
                            <ul className="space-y-2">
                                {[
                                    "Documentation: Record vehicle condition before and after repair for operational transparency.",
                                    "Dispute Prevention: Serve as evidence to prevent fraudulent damage claims.",
                                    "Warranty Protection: Establish baseline condition for warranty claim eligibility.",
                                    "Quality Assurance: Enable internal quality review and mechanic performance monitoring.",
                                    "Audit Trail: Maintain service audit logs for compliance and operational transparency.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Before-Repair Image</h2>
                            <ul className="space-y-2">
                                {[
                                    "Timing: Captured immediately before repair work begins (after OTP #1 entry).",
                                    "Coverage: Photo of the vehicle's overall exterior and specific affected area/component.",
                                    "Clarity: Image must clearly show the vehicle's current condition and reported issue.",
                                    "Timestamp: Image is automatically timestamped and linked to booking ID.",
                                    "Mandatory: Mechanic cannot begin work without capturing before-repair image.",
                                    "Storage: Image is stored securely in encrypted servers.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. After-Repair Image</h2>
                            <ul className="space-y-2">
                                {[
                                    "Timing: Captured immediately after repair work is completed (before OTP #2 issuance).",
                                    "Coverage: Photo of the same component/area in post-repair condition.",
                                    "Quality Check: Image shows successful completion of repair work.",
                                    "Timestamp: Image is timestamped and linked to booking ID.",
                                    "Mandatory: Mechanic cannot mark service complete without after-repair image.",
                                    "Comparison: Before and after images together provide comprehensive documentation.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Image Quality Standards</h2>
                            <ul className="space-y-2">
                                {[
                                    "Resolution: Minimum 1080p resolution (as per device capability).",
                                    "Lighting: Adequate lighting to clearly show details (daytime/well-lit location preferred).",
                                    "Focus: Clear, in-focus images of the vehicle and affected component.",
                                    "Entirety: Image should capture the full context of the repair area.",
                                    "No Obstruction: Image should not be obstructed by people, objects, or reflections.",
                                    "Rejection: Low-quality images may be rejected and re-captured.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Image Data Privacy & Security</h2>
                            <ul className="space-y-2">
                                {[
                                    "Encryption: All images are encrypted in transit and at rest.",
                                    "Secure Storage: Images are stored on AWS or similar PCI-DSS compliant servers.",
                                    "Access Control: Only authorized Repairo Moto personnel can access images.",
                                    "No Sharing: Images are NOT shared with third parties without explicit customer consent.",
                                    "GDPR-Compliant: Privacy practices comply with applicable data protection regulations.",
                                    "Anonymization: Images can be anonymized for training purposes (with consent).",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Image Retention & Deletion</h2>
                            <ul className="space-y-2">
                                {[
                                    "Retention Period: Images are retained for 7 calendar days after service completion.",
                                    "Automatic Deletion: After 7 days, images are permanently deleted from live servers.",
                                    "Backup Retention: Backups may be retained for compliance (180 days) but are inaccessible to customers.",
                                    "Warranty Claims: During warranty period (15 days), images are available as evidence.",
                                    "Extended Retention: If a dispute is filed, images are retained until dispute resolution.",
                                    "Request Deletion: Customers can request earlier deletion by contacting support.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Image Use in Disputes & Warranty Claims</h2>
                            <ul className="space-y-2">
                                {[
                                    "Primary Evidence: Before/after images are the primary evidence in warranty and damage disputes.",
                                    "Verification: Images are analyzed by our quality team to verify service completion and damage assessment.",
                                    "Legal Standing: Images serve as documentation of vehicle condition at the time of service.",
                                    "Comparison: Side-by-side image comparison helps determine if damage is pre-service or post-service.",
                                    "Third-Party Interference: Images showing evidence of third-party repairs after our service may affect warranty claims.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Customer Image Uploads</h2>
                            <ul className="space-y-2">
                                {[
                                    "Profile Images: Customers can upload profile images for their account avatar.",
                                    "Optional: Customer profile image upload is optional and not mandatory.",
                                    "Acceptable Content: Only personal profile images or vehicle-related photos should be uploaded.",
                                    "Prohibited Content: Offensive, explicit, or inappropriate images are prohibited.",
                                    "Moderation: Repairo Moto reserves the right to reject or remove inappropriate images.",
                                    "Retention: Profile images are retained indefinitely while the account is active.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Camera Permissions & Device Usage</h2>
                            <ul className="space-y-2">
                                {[
                                    "Mechanic App: Mechanic app requires camera permission to capture before/after images.",
                                    "Customer App: Customer app can access camera for profile image upload (optional).",
                                    "Permission Granted: Upon app installation, users are asked to grant camera permissions.",
                                    "Permission Revoked: Users can revoke camera access via device settings anytime.",
                                    "Impact: Revoking camera permissions may prevent mechanic from completing service documentation.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Image Authenticity & Tampering</h2>
                            <ul className="space-y-2">
                                {[
                                    "Integrity Verification: Images are cryptographically signed to prevent tampering.",
                                    "Metadata Validation: EXIF data (timestamp, location) is validated for authenticity.",
                                    "Detection System: Advanced algorithms detect edited, filtered, or doctored images.",
                                    "Tampered Images: Images found to be tampered are flagged for investigation.",
                                    "Consequences: Submission of tampered images may result in service denial or account suspension.",
                                ].map((item, index) => (
                                    <li key={index} className="flex">
                                        <div className="mr-3 text-blue-600">•</div>
                                        <div>{item}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Image Download & Access</h2>
                            <ul className="space-y-2">
                                {[
                                    "Customer Access: Customers can view their service images in the app under 'My Bookings'.",
                                    "Download Rights: Customers can download images during the 7-day retention period.",
                                    "After Deletion: Images are not accessible for download after the 7-day retention period.",
                                    "Warranty Claims: For warranty claims, contact support to request image availability.",
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
                                For image-related inquiries or concerns:<br />
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
