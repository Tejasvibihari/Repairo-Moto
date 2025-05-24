import { useState } from 'react';
import { User, Phone, Mail, MapPin, CreditCard, Star, Calendar, Shield, Settings } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import axiosClient from '../../service/axiosClient';

const EmployeeDetail = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const { id } = useParams()
    const [employee, setEmployee] = useState({})
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/api/admin/employee/getemployee/id/${id}`);
                // console.log(response.data.employees);
                setEmployee(response.data.employee);
                console.log(response)
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.log(error)
            }
        }
        fetchEmployees()
    }, [])


    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatAadhar = (aadhar) => {
        const str = aadhar.toString();
        return str.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
            } else {
                stars.push(<Star key={i} size={16} className="text-gray-300" />);
            }
        }
        return stars;
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                            {employee.profileImage ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${employee.profileImage}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            {/* <User size={48} className="text-white/80" /> */}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                            <Shield size={16} className="text-white" />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold mb-2">{employee.firstName} {employee.lastName}</h1>
                        <div className="flex flex-col md:flex-row gap-4 text-blue-100">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium capitalize">
                                {employee.position}
                            </span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium capitalize">
                                {employee.role}
                            </span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                            <div className="flex">{getRatingStars(employee.averageRating)}</div>
                            {/* <span className="text-sm">({emp?.averageRating?.toFixed(1)})</span> */}
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="bg-white/20 rounded-lg p-4">
                            <p className="text-sm opacity-80">Referral Code</p>
                            <p className="text-xl font-bold">{employee.referralCode}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex">
                    {[
                        { id: 'personal', label: 'Personal Info', icon: User },
                        { id: 'contact', label: 'Contact', icon: Phone },
                        { id: 'documents', label: 'Documents', icon: CreditCard },
                        { id: 'activity', label: 'Activity', icon: Calendar }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
                {activeTab === 'personal' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">First Name</span>
                                    <span className="font-medium">{employee.firstName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Name</span>
                                    <span className="font-medium">{employee.lastName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Position</span>
                                    <span className="font-medium capitalize">{employee.position}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Role</span>
                                    <span className="font-medium capitalize">{employee.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance</h3>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Average Rating</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex">{getRatingStars(employee.averageRating)}</div>
                                        {/* <span className="font-medium">{employee.averageRating.toFixed(1)}</span> */}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Ratings</span>
                                    <span className="font-medium">{employee.ratings?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Referral Code</span>
                                    <span className="font-medium text-blue-600">{employee.referralCode}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Mail className="text-blue-600" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{employee.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Phone className="text-green-600" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{employee.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Address</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-red-600 mt-1" size={20} />
                                    <div className="space-y-1">
                                        <p className="font-medium">{employee.address}</p>
                                        <p className="text-gray-600">{employee.city}, {employee.state}</p>
                                        <p className="text-gray-600">PIN: {employee.pinCode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Identity Documents</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <CreditCard size={20} className="text-blue-600" />
                                    Aadhar Card
                                </h4>
                                <p className="text-gray-600 mb-4">Number: {formatAadhar(employee.aadhar)}</p>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Front Image</p>
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            {employee?.aadharImages?.front ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${employee.aadharImages.front}`}
                                                    alt="Aadhar Front"
                                                    className="max-w-full h-32 object-cover mx-auto rounded"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <p className="text-gray-500 text-sm">Document uploaded</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Back Image</p>
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            {employee.aadharImages?.back ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${employee.aadharImages.back}`}

                                                    alt="Aadhar Back"
                                                    className="max-w-full h-32 object-cover mx-auto rounded"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <p className="text-gray-500 text-sm">Document uploaded</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Settings size={20} className="text-green-600" />
                                    Driving License
                                </h4>
                                <p className="text-gray-600 mb-4">Number: {employee.dl}</p>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">License Image</p>
                                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        {employee.dlImage ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}${employee.dlImage}`}
                                                alt="Driving License"
                                                className="max-w-full h-32 object-cover mx-auto rounded"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <p className="text-gray-500 text-sm">Document uploaded</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Activity</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Calendar className="text-blue-600" size={24} />
                                    <h4 className="font-semibold text-blue-800">Account Created</h4>
                                </div>
                                <p className="text-blue-700 font-medium">{formatDate(employee.createdAt)}</p>
                                <p className="text-blue-600 text-sm mt-1">
                                    {Math.floor((new Date() - new Date(employee.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Calendar className="text-green-600" size={24} />
                                    <h4 className="font-semibold text-green-800">Last Updated</h4>
                                </div>
                                <p className="text-green-700 font-medium">{formatDate(employee.updatedAt)}</p>
                                <p className="text-green-600 text-sm mt-1">
                                    {Math.floor((new Date() - new Date(employee.updatedAt)) / (1000 * 60 * 60 * 24))} days ago
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="font-semibold mb-4">Recent Activity</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700">Profile updated</span>
                                    <span className="text-gray-500 text-sm ml-auto">{formatDate(employee.updatedAt)}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-700">Account created</span>
                                    <span className="text-gray-500 text-sm ml-auto">{formatDate(employee.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDetail;