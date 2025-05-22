import { motion } from "framer-motion";
import { Wrench, Clock, ThumbsUp, ShieldCheck } from "lucide-react";

const features = [
    {
        icon: <Wrench size={32} aria-hidden="true" />,
        title: "Expert Mechanics",
        desc: "Certified and trained mechanics with years of experience.",
    },
    {
        icon: <Clock size={32} aria-hidden="true" />,
        title: "Quick Turnaround",
        desc: "Fast and reliable service to get you back on the road quickly.",
    },
    {
        icon: <ThumbsUp size={32} aria-hidden="true" />,
        title: "Quality Assurance",
        desc: "We use genuine parts and maintain the highest service standards.",
    },
    {
        icon: <ShieldCheck size={32} aria-hidden="true" />,
        title: "Trusted by Customers",
        desc: "High customer satisfaction with repeat clients and 5-star reviews.",
    },
];

export default function WhyChooseUs() {
    return (
        <section
            className="py-16 bg-gray-100"
            aria-label="Why Choose Our Bike Services"
        >
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-primary mb-4">
                    Why Choose Us?
                </h2>
                <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                    We're committed to providing the best bike services with
                    transparency, expertise, and care.
                </p>

                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
                    {features.map((item, idx) => (
                        <motion.article
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-md p-6 text-center"
                            aria-label={item.title}
                        >
                            <div className="text-primary mb-4 flex justify-center">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
