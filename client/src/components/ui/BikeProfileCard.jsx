import { useState } from 'react';
import { Bike, Settings, Gauge, Award, Edit, Trash2, MoreVertical, Calendar } from 'lucide-react';

// Mock bike data for demonstration

export const BikeProfileCard = ({ bikeProfile, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getBrandColor = (brand) => {
        const colors = {
            'Honda': 'from-red-500 to-red-600',
            'Yamaha': 'from-blue-500 to-blue-600',
            'Kawasaki': 'from-green-500 to-green-600',
            'Royal Enfield': 'from-purple-500 to-purple-600',
            'Bajaj': 'from-orange-500 to-orange-600',
            'default': 'from-gray-500 to-gray-600'
        };
        return colors[brand] || colors.default;
    };

    const getBSBadgeColor = (bs) => {
        switch (bs) {
            case 'BS6': return 'bg-green-100 text-green-800';
            case 'BS4': return 'bg-yellow-100 text-yellow-800';
            case 'BS3': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
            {/* Header with Brand Gradient */}
            <div className={`bg-gradient-to-r ${getBrandColor(bikeProfile.brand)} p-4 text-white relative`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <Bike className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{bikeProfile.brand}</h3>
                            <p className="text-sm opacity-90">{bikeProfile.model}</p>
                        </div>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                        {/* <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button> */}

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg py-2 w-32 z-10">
                                <button
                                    onClick={() => {
                                        onEdit && onEdit(bikeProfile);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete && onDelete(bikeProfile);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
                {/* Specifications */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Gauge className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Engine</p>
                            <p className="font-semibold text-gray-800">{bikeProfile.cc} CC</p>
                        </div>
                    </div>

                    {bikeProfile.bs && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Award className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Standard</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBSBadgeColor(bikeProfile.bs)}`}>
                                    {bikeProfile.bs}
                                </span>
                            </div>
                        </div>
                    )}
                </div>



                {/* Date Added */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Added {formatDate(bikeProfile.createdAt)}</span>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        ID: {bikeProfile._id.slice(-6)}
                    </div>
                </div>
            </div>
        </div>
    );
};
