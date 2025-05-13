
import { useState } from 'react';
import { Phone, Mail, MapPin, Star, Award, Truck, Wrench } from 'lucide-react';

// Sample employee data (you would fetch this from an API in a real app)


// Position-specific icon component
const PositionIcon = ({ position, className }) => {
    switch (position) {
        case 'delivery':
            return <Truck className={className} />;
        case 'mechanic':
            return <Wrench className={className} />;
        default:
            return <Award className={className} />;
    }
};

// ProfileCard Component with different styling based on position
export default function ProfileCard({ employee }) {
    const [expanded, setExpanded] = useState(false);

    // Different gradient styles based on position
    const cardStyle = employee.position === 'delivery'
        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
        : 'bg-gradient-to-br from-amber-500 to-red-600';

    const detailStyle = employee.position === 'delivery'
        ? 'bg-gradient-to-br from-blue-100 to-purple-200'
        : 'bg-gradient-to-br from-amber-100 to-red-200';

    const buttonStyle = employee.position === 'delivery'
        ? 'bg-purple-600 hover:bg-purple-700'
        : 'bg-red-600 hover:bg-red-700';

    return (
        <div className={`rounded-xl shadow-xl overflow-hidden transition-all duration-300 w-full max-w-4xl ${cardStyle}`}>
            {/* Card content that changes layout based on screen size */}
            <div className="flex flex-col md:flex-row">
                {/* Left section with image and basic info */}
                <div className="flex flex-col items-center p-6 md:w-1/3">
                    <div className="relative">
                        <img
                            src={`${import.meta.env.VITE_API_URL}${employee.profileImage}`}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg">
                            <PositionIcon position={employee.position} className="w-6 h-6 text-gray-700" />
                        </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-white">{employee.firstName} {employee.lastName}</h2>
                    <div className="flex items-center mt-2 text-white/90">
                        <span className="capitalize font-medium">{employee.position}</span>
                        <span className="mx-2">•</span>
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300 mr-1" />
                            <span>{employee.rating || "New"}</span>
                        </div>
                    </div>

                    <div className="mt-3 bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        Ref: {employee.referralCode}
                    </div>
                </div>

                {/* Right section with contact details */}
                <div className={`${detailStyle} flex-1 p-6`}>
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Contact Details</h3>

                    <div className="space-y-3">
                        <div className="flex items-start">
                            <Phone className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-800">{employee.phone}</span>
                        </div>

                        <div className="flex items-start">
                            <Mail className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-800 break-all">{employee.email}</span>
                        </div>

                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 mr-3 text-gray-700 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-gray-800">{employee.address}</span>
                                <span className="text-gray-600">
                                    {employee.city}, {employee.state} - {employee.pinCode}
                                </span>
                            </div>
                        </div>
                    </div>

                    {expanded && (
                        <div className="mt-4 pt-4 border-t border-gray-300/30">
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">Additional Information</h3>
                            <p className="text-gray-700">
                                {employee.position === 'delivery' ?
                                    "Specialized in fast and reliable delivery services across the region." :
                                    "Expert mechanic with skills in diagnosing and fixing various mechanical issues."}
                            </p>
                        </div>
                    )}

                    <button
                        className={`mt-4 px-4 py-2 rounded-lg text-white ${buttonStyle} transition-colors`}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Show Less" : "Show More"}
                    </button>
                </div>
            </div>
        </div>
    );
};