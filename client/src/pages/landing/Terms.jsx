import React from "react";
import { Download } from "lucide-react";

export default function Terms() {
    return (
        <div className="bg-white min-h-screen py-12 px-4 md:px-16">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="text-gray-400 uppercase text-sm font-medium mb-2">AGREEMENT</div>
                    <h1 className="text-4xl font-bold text-primary mb-6">Terms of Service</h1>
                    <p className="text-gray-600">
                        We know it's tempting to skip these Terms of Service, but it's important to establish what you can expect from us as you use Repairo Moto services, and what we expect from you.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6 text-gray-700">
                    <p>
                        These Terms of Service reflect the way Repairo Moto business works, the laws that apply to our company, and certain things we've always believed to be true. As a result, these Terms of Service help define Repairo Moto's relationship with you as you interact with our services. For example, these terms include the following topic headings:
                    </p>

                    <ul className="space-y-3">
                        {[
                            "What you can expect from us, which describes how we provide and develop our services",
                            "What we expect from you, which establishes certain rules for using our services",
                            "Content in Repairo Moto services, which describes the intellectual property rights to the content you find in our services — whether that content belongs to you, Repairo Moto, or others",
                            "In case of problems or disagreements, which describes other legal rights you have, and what to expect in case someone violates these terms"
                        ].map((item, index) => (
                            <li key={index} className="flex">
                                <div className="mr-3 text-blue-600">•</div>
                                <div>{item}</div>
                            </li>
                        ))}
                    </ul>

                    <p className="font-medium mt-6">
                        Understanding these terms is important because, to use our services, you must accept these terms.
                    </p>

                    <div className="pt-4 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">1. Services Offered</h2>
                        <p>
                            Repairo Moto provides doorstep two-wheeler servicing and repair, including regular maintenance,
                            mechanical and electrical repairs, and emergency assistance, subject to availability.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900">2. Booking & Service Process</h2>
                        <ul className="space-y-2">
                            {[
                                "Book via our website, WhatsApp, or approved channels.",
                                "Service is confirmed based on mechanic availability.",
                                "Ensure proper access and safety at your address.",
                                "Delays may occur due to traffic or weather."
                            ].map((item, index) => (
                                <li key={index} className="flex">
                                    <div className="mr-3 text-blue-600">•</div>
                                    <div>{item}</div>
                                </li>
                            ))}
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900">3. Pricing & Payments</h2>
                        <ul className="space-y-2">
                            {[
                                "Prices are confirmed at booking and may vary.",
                                "Additional charges require approval before work proceeds.",
                                "Payments accepted via UPI, cash, or online mode.",
                                "Invoices are provided digitally post service."
                            ].map((item, index) => (
                                <li key={index} className="flex">
                                    <div className="mr-3 text-blue-600">•</div>
                                    <div>{item}</div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="mt-6">
                        Besides these terms, we also publish a Privacy Policy. Although it's not part of these terms, we encourage you to read it to better understand how you can update, manage, export, and delete your information.
                    </p>

                    {/* Action Buttons */}
                    <div className="pt-8 flex space-x-4">
                        <button
                            className="px-6 py-3 bg-gray-200 rounded-md text-gray-800 font-medium hover:bg-gray-300 transition-colors"
                        >
                            Not right now...
                        </button>
                        <button
                            className="px-6 py-3 bg-primary rounded-md text-white font-medium hover:bg-secondary transition-colors"
                        >
                            I agree with terms
                        </button>
                    </div>

                    {/* Download Button */}
                    <div className="pt-8">
                        <a
                            href="/pdf/RepairoMoto_TermsAndConditions.pdf"
                            download="RepairoMoto_TermsAndConditions.pdf"
                            className="inline-flex items-center text-primary font-medium hover:text-secondary transition-colors"
                        >
                            <Download className="mr-2" size={18} />
                            Download Terms & Conditions
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}