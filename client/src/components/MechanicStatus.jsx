import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Calendar, Filter, ChevronDown, Wrench, X, Check } from 'lucide-react';

// Mock data for mechanics
const mockMechanics = [
    {
        id: 1,
        name: "Alex Johnson",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 123-4567",
        email: "alex.johnson@example.com",
        specialization: "Engine Repair",
        experience: "5 years",
        assignedOrders: [
            { id: 101, customer: "John Smith", service: "Engine Overhaul", date: "2025-04-28" }
        ],
        rating: 4.8,
        isAvailable: false
    },
    {
        id: 2,
        name: "Sarah Williams",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 234-5678",
        email: "sarah.williams@example.com",
        specialization: "Electrical Systems",
        experience: "7 years",
        assignedOrders: [],
        rating: 4.9,
        isAvailable: true
    },
    {
        id: 3,
        name: "Michael Brown",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 345-6789",
        email: "michael.brown@example.com",
        specialization: "Brake Systems",
        experience: "3 years",
        assignedOrders: [
            { id: 102, customer: "Emma Davis", service: "Brake Replacement", date: "2025-04-30" }
        ],
        rating: 4.7,
        isAvailable: false
    },
    {
        id: 4,
        name: "Jessica Taylor",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 456-7890",
        email: "jessica.taylor@example.com",
        specialization: "Transmission",
        experience: "6 years",
        assignedOrders: [],
        rating: 4.6,
        isAvailable: true
    },
    {
        id: 5,
        name: "David Martinez",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 567-8901",
        email: "david.martinez@example.com",
        specialization: "Suspension Systems",
        experience: "4 years",
        assignedOrders: [
            { id: 103, customer: "Oliver Wilson", service: "Suspension Repair", date: "2025-04-29" },
            { id: 104, customer: "Sophia Anderson", service: "Wheel Alignment", date: "2025-05-02" }
        ],
        rating: 4.5,
        isAvailable: false
    },
    {
        id: 6,
        name: "Rebecca Johnson",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 678-9012",
        email: "rebecca.johnson@example.com",
        specialization: "Air Conditioning",
        experience: "2 years",
        assignedOrders: [],
        rating: 4.3,
        isAvailable: true
    },
    {
        id: 7,
        name: "Thomas Jackson",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 789-0123",
        email: "thomas.jackson@example.com",
        specialization: "Diagnostic Expert",
        experience: "8 years",
        assignedOrders: [
            { id: 105, customer: "Ava Thompson", service: "Engine Diagnostics", date: "2025-05-01" }
        ],
        rating: 4.9,
        isAvailable: false
    },
    {
        id: 8,
        name: "Jennifer White",
        avatar: "/api/placeholder/50/50",
        contact: "+1 (555) 890-1234",
        email: "jennifer.white@example.com",
        specialization: "Oil Changes & Maintenance",
        experience: "3 years",
        assignedOrders: [],
        rating: 4.4,
        isAvailable: true
    }
];

// Status badge component
const StatusBadge = ({ isAvailable }) => {
    return (
        <div className={`flex items-center px-3 py-1 rounded-full text-sm ${isAvailable
            ? 'bg-green-100 text-green-800'
            : 'bg-amber-100 text-amber-800'
            }`}>
            {isAvailable
                ? <><Check size={14} className="mr-1" /> Available</>
                : <><Calendar size={14} className="mr-1" /> Assigned</>
            }
        </div>
    );
};

// Assignment component for showing details of assigned orders
const AssignmentDetails = ({ assignments }) => {
    if (assignments.length === 0) {
        return <p className="text-gray-500 italic text-sm">No current assignments</p>;
    }

    return (
        <div className="space-y-2 mt-2">
            {assignments.map(order => (
                <div key={order.id} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="flex justify-between">
                        <span className="font-medium">{order.service}</span>
                        <span className="text-gray-500">{order.date}</span>
                    </div>
                    <div className="text-gray-600">Customer: {order.customer}</div>
                </div>
            ))}
        </div>
    );
};

