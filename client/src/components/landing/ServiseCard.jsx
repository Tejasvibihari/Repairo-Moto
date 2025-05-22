import { motion } from 'framer-motion';
import {
    ArrowRight,
    Wrench,
    Bike,
    Warehouse,
    Settings,
    CheckCircle,
    Activity,
    Search,
} from 'lucide-react';

const services = [
    {
        icon: <Settings className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Servicing',
        description: 'Keep your bike in top condition with regular servicing by our experts.',
        image: '/images/pic19.jpeg',
    },
    {
        icon: <Wrench className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Repairing',
        description: 'From minor issues to major repairs, we fix it all with precision.',
        image: '/images/pic17.jpeg',
    },
    {
        icon: <Wrench className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Full Engine Service',
        description: 'Complete engine overhauls with genuine parts and skilled labor.',
        image: '/images/pic16.jpeg',
    },
    {
        icon: <CheckCircle className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Half Engine Service',
        description: 'Focused repair for partial engine faults to save time and cost.',
        image: '/images/pic15.jpeg',
    },
    {
        icon: <Activity className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Engine Work',
        description: 'Expert diagnostics and repairs for a smooth and efficient engine.',
        image: '/images/pic14.jpeg',
    },
    {
        icon: <Search className="w-8 h-8 text-primary" aria-hidden="true" />,
        title: 'Inspection',
        description: 'Thorough inspections to identify hidden faults before they escalate.',
        image: '/images/pic12.jpeg',
    },
];

export default function ServiceCards() {
    return (
        <section aria-label="Our Services">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <motion.article
                            key={idx}
                            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition"
                            whileHover={{ y: -5 }}
                            aria-label={service.title}
                        >
                            <div className="p-6 flex-1">
                                <div className="mb-4">{service.icon}</div>
                                <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
                                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                                <a
                                    href={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="text-sm text-black font-medium inline-flex items-center hover:underline group"
                                >
                                    Read more
                                    <span className="ml-1 group-hover:translate-x-1 transition-transform">
                                        →
                                    </span>
                                </a>
                            </div>
                            <img
                                src={service.image}
                                alt={`${service.title} - Service`}
                                className="h-48 w-full object-cover"
                                loading="lazy"
                            />
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
