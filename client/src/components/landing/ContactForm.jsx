// components/contact/ContactForm.jsx
import { ChevronDown } from "lucide-react";

export default function ContactForm() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Left: Form */}
                <div className="bg-gray-50 p-8 rounded-sm shadow-md w-full">
                    <h2 className="text-primary font-semibold uppercase text-sm mb-4 tracking-wide">_______Contact Form</h2>
                    <h1 className="text-4xl font-bold mb-8 leading-tight">Send Us a Message</h1>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            placeholder="Your Name"
                            className="p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <div></div> {/* Empty to fix layout */}
                        <textarea
                            placeholder="Message here.."
                            className="col-span-1 md:col-span-2 p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                            rows="5"
                        />
                        <div className="col-span-1 md:col-span-2">
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded mt-4 flex items-center gap-2 uppercase tracking-wider transition-all duration-300 hover:shadow-lg"
                            >
                                Appointment Now →
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Image */}
                <div className="w-full">
                    <img
                        src="/images/contactus.jpg"
                        alt="Contact Us"
                        className="rounded-lg shadow-md w-full object-cover h-full"
                    />
                </div>

            </div>
        </div>
    );
}