// Expanded view of mechanic details
const MechanicExpandedView = ({ mechanic }) => {
    return (
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                        <div className="flex items-center text-sm">
                            <Phone size={16} className="mr-2 text-gray-500" />
                            <span>{mechanic.contact}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Mail size={16} className="mr-2 text-gray-500" />
                            <span>{mechanic.email}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-medium text-gray-700 mb-2">Expertise</h4>
                    <div className="text-sm">
                        <p><span className="text-gray-600">Specialization:</span> {mechanic.specialization}</p>
                        <p><span className="text-gray-600">Experience:</span> {mechanic.experience}</p>
                        <p><span className="text-gray-600">Rating:</span> {mechanic.rating}/5.0</p>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Assigned Orders</h4>
                <AssignmentDetails assignments={mechanic.assignedOrders} />
            </div>
        </div>
    );
};

// Individual mechanic card component
const MechanicCard = ({ mechanic }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg">
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                            <img
                                src={mechanic.avatar}
                                alt={mechanic.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">{mechanic.name}</h3>
                            <p className="text-gray-600 text-sm">{mechanic.specialization}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <StatusBadge isAvailable={mechanic.isAvailable} />
                        <ChevronDown
                            size={20}
                            className={`text-gray-500 transition-transform ${expanded ? 'transform rotate-180' : ''}`}
                        />
                    </div>
                </div>
            </div>

            {expanded && <MechanicExpandedView mechanic={mechanic} />}
        </div>
    );
};

// Filter menu component
const FilterMenu = ({ filters, onChange, isOpen, onToggle }) => {
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center text-gray-600 px-3 py-2 rounded-lg border border-gray-300 bg-white"
            >
                <Filter size={16} className="mr-2" />
                Filter
                <ChevronDown size={16} className={`ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 p-3 border border-gray-100">
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            value={filters.availability}
                            onChange={(e) => onChange({ ...filters, availability: e.target.value })}
                        >
                            <option value="all">All</option>
                            <option value="available">Available Only</option>
                            <option value="assigned">Assigned Only</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            value={filters.specialization}
                            onChange={(e) => onChange({ ...filters, specialization: e.target.value })}
                        >
                            <option value="all">All Specializations</option>
                            <option value="Engine Repair">Engine Repair</option>
                            <option value="Electrical Systems">Electrical Systems</option>
                            <option value="Brake Systems">Brake Systems</option>
                            <option value="Transmission">Transmission</option>
                            <option value="Suspension Systems">Suspension Systems</option>
                        </select>
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                        <button
                            className="text-sm text-gray-600"
                            onClick={() => onChange({ availability: 'all', specialization: 'all' })}
                        >
                            Clear Filters
                        </button>
                        <button
                            className="text-sm text-primary font-medium"
                            onClick={onToggle}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Mechanic Management Component
export default function MechanicManagement() {
    const [mechanics, setMechanics] = useState(mockMechanics);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        availability: 'all',
        specialization: 'all'
    });

    // Filter mechanics based on search term and filters
    const filteredMechanics = mechanics.filter(mechanic => {
        // Filter by search term
        const matchesSearch = mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mechanic.specialization.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by availability
        const matchesAvailability =
            filters.availability === 'all' ||
            (filters.availability === 'available' && mechanic.isAvailable) ||
            (filters.availability === 'assigned' && !mechanic.isAvailable);

        // Filter by specialization
        const matchesSpecialization =
            filters.specialization === 'all' ||
            mechanic.specialization === filters.specialization;

        return matchesSearch && matchesAvailability && matchesSpecialization;
    });

    // Clear search field
    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-primary">Mechanic Status</h1>
                <button className="bg-primary text-white rounded-lg px-4 py-2 flex items-center">
                    <Wrench size={18} className="mr-2" />
                    Add Mechanic
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search mechanics by name or specialization..."
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={clearSearch}
                        >
                            <X size={18} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                <FilterMenu
                    filters={filters}
                    onChange={setFilters}
                    isOpen={isFilterOpen}
                    onToggle={() => setIsFilterOpen(!isFilterOpen)}
                />
            </div>

            {/* Mechanics List */}
            <div className="h-96 overflow-auto">
                {filteredMechanics.length > 0 ? (
                    filteredMechanics.map(mechanic => (
                        <MechanicCard key={mechanic.id} mechanic={mechanic} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No mechanics found matching your search criteria.</p>
                        <button
                            className="mt-3 text-primary font-medium"
                            onClick={() => {
                                setSearchTerm('');
                                setFilters({ availability: 'all', specialization: 'all' });
                            }}
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}