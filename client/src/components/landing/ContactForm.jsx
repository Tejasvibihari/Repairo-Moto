// components/contact/ContactForm.jsx
import { ChevronDown } from "lucide-react";

export default function ContactForm() {
    return (
        <>
            <div className="grid md:grid-cols-2 gap-10 px-8 py-16 max-w-7xl mx-auto items-center">

            
       {/* contactus form */}
        <div className="w-full">
            <h2 className="text-primary font-semibold uppercase text-sm mb-2">Contact Form</h2>
            <h1 className="text-4xl font-bold mb-8">Bike Repair The Best Services</h1>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                    type="text"
                    placeholder="Your Name"
                    className="p-4 rounded bg-gray-100 w-full"
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    className="p-4 rounded bg-gray-100 w-full"
                />
                <input
                    type="text"
                    placeholder="Phone Number"
                    className="p-4 rounded bg-gray-100 w-full"
                />
               
                <textarea
                    placeholder="Message here.."
                    className="col-span-1 md:col-span-2 p-4 rounded bg-gray-100 w-full"
                    rows="5"
                />
                <div className="col-span-1 md:col-span-2">
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary text-white font-bold py-4 px-8 rounded mt-4 flex items-center gap-2 uppercase tracking-wider"
                    >
                        Appointment Now →
                    </button>
                </div>
            </form>
            </div>

                {/* contact info */}
                <div className="relative">
                    <img
                        src="/logo/logo72.png"
                        alt="Contact Us"
                        className="rounded-lg w-full object-cover"
                    />
                    <div className="absolute bottom-[-30px] left-6 bg-white p-6 rounded-lg shadow-lg border-2 border-red-500 flex items-center gap-4">
                        <div className="text-red-600 text-4xl">🛠️</div>
                        <div>
                            <h2 className="text-2xl font-bold">250+</h2>
                            <p className="text-gray-600 text-sm">Services we provide</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
