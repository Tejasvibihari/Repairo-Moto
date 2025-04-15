import React from 'react'
import NavBar from '../../components/ui/NavBar'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactUs() {
    return (
        <div >
            <NavBar />


            <div className="min-h-screen bg-white">
                {/* Breadcrumbs */}
                <div className="relative bg-cover bg-center bg-no-repeat h-[300px] flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/bike-repair-image.png')" }}
                >
                    {/* <div className="absolute inset-0 bg-black opacity-60 z-0" /> */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-0" />
                    {/* Centered Content */}
                    <div className="relative z-10 text-center px-4">
                        <h2 className="text-5xl font-bold mb-2">Contacts</h2>
                        <div className="flex justify-center">
                            <Breadcrumbs />
                        </div>
                    </div>
                </div>



                {/* contact form  and info */}
                <div className="grid md:grid-cols-2 gap-12 px-6 md:px-30 py-16 items-start ">
                    {/* Left - Form */}

                    <div className=''>
                        <div className='shadow-sm  border-gray-300 rounded p-4'>
                            <h3 className="text-4xl font-bold mb-2">Get In Touch!</h3>
                            <p className="text-gray-600 mb-6">Got any questions? Send us a message.</p>

                            <form className=" p-4 ">
                                <div className="flex flex-col md:flex-row gap-4 mb-10">
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        className="w-full border border-gray-300 p-3 rounded outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="email"
                                        placeholder="address@youremail.com"
                                        className="w-full border border-gray-300 p-3 rounded outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <textarea
                                    rows={10}
                                    placeholder="Your Question"
                                    className="w-full border border-gray-300 p-3 rounded outline-none focus:ring-2 focus:ring-primary"
                                ></textarea>
                                <div className='flex  mt-4'>
                                    <button
                                        type="submit"
                                        className="bg-primary mt-4  font-semibold hover:bg-transparent hover:text-primary  border-primary border text-white px-6 py-2  cursor-pointer hover:bg-primary-dark"
                                    >
                                        Contact
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                    {/* Right - Info */}
                    <div className="flex flex-col justify-center ">
                        <div className='shadow-sm items-center border-gray-300 rounded p-4 ' >
                            <div className="items-start gap-4">
                                <MapPin className="text-primary mt-1" size={28} />
                                <div>
                                    <h4 className="font-semibold text-xl mb-1">Post Address</h4>
                                    <p className="text-gray-700">
                                        123 Main Street, City, State, Zip Code
                                    </p>
                                </div>
                            </div>

                            <div className=" items-start gap-4">
                                <Phone className="text-primary mt-1" size={28} />
                                <div>
                                    <h4 className="font-semibold text-xl mb-1">Contact Phone</h4>
                                    <p className="text-gray-700">+1-909-123-4567</p>
                                </div>
                            </div>

                            <div className=" items-start gap-4">
                                <Mail className="text-primary mt-1" size={28} />
                                <div>
                                    <h4 className="font-semibold text-xl mb-1">E-mail Address</h4>
                                    <p className="text-gray-700">office@emaildomain.com</p>
                                </div>
                            </div>

                            <div className=" items-start gap-4">
                                <Clock className="text-primary mt-1" size={28} />
                                <div>
                                    <h4 className="font-semibold text-xl mb-1">Opening Hours</h4>
                                    <p className="text-gray-700">Mon-Fri: 9:00 AM - 6:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
