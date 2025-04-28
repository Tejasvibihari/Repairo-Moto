import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import NavBar from '../../components/ui/NavBar';
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Footer from '../../components/landing/Footer';

export default function AboutUs() {
    return (
        <>
            <NavBar />
            <div className="bg-background text-white">

                {/* Hero Section */}
                <div className="relative bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
                    <div className="relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">About Us</h2>
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'About Us', },
                            ]}
                        />
                    </div>

                </div>
                {/* our history */}
                <div className="container mx-auto px-25 py-12">


                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-bold text-center text-primary mb-5">OUR HISTORY</h3>

                            <div className="max-w-4xl mx-auto">
                                <p className="text-gray-600 leading-relaxed mb-4 text-left sm:text-justify px-4 sm:px-0">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                                <p className="text-gray-600 leading-relaxed text-left sm:text-justify px-4 sm:px-0">
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* images */}
                    <div className="container mx-auto px-5  lg:px-20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {/* Left Image */}
                            <div className="overflow-hidden">
                                <div className="">
                                    <img
                                        src="/images/helmet.webp"
                                        alt="Motorcycle helmets"
                                        className="object-cover rounded-lg transition-transform duration-500 ease-in-out hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Middle Image */}
                            <div className="overflow-hidden  md:mt-16">
                                <div className="">
                                    <img
                                        src="/images/bikerepair.jpg"
                                        alt="Mechanic with tools"
                                        className=" object-cover rounded-lg transition-transform duration-500 ease-in-out hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className="overflow-hidden ">
                                <div className="">
                                    <img
                                        src="/images/tery.webp"
                                        alt="Car tires"
                                        className=" object-cover rounded-lg transition-transform duration-500 ease-in-out hover:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* testimonial section */}

                {/* Testimonial Section */}
                <div className="w-full mx-auto px-4 py-20 bg-gray-100">
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Testimonial 1 */}
                            <div className="flex flex-col items-center p-8">
                                <div className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden mb-4">
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Dustin Mock"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg text-gray-800 font-bold mb-1">DUSTIN MOCK</h3>
                                <p className="text-gray-500 mb-4">Chief Engineer</p>
                                <p className="italic text-gray-600 mb-6">
                                    Lorem ipsum dolor sit amet, consectetur adipisic elit, sed do eiusmod tempor incid ut labore et dolore magna aliqua.
                                </p>
                                <div className="flex items-center justify-center">
                                    <div className="flex text-yellow-400">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                        <span className="text-gray-300">★</span>
                                    </div>
                                    <span className="ml-2 text-gray-600">4.0</span>
                                </div>
                            </div>

                            {/* Testimonial 2 - Highlighted */}
                            <div className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-md relative">

                                <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden mb-4">
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Elmer Schmidt"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg text-gray-800 font-bold mb-1">ELMER SCHMIDT</h3>
                                <p className="text-gray-500 mb-4">Chief Engineer</p>

                                <p className="italic text-gray-600 mb-6">
                                    Lorem ipsum dolor sit amet, consectetur adipisic elit, sed do eiusmod tempor incid ut labore et dolore magna aliqua.
                                </p>
                                <div className="flex items-center justify-center">
                                    <div className="flex text-yellow-400">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                        <span className="text-gray-300">★</span>
                                    </div>
                                    <span className="ml-2 text-gray-600">4.0</span>
                                </div>
                            </div>

                            {/* Testimonial 3 */}
                            <div className="flex flex-col items-center p-8">
                                <div className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden mb-4">
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Azul Baldwin"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg text-gray-800 font-bold mb-1">AZUL BALDWIN</h3>
                                <p className="text-gray-500 mb-4">Chief Engineer</p>
                                <p className="italic text-gray-600 mb-6">
                                    Lorem ipsum dolor sit amet, consectetur adipisic elit, sed do eiusmod tempor incid ut labore et dolore magna aliqua.
                                </p>
                                <div className="flex items-center justify-center">
                                    <div className="flex text-yellow-400">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                        <span className="text-gray-300">★</span>
                                    </div>
                                    <span className="ml-2 text-gray-600">4.0</span>
                                </div>
                            </div>

                        </div>

                        {/* Pagination Dots */}
                        {/* <div className="flex justify-center mt-8 space-x-2">
                            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                            <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                            <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                        </div> */}
                    </div>
                </div>


                {/* Meet the Team */}
                {/* <div className="py-20 max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12 text-primary">Meet the Team</h2>
                    <div className="grid md:grid-cols-4 gap-10">
                        {[1, 2, 3, 4].map((member) => (
                            <div key={member} className="bg-secondary p-6 rounded-xl text-center hover:scale-105 transition">
                                <img src={`/images/team${member}.jpg`} alt="Team Member" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                                <h3 className="text-xl font-bold mb-2">Name Surname</h3>
                                <p className="text-gray-400 mb-4">Role / Position</p>
                                <div className="flex justify-center space-x-3">
                                    <a href="#"><Facebook size={20} /></a>
                                    <a href="#"><Instagram size={20} /></a>
                                    <a href="#"><Twitter size={20} /></a>
                                    <a href="#"><Linkedin size={20} /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}



            </div>
            {/* footer */}

            <Footer />
        </>
    )
}
