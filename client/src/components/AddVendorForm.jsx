import React, { useState } from 'react';
import Heading from './ui/Heading';
import { Store, User, Phone, Mail, MapPin, Building, Hash, Upload, CheckCircle } from 'lucide-react';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';
import { useDispatch } from 'react-redux';
import { setVendor } from '../app/slice/vendorSlice';

export default function AddVendorForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        googleLocation: '',
        pincode: '',
        businessName: '',
        gstNo: '',
        profileImage: null,
    });
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [fileName, setFileName] = useState('');
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({
            ...prev,
            profileImage: file,
        }));
        setFileName(file ? file.name : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosClient.post("/api/vendor/addvendor", formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )
            dispatch(setVendor(response.data.vendor));
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            setLoading(false)
            setFormData({
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                googleLocation: '',
                businessName: '',
                gstNo: '',
                profileImage: null,
            })
            setFileName('');
        } catch (error) {
            console.log(error)
            setSnackBarMessage(error.message);
            setSnackBarSeverity("error");
            setSnackBarOpen(true)
            setLoading(false)
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    }

    const InputField = ({ icon: Icon, label, name, type = "text", placeholder, required = true, value, onChange }) => (
        <div className="space-y-2">
            <label className="text-gray-800 font-medium text-sm flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 bg-white hover:border-gray-300"
                    required={required}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );

    const FileUploadField = () => (
        <div className="space-y-2">
            <label className="text-gray-800 font-medium text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Profile Image
            </label>
            <div className="relative">
                <input
                    type="file"
                    name="profileImage"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profileImage"
                    accept="image/*"
                />
                <label
                    htmlFor="profileImage"
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600"
                >
                    {fileName ? (
                        <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-700">{fileName}</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            <span className="text-sm">Choose profile image</span>
                        </>
                    )}
                </label>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />

            <div className="max-w-4xl mx-auto">
                <Heading heading={"Add Vendor"} />

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mt-6">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8">
                        <div className="flex items-center gap-3 text-white">
                            <div className="bg-white/20 p-3 rounded-full">
                                <Store className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Vendor Registration</h2>
                                <p className="text-white/90 text-sm">Fill in the details to add a new vendor to your system</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Personal Information Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    icon={User}
                                    label="First Name"
                                    name="firstName"
                                    placeholder="Enter first name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                                <InputField
                                    icon={User}
                                    label="Last Name"
                                    name="lastName"
                                    placeholder="Enter last name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                                <InputField
                                    icon={Phone}
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <InputField
                                    icon={Mail}
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Business Information Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-primary" />
                                Business Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    icon={Building}
                                    label="Business Name"
                                    name="businessName"
                                    placeholder="Enter business name"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                />
                                <InputField
                                    icon={Hash}
                                    label="GST Number"
                                    name="gstNo"
                                    placeholder="Enter GST number"
                                    value={formData.gstNo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Location Information Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Location Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputField
                                        icon={MapPin}
                                        label="Address"
                                        name="address"
                                        placeholder="Enter complete address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <InputField
                                    icon={MapPin}
                                    label="City"
                                    name="city"
                                    placeholder="Enter city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                                <InputField
                                    icon={MapPin}
                                    label="State"
                                    name="state"
                                    placeholder="Enter state"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                                <InputField
                                    icon={Hash}
                                    label="Pincode"
                                    name="pincode"
                                    type="number"
                                    placeholder="Enter pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                />
                                <InputField
                                    icon={MapPin}
                                    label="Google Location URL"
                                    name="googleLocation"
                                    type="url"
                                    placeholder="Enter Google Maps URL"
                                    value={formData.googleLocation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Profile Image Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                Profile Image
                            </h3>
                            <FileUploadField />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3 min-w-[200px]"
                            >
                                {loading ? (
                                    <>
                                        <CircularLoading size={20} />
                                        <span>Adding Vendor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Store className="w-5 h-5" />
                                        <span>Add Vendor</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}