import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import NavBar from '../../components/ui/NavBar';
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Footer from '../../components/landing/Footer';
import { motion } from 'framer-motion';

// Animation variants for reuse
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
};

const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7 }
    }
};

const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7 }
    }
};

const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const imageHover = {
    rest: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: { duration: 0.4, ease: "easeInOut" }
    }
};

export default function AboutUs() {
    return (
        <>
            <NavBar />
            <div className="min-h-screen">

                {/* Hero Section */}
                <div className="relative z-10 text-center bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
                    <motion.div
                        className="relative z-10 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h2
                            className="text-4xl md:text-5xl font-bold mb-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            About Us
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            <Breadcrumbs
                                items={[
                                    { label: 'Home', href: '/' },
                                    { label: 'About Us', },
                                ]}
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Our History */}
                <div className="text-center mb-12 px-20 py-10">
                    <motion.div
                        className="text-center mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeIn}
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <motion.h3
                                    className="text-2xl font-bold text-center text-primary mb-5"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    viewport={{ once: true }}
                                >
                                    OUR HISTORY
                                </motion.h3>

                                <div className="max-w-4xl mx-auto">
                                    <motion.p
                                        className="text-gray-600 leading-relaxed mb-4 text-left sm:text-justify px-4 sm:px-0"
                                        variants={fadeIn}
                                    >
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </motion.p>
                                    <motion.p
                                        className="text-gray-600 leading-relaxed text-left sm:text-justify px-4 sm:px-0"
                                        variants={fadeIn}
                                    >
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Images */}
                    <div className="container mx-auto px-5 lg:px-20">
                        <motion.div
                            className="flex flex-col items-center p-8 bg-gray-50 rounded-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                                variants={staggerChildren}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                {/* Left Image */}
                                <motion.div
                                    className="overflow-hidden"
                                    variants={fadeIn}
                                >
                                    <motion.div
                                        initial="rest"
                                        whileHover="hover"
                                        animate="rest"
                                    >
                                        <motion.img
                                            src="/images/pic2.jpeg"
                                            alt="Motorcycle helmets"
                                            className="object-cover rounded-lg"
                                            variants={imageHover}
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Middle Image */}
                                <motion.div
                                    className="overflow-hidden md:mt-16"
                                    variants={fadeIn}
                                >
                                    <motion.div
                                        initial="rest"
                                        whileHover="hover"
                                        animate="rest"
                                    >
                                        <motion.img
                                            src="/images/pic5.jpeg"
                                            alt="Mechanic with tools"
                                            className="object-cover rounded-lg"
                                            variants={imageHover}
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Right Image */}
                                <motion.div
                                    className="overflow-hidden"
                                    variants={fadeIn}
                                >
                                    <motion.div
                                        initial="rest"
                                        whileHover="hover"
                                        animate="rest"
                                    >
                                        <motion.img
                                            src="/images/pic6.jpeg"
                                            alt="Car tires"
                                            className="object-cover rounded-lg"
                                            variants={imageHover}
                                        />
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Testimonial Section */}
                <div className="w-full mx-auto px-4 py-20 bg-gray-100">
                    <div className="max-w-7xl mx-auto text-center">
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={staggerChildren}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                        >
                            {/* Testimonial 1 */}
                            <motion.div
                                className="flex flex-col items-center p-8 bg-gray-50 rounded-2xl"
                                variants={fadeIn}
                                whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", transition: { duration: 0.3 } }}
                            >
                                <motion.div
                                    className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden mb-4"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Dustin Mock"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                                <motion.h3
                                    className="text-lg text-gray-500 font-bold mb-1"
                                    variants={fadeIn}
                                >
                                    DUSTIN MOCK
                                </motion.h3>
                                <motion.p
                                    className="text-gray-500 mb-4"
                                    variants={fadeIn}
                                >
                                    Chief Engineer
                                </motion.p>
                                <motion.p
                                    className="italic text-gray-600 mb-6 text-center"
                                    variants={fadeIn}
                                >
                                    Lorem ipsum dolor sit amet, consectetur adipisic elit, sed do eiusmod tempor incid ut labore et dolore magna aliqua.
                                </motion.p>
                                <motion.div
                                    className="flex items-center justify-center"
                                    variants={fadeIn}
                                >
                                    <div className="flex text-yellow-400">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                        <span className="text-gray-300">★</span>
                                    </div>
                                    <span className="ml-2 text-gray-600">4.0</span>
                                </motion.div>
                            </motion.div>

                            {/* Testimonial 2 - Highlighted */}
                            <motion.div
                                className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg"
                                variants={fadeIn}
                                whileHover={{ y: -10, boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.2)", transition: { duration: 0.3 } }}
                            >
                                <motion.div
                                    className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden mb-4"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    viewport={{ once: true }}
                                >
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Elmer Schmidt"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                                <motion.h3
                                    className="text-lg text-gray-500 font-bold mb-1"
                                    variants={fadeIn}
                                >
                                    ELMER SCHMIDT
                                </motion.h3>
                                <motion.p
                                    className="text-gray-500 mb-4"
                                    variants={fadeIn}
                                >
                                    Chief Engineer
                                </motion.p>
                                <motion.p
                                    className="italic text-gray-600 mb-6 text-center"
                                    variants={fadeIn}
                                >
                                    Lorem ipsum dolor sit amet, consectetur adipisic elit, sed do eiusmod tempor incid ut labore et dolore magna aliqua.
                                </motion.p>
                                <motion.div
                                    className="flex items-center justify-center"
                                    variants={fadeIn}
                                >
                                    <div className="flex text-yellow-400">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                        <span className="text-gray-300">★</span>
                                    </div>
                                    <span className="ml-2 text-gray-600">4.0</span>
                                </motion.div>
                            </motion.div>

                            {/* Testimonial 3 */}
                            <motion.div
                                className="flex flex-col items-center p-8 bg-gray-50 rounded-2xl"
                                variants={fadeIn}
                                whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", transition: { duration: 0.3 } }}
                            >
                                <motion.div
                                    className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden mb-4"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    viewport={{ once: true }}
                                >
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Azul Baldwin"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                                <motion.h3
                                    className="text-lg text-gray-500 font-bold mb-1"
                                    variants={fadeIn}
                                >
                                    AZUL BALDWIN
                                </motion.h3>
                                <motion.p
                                    className="text-gray-500 mb-4"
                                    variants={fadeIn}
                                >
                                    Chief Engineer
                                </motion.p>
                                <motion.p
                                    className="italic text-gray-600 mb-6 text-center"
                                    variants={fadeIn}
                                >
                                    Lorem ipsum dolor sit amet, consectetur adipisic elit, sed do eiusmod tempor incid ut labore et dolore magna aliqua.
                                </motion.p>
                                <motion.div
                                    className="flex items-center justify-center"
                                    variants={fadeIn}
                                >
                                    <div className="flex text-yellow-400">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                        <span className="text-gray-300">★</span>
                                    </div>
                                    <span className="ml-2 text-gray-600">4.0</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Vision and Mission Section */}
                <div className="w-full bg-white py-16">
                    <div className="container mx-auto px-4 max-w-7xl">
                        {/* Vision Section - Text Right, Image Left */}
                        <motion.div
                            className="flex flex-col md:flex-row items-center mb-20"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {/* Left Side - Image */}
                            <motion.div
                                className="w-full md:w-2/3 mb-8 md:mb-0 md:pr-8"
                                variants={fadeInLeft}
                            >
                                <motion.div
                                    className="rounded-lg overflow-hidden shadow-lg h-96 md:h-[28rem]"
                                    whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                                >
                                    <img
                                        src="/images/bikers_04.jpg"
                                        alt="Our Vision"
                                        className="w-full h-full object-cover rounded-2xl shadow-xl"
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Right Side - Text */}
                            <motion.div
                                className="w-full md:w-1/2 md:pl-8"
                                variants={fadeInRight}
                            >
                                <motion.h2
                                    className="text-3xl font-bold text-primary mb-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    OUR VISION
                                </motion.h2>
                                <motion.div
                                    className="w-16 h-1 bg-primary mb-6"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: 64 }}
                                    transition={{ duration: 0.7 }}
                                    viewport={{ once: true }}
                                ></motion.div>
                                <motion.p
                                    className="text-gray-700 mb-4"
                                    variants={fadeIn}
                                >
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis,
                                    pulvinar dapibus leo. Sed non mauris vitae erat consequat auctor eu in elit.
                                </motion.p>
                                <motion.p
                                    className="text-gray-700 mb-6"
                                    variants={fadeIn}
                                >
                                    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                                    Mauris in erat justo. Nullam ac urna eu felis dapibus condimentum sit amet a augue.
                                </motion.p>
                                <motion.button
                                    className="bg-primary text-white px-6 py-3 rounded transition duration-300"
                                    whileHover={{ scale: 1.05, backgroundColor: "#e74c3c" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Learn More
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Mission Section - Text Left, Image Right */}
                        <motion.div
                            className="flex flex-col-reverse md:flex-row items-center"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {/* Left Side - Text */}
                            <motion.div
                                className="w-full md:w-1/2 md:pr-8"
                                variants={fadeInLeft}
                            >
                                <motion.h2
                                    className="text-3xl font-bold text-primary mb-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    OUR MISSION
                                </motion.h2>
                                <motion.div
                                    className="w-16 h-1 bg-primary mb-6"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: 64 }}
                                    transition={{ duration: 0.7 }}
                                    viewport={{ once: true }}
                                ></motion.div>
                                <motion.p
                                    className="text-gray-700 mb-4"
                                    variants={fadeIn}
                                >
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis,
                                    pulvinar dapibus leo. Sed non mauris vitae erat consequat auctor eu in elit.
                                </motion.p>
                                <motion.p
                                    className="text-gray-700 mb-6"
                                    variants={fadeIn}
                                >
                                    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                                    Mauris in erat justo. Nullam ac urna eu felis dapibus condimentum sit amet a augue.
                                </motion.p>
                                <motion.button
                                    className="bg-primary text-white px-6 py-3 rounded transition duration-300"
                                    whileHover={{ scale: 1.05, backgroundColor: "#e74c3c" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Learn More
                                </motion.button>
                            </motion.div>

                            {/* Right Side - Image */}
                            <motion.div
                                className="w-full md:w-1/2 mb-8 md:mb-0 md:pl-8"
                                variants={fadeInRight}
                            >
                                <motion.div
                                    className="rounded-lg overflow-hidden shadow-lg h-96 md:h-[28rem]"
                                    whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                                >
                                    <img
                                        src="/images/bikemaintenance.jpg"
                                        alt="Our Mission"
                                        className="w-full h-full object-cover rounded-2xl shadow-xl"
                                    />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </>
    )
}