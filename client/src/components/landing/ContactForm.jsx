// components/contact/ContactForm.jsx
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import RevealOnScroll from "../../components/ui/RevealOnScroll";
import ParallaxImage from "../../components/ui/ParallaxImage";

export default function ContactForm() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-16" aria-labelledby="contact-form-title">
            <RevealOnScroll>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    {/* Left: Contact Form */}
                    <motion.div
                        className="bg-gray-50 p-8 rounded-sm shadow-md w-full"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <header>
                            <p className="text-primary font-semibold uppercase text-sm mb-4 tracking-wide">
                                Contact Form
                            </p>
                            <h2 id="contact-form-title" className="text-4xl font-bold mb-8 leading-tight">
                                Send Us a Message
                            </h2>
                        </header>

                        <form
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            method="POST"
                            action="/api/contact" // Replace with your backend endpoint
                        >
                            <div>
                                <label htmlFor="name" className="sr-only">Your Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    className="p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="sr-only">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="sr-only">Phone Number</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    placeholder="Phone Number"
                                    className="p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div></div>

                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="message" className="sr-only">Your Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Message here.."
                                    rows="5"
                                    required
                                    className="p-4 rounded bg-gray-100 w-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded mt-4 flex items-center gap-2 uppercase tracking-wider transition-all duration-300 hover:shadow-lg"
                                    aria-label="Submit Contact Form"
                                >
                                    Appointment Now →
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Right: Parallax Image with Alt Text */}
                    <ParallaxImage
                        src="/images/contactus.jpg"
                        alt="A modern workspace with a contact team"
                        height={400}
                    />

                </div>
            </RevealOnScroll>
        </section>
    );
}
