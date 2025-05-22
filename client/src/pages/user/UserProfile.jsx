import React, { useEffect, useState } from 'react'
import NavBar from '../../components/ui/NavBar'
import Footer from '../../components/landing/Footer'
import { motion } from 'framer-motion';
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import { Camera, Save, Edit2, User, Briefcase, Phone, Mail, MapPin, Hash, Lock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../service/axiosClient';
import { setUserSignIn } from '../../app/slice/userSlice';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';

export default function UserProfile() {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, seteditedUser] = useState(user);
    const [previewImage, setPreviewImage] = useState(null);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [userForm, setUserForm] = useState(user);

    // Handle field changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
            setPasswordData(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            seteditedUser(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            seteditedUser(prev => ({
                ...prev,
                profileImage: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result); // for preview
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    };

    // Save user data
    const handleSave = async () => {
        try {
            setLoading(true);
            // Password validation
            if (passwordData.newPassword || passwordData.confirmPassword || passwordData.currentPassword) {
                if (!passwordData.currentPassword) {
                    setPasswordError('Current password is required');
                    return;
                }
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    setPasswordError('New passwords do not match');
                    return;
                }
                if (passwordData.newPassword.length < 8) {
                    setPasswordError('Password must be at least 8 characters');
                    return;
                }
            }



            // Prepare form data
            const formData = new FormData();
            Object.entries(editedUser).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });
            formData.append('currentPassword', passwordData.currentPassword || '');
            formData.append('newPassword', passwordData.newPassword || '');
            formData.append('confirmPassword', passwordData.confirmPassword || '');
            console.log(user)
            const response = await axiosClient.put(`/api/user/update-profile/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            dispatch(setUserSignIn({ user: response.data.user }));

            setSnackBarMessage(response.data.message || "Profile updated successfully!");
            setSnackBarSeverity('success');
            setSnackBarOpen(true);

            // Reset state
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordError('');
            setPreviewImage(null);
            setIsEditing(false);
            setLoading(false)
        } catch (error) {
            console.error('Error updating user:', error);
            setSnackBarMessage('Failed to update profile. Please try again.');
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
            setLoading(false)
        } finally {
            setLoading(false);
        }
    };

    // Toggle edit mode
    const toggleEdit = () => {
        if (isEditing) {
            // Cancel editing
            seteditedUser(user);
            setPreviewImage(null);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordError('');
        }
        setIsEditing(!isEditing);
    };

    // Abstract background shapes
    const AbstractBackground = () => (
        <div className="absolute inset-0 overflow-hidden z-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary/40 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-blue-400/30 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-purple-400/30 translate-y-1/2"></div>
        </div>
    );

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />
            <NavBar />
            <motion.div
                className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">My Profile</h2>
                    <BreadCrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'My Profile' },
                        ]}
                    />
                </div>
            </motion.div>

            <div className="relative py-12 md:py-20 px-4 bg-gray-50">
                <AbstractBackground />

                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Profile Header */}
                        <div className="relative h-48 bg-gradient-to-r from-primary/80 to-primary">
                            <div className="absolute inset-0 bg-[url('/api/placeholder/800/250')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

                            {/* Edit Button */}
                            <button
                                onClick={toggleEdit}
                                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all duration-300 z-20"
                            >
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <Save size={18} />
                                        <span className="text-sm">Cancel</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Edit2 size={18} />
                                        <span className="text-sm">Edit</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Profile Image */}
                        <div className="relative -mt-24 ml-8 mb-4">
                            <div className="relative">
                                <div className="w-36 h-36 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                                    {previewImage || user?.profileImage ? (
                                        <img
                                            src={previewImage || `${import.meta.env.VITE_API_URL}${user.profileImage}` || "/api/placeholder/150/150"}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <User size={64} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-2 rounded-full cursor-pointer shadow-lg">
                                        <Camera size={20} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-6 md:p-8 pt-0">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={editedUser?.firstName}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={editedUser?.lastName}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={editedUser?.phone}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    disabled
                                                    value={editedUser?.email}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Update */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Update Password</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    placeholder="Enter current password"
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <div className="h-px bg-gray-200 my-2"></div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    placeholder="Enter new password"
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    placeholder="Confirm new password"
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            {passwordError && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-red-500 text-sm">{passwordError}</p>
                                                </div>
                                            )}
                                            <div className="sm:col-span-2">
                                                <p className="text-xs text-gray-500">
                                                    Password must be at least 8 characters long and include uppercase, lowercase letters, and numbers
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Information */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Account Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                                                <select
                                                    name="accountType"
                                                    value={editedUser?.accountType}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                >
                                                    <option value="personal">Personal</option>
                                                    <option value="business">Business</option>
                                                </select>
                                            </div>
                                            {editedUser?.accountType === 'business' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                                        <input
                                                            type="text"
                                                            name="businessName"
                                                            value={editedUser?.businessName || ''}
                                                            onChange={handleChange}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                                                        <input
                                                            type="text"
                                                            name="businessType"
                                                            value={editedUser?.businessType || ''}
                                                            onChange={handleChange}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Address</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={editedUser?.address || ''}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={editedUser?.city || ''}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={editedUser?.state || ''}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={editedUser?.pincode || ''}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Referral Information */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Referral Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Referral Code</label>
                                                <input
                                                    type="text"
                                                    name="referralCode"
                                                    value={editedUser?.referralCode || ''}
                                                    disabled
                                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Referred By</label>
                                                <input
                                                    type="text"
                                                    name="referredBy"
                                                    value={editedUser?.referredBy || ''}
                                                    disabled
                                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Type</label>
                                                <input
                                                    type="text"
                                                    name="referralType"
                                                    value={editedUser?.referralType || ''}
                                                    disabled
                                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}

                                    <div className="col-span-1 md:col-span-2 mt-6 flex justify-end">
                                        {
                                            loading ? <div className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md flex items-center gap-2 shadow-md transition-all duration-300">
                                                <CircularLoading size={35} />
                                            </div> : <button
                                                onClick={handleSave}
                                                className="bg-primary cursor-pointer hover:bg-primary/90 text-white px-6 py-2 rounded-md flex items-center gap-2 shadow-md transition-all duration-300"
                                            >
                                                <Save size={18} />
                                                Save Changes
                                            </button>
                                        }

                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Display View */}
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
                                        <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Personal & Contact Info */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h3>

                                            <div className="flex items-start gap-3">
                                                <Phone className="text-primary mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                    <p className="font-medium">{user?.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Mail className="text-primary mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium">{user?.email}</p>
                                                </div>
                                            </div>
                                            {user?.accountType === 'business' && (<>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="text-primary mt-1" size={18} />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Address</p>
                                                        <p className="font-medium">{user?.address}</p>
                                                        <p className="font-medium">{user?.city}, {user?.state} {user?.pincode}</p>
                                                    </div>
                                                </div>
                                            </>)}

                                        </div>

                                        {/* Account Info */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Information</h3>

                                            <div className="flex items-start gap-3">
                                                <User className="text-primary mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-gray-500">Account Type</p>
                                                    <p className="font-medium capitalize">{user?.accountType}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Lock className="text-primary mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-gray-500">Password</p>
                                                    <p className="font-medium">••••••••••</p>
                                                    <button
                                                        onClick={toggleEdit}
                                                        className="text-xs text-primary hover:text-primary/80 mt-1 underline"
                                                    >
                                                        Change Password
                                                    </button>
                                                </div>
                                            </div>

                                            {user?.accountType === 'business' && (
                                                <>
                                                    <div className="flex items-start gap-3">
                                                        <Briefcase className="text-primary mt-1" size={18} />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Business Name</p>
                                                            <p className="font-medium">{user?.businessName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <Briefcase className="text-primary mt-1" size={18} />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Business Type</p>
                                                            <p className="font-medium">{user?.businessType}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <Hash className="text-primary mt-1" size={18} />
                                                <div>
                                                    <p className="text-sm text-gray-500">Your Referral Code</p>
                                                    <p className="font-medium">{user?.referralCode}</p>
                                                </div>
                                            </div>

                                            {user?.referredBy && (
                                                <div className="flex items-start gap-3">
                                                    <Hash className="text-primary mt-1" size={18} />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Referred By</p>
                                                        <p className="font-medium">{user?.referredBy}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}