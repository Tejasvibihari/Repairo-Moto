import React, { useState } from 'react';
import Heading from './ui/Heading';
import { UserPen, User, Mail, Phone, MapPin, CreditCard, FileText, Briefcase, Camera } from 'lucide-react';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';

export default function EditEmployeeForm({ initialData, onSuccess }) {
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        position: initialData?.position || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        pinCode: initialData?.pinCode || '',
        aadhar: initialData?.aadhar || '',
        dl: initialData?.dl || '',
        profileImage: null, // File input
    });
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            profileImage: e.target.files[0], // Store the file object
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        console.log("Form submitted"); // Debugging log

        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        try {
            const response = await axiosClient.put(`/api/admin/employee/updateemployee/${initialData.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Employee updated successfully:', response);
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            setLoading(false)
            if (onSuccess) {
                onSuccess(response.data); // Callback to refresh the UI or show a success message
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarOpen(false);
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />

            <div className="mb-8">
                <Heading heading="Edit Employee" />
                <p className="text-gray-600 mt-2">Update employee information and profile details</p>
            </div>

            <form className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter first name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter last name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                                Role
                            </label>
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-white"
                                required
                            >
                                <option value="" disabled>Select role</option>
                                <option value="admin">Operation Manager</option>
                                <option value="mechanic">Mechanic</option>
                                <option value="delivery">Delivery</option>
                                <option value="manager">Manager</option>
                                <option value="hr">HR</option>
                                <option value="accountant">Accountant</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <Camera className="h-4 w-4 mr-2 text-gray-500" />
                                Profile Image
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    name="profileImage"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    accept="image/*"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                Aadhar Number
                            </label>
                            <input
                                type="number"
                                name="aadhar"
                                value={formData.aadhar}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter Aadhar number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                Driving License
                            </label>
                            <input
                                type="text"
                                name="dl"
                                value={formData.dl}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter driving license number"
                            />
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                Street Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter street address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter city"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter state"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-gray-700 font-medium text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                PIN Code
                            </label>
                            <input
                                type="number"
                                name="pinCode"
                                value={formData.pinCode}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                                required
                                placeholder="Enter PIN code"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="bg-gray-50 px-6 py-6 border-t border-gray-200">
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            {loading ? (
                                <CircularLoading />
                            ) : (
                                <>
                                    <UserPen className="h-5 w-5 mr-2" />
                                    Update Employee
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}