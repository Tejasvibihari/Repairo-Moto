import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import NavBar from '../../components/ui/NavBar';
import BreadCrumbs from '../../components/ui/BreadCrumbs'
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
                            <BreadCrumbs
                                items={[
                                    { label: 'Home', href: '/' },
                                    { label: 'About Us', },
                                ]}
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Our Story Section */}
                <div className="text-center mb-12 px-5 py-16">
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
                                    className="text-3xl font-bold text-center text-primary mb-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    viewport={{ once: true }}
                                >
                                    OUR STORY
                                </motion.h3>

                                <div className="max-w-6xl mx-auto">
                                    <motion.p
                                        className="text-gray-600 leading-relaxed mb-6 text-justify sm:text-justify px-4 sm:px-0 text-lg"
                                        variants={fadeIn}
                                    >
                                        Repairo Moto was co-founded in 2021 by <strong>Digvijay Singh</strong> and <strong>Kumar Raunak</strong>, with a simple yet powerful vision — to make two-wheeler repair services more reliable, transparent, and accessible right at the customer's doorstep. From day one, the company was built on values of trust, affordability, and customer-first service, which quickly made Repairo Moto a recognized and respected brand in Patna.
                                    </motion.p>
                                    <motion.p
                                        className="text-gray-600 leading-relaxed mb-6 text-justify sm:text-justify px-4 sm:px-0 text-lg"
                                        variants={fadeIn}
                                    >
                                        During his tenure as Co-Founder & CEO (Feb 2021 – Nov 2024), Digvijay Singh played a pivotal role in shaping the company's culture, operations, and growth. His leadership and commitment laid a strong foundation, helping Repairo Moto earn not just loyal customers but also a reputation for innovation and professionalism. It was a wonderful journey, and in these three years, he made a lasting impact, driving the company forward with passion and vision.
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

                {/* Leadership Transition Section */}
                <div className="w-full bg-gray-100 py-16">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <motion.div
                            className="text-center mb-12"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeIn}
                        >
                            <motion.h3
                                className="text-3xl font-bold text-primary mb-8"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                viewport={{ once: true }}
                            >
                                A NEW CHAPTER BEGINS
                            </motion.h3>

                            <div className="max-w-5xl mx-auto">
                                <motion.p
                                    className="text-gray-600 leading-relaxed mb-6 text-justify sm:text-justify px-4 sm:px-0 text-lg"
                                    variants={fadeIn}
                                >
                                    As of November 2024, Mr. Digvijay Singh is no longer a part of the company. We sincerely thank him for his invaluable contribution and the dedication with which he nurtured Repairo Moto in its formative years. His vision and hard work established the strong foundation upon which we continue to build.
                                </motion.p>
                                <motion.p
                                    className="text-gray-600 leading-relaxed mb-6 text-justify sm:text-justify px-4 sm:px-0 text-lg"
                                    variants={fadeIn}
                                >
                                    Today, Repairo Moto is led by <strong>Mr. Kumar Raunak</strong>, who continues to carry the mission forward with renewed energy and focus on service excellence. Our commitment remains the same — to deliver trusted care that ensures every ride is safer, smoother, and worry-free.
                                </motion.p>
                            </div>
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
                                    className="text-gray-700 mb-4 text-lg"
                                    variants={fadeIn}
                                >
                                    At Repairo Moto, our vision is to redefine bike service by offering a seamless, transparent, and tech-driven experience for every rider. We aim to become India's most trusted name for two-wheeler care.
                                </motion.p>
                                <motion.p
                                    className="text-gray-700 mb-6 text-lg"
                                    variants={fadeIn}
                                >
                                    We believe your ride deserves the best care — from regular servicing to urgent repairs — and we're committed to making high-quality bike maintenance easy, accessible, and reliable for every customer.
                                </motion.p>
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
                                    className="text-gray-700 mb-4 text-lg"
                                    variants={fadeIn}
                                >
                                    Repairo Moto's mission is to deliver professional and affordable bike service at your doorstep or nearest partner garage. Our team of certified mechanics ensures that your two-wheeler stays in top condition with complete transparency and reliability.
                                </motion.p>
                                <motion.p
                                    className="text-gray-700 mb-6 text-lg"
                                    variants={fadeIn}
                                >
                                    Through innovation, digital convenience, and dedicated service, we strive to eliminate the hassle from traditional repair experiences — making two-wheeler maintenance smooth, stress-free, and trustworthy for every rider.
                                </motion.p>
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

                {/* Testimonial Section */}
                <div className="w-full mx-auto px-4 py-20 bg-gray-100">
                    <div className="max-w-7xl mx-auto text-center">
                        <motion.h3
                            className="text-3xl font-bold text-primary mb-12"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                        >
                            WHAT OUR CUSTOMERS SAY
                        </motion.h3>

                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={staggerChildren}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                        >
                            {/* Testimonial 1 */}
                            <motion.div
                                className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg"
                                variants={fadeIn}
                                whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)", transition: { duration: 0.3 } }}
                            >
                                {/* <motion.div
                                    className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden mb-4"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Rajesh Kumar"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div> */}
                                <motion.h3
                                    className="text-lg text-gray-800 font-bold mb-1"
                                    variants={fadeIn}
                                >
                                    RAJESH KUMAR
                                </motion.h3>
                                <motion.p
                                    className="italic text-gray-600 mb-6 text-center"
                                    variants={fadeIn}
                                >
                                    "Repairo Moto saved my day when my bike broke down on the way to work. Their mechanic arrived quickly and fixed everything on the spot. Truly reliable service that I can trust!"
                                </motion.p>
                                <motion.div
                                    className="flex items-center justify-center"
                                    variants={fadeIn}
                                >
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                    </div>
                                    <span className="ml-2 text-gray-600">5.0</span>
                                </motion.div>
                            </motion.div>

                            {/* Testimonial 2 - Highlighted */}
                            <motion.div
                                className="flex flex-col items-center p-8 bg-primary text-white rounded-2xl shadow-lg"
                                variants={fadeIn}
                                whileHover={{ y: -10, boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.2)", transition: { duration: 0.3 } }}
                            >
                                {/* <motion.div
                                    className="w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-4"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    viewport={{ once: true }}
                                >
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Priya Singh"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div> */}
                                <motion.h3
                                    className="text-lg text-white font-bold mb-1"
                                    variants={fadeIn}
                                >
                                    PRIYA SINGH
                                </motion.h3>
                                <motion.p
                                    className="italic text-white/90 mb-6 text-center"
                                    variants={fadeIn}
                                >
                                    "I've tried several bike service platforms, but Repairo Moto stands out with its fast response, skilled technicians, and honest pricing. Highly recommended for everyone!"
                                </motion.p>
                                <motion.div
                                    className="flex items-center justify-center"
                                    variants={fadeIn}
                                >
                                    <div className="flex text-yellow-300">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                    </div>
                                    <span className="ml-2 text-white">5.0</span>
                                </motion.div>
                            </motion.div>

                            {/* Testimonial 3 */}
                            <motion.div
                                className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg"
                                variants={fadeIn}
                                whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)", transition: { duration: 0.3 } }}
                            >
                                {/* <motion.div
                                    className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden mb-4"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    viewport={{ once: true }}
                                >
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Amit Sharma"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div> */}
                                <motion.h3
                                    className="text-lg text-gray-800 font-bold mb-1"
                                    variants={fadeIn}
                                >
                                    AMIT SHARMA
                                </motion.h3>
                                <motion.p
                                    className="italic text-gray-600 mb-6 text-center"
                                    variants={fadeIn}
                                >
                                    "Booking a service with Repairo Moto is so easy! Their technician came to my home, explained everything clearly, and completed the repair quickly. Great value for money."
                                </motion.p>
                                <motion.div
                                    className="flex items-center justify-center"
                                    variants={fadeIn}
                                >
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                    </div>
                                    <span className="ml-2 text-gray-600">5.0</span>
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