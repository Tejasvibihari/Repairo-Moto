import { Eye, EyeClosed, Lock, Mail, User, Building } from 'lucide-react';
import React, { useState } from 'react';
import axiosClient from '../../service/axiosClient';
import AlertSnackBar from '../ui/AlertSnackBar';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CircularLoading from '../ui/CircularLoading';
import { setLoading, setUserSignIn } from '../../app/slice/userSlice';
import { useNavigate } from 'react-router-dom';

export default function UserSignUpForm() {
    const { referralId } = useParams();
    const loading = useSelector((state) => state.user.loading);
    const error = useSelector((state) => state.user.error);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        referredBy: referralId || '',
        accountType: 'personal',
        businessName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(setLoading(true));
        setSnackBarMessage('');
        setSnackBarOpen(false);

        if (!formData.firstName || !formData.email || !formData.password || !formData.phone) {
            setSnackBarMessage('Please fill in all required fields.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        if (!validatePassword(formData.password)) {
            setSnackBarMessage('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        if (formData.accountType === 'business' && (!formData.businessName || !formData.address || !formData.city || !formData.state || !formData.pincode)) {
            setSnackBarMessage('Please fill in all business details.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        try {
            const response = await axiosClient.post('api/user/auth/user-sign-up', formData);
            dispatch(setUserSignIn(response.data.user));
            setSnackBarMessage(response.data.message || 'Registration successful.');
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            setFormData({
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                password: '',
                accountType: 'personal',
                businessName: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
            });
            navigate('/user-signin');
        } catch (err) {
            console.error(err);
            setSnackBarMessage(err.response?.data?.message || 'Registration failed.');
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />
            <div className="max-w-md w-full mx-auto bg-white bg-opacity-95 backdrop-blur-xl shadow-lg rounded-2xl p-8 md:p-10 transition-all duration-300 ease-in-out transform hover:shadow-xl">
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            User Sign Up
                        </h1>
                        <p className="text-sm md:text-base" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Create an account to get started
                        </p>
                    </div>

                    <div className="flex flex-col w-full space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>First Name</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Last Name</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter last name"
                                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Phone</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Email</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Password</label>
                                <div className="relative mt-1 group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                    {showPassword ? (
                                        <Eye
                                            onClick={handleShowPassword}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 cursor-pointer hover:text-yellow-600 transition-colors"
                                            style={{ color: '#78dcca' }}
                                        />
                                    ) : (
                                        <EyeClosed
                                            onClick={handleShowPassword}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 cursor-pointer hover:text-yellow-600 transition-colors"
                                            style={{ color: '#78dcca' }}
                                        />
                                    )}
                                    <div className="hidden group-hover:block absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-600" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif' }}>
                                        Password must include:
                                        <ul className="list-disc list-inside">
                                            <li>At least 8 characters</li>
                                            <li>Uppercase and lowercase letters</li>
                                            <li>At least one number</li>
                                            <li>At least one special character</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Referral ID</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                    <input
                                        type="text"
                                        name="referredBy"
                                        value={formData.referredBy}
                                        onChange={handleChange}
                                        disabled={!!referralId}
                                        placeholder="Enter referral ID (optional)"
                                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Account Type</label>
                            <select
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleChange}
                                className="p-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                required
                            >
                                <option value="personal">Personal</option>
                                <option value="business">Business</option>
                            </select>
                        </div>
                        {formData.accountType === 'business' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Business Name</label>
                                    <div className="relative mt-1">
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder="Enter business name"
                                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                            style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter address"
                                        className="p-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                        className="p-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                        className="p-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="Enter pincode"
                                        className="p-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                        style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="py-2.5 w-full text-white font-semibold rounded-lg focus:ring-4 focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#e2a731', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#ffffff' }}
                            disabled={loading}
                        >
                            {loading ? <CircularLoading size={20} color="inherit" /> : 'Register'}
                        </button>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Already have an account?{' '}
                            <Link to="/user-signin" className="font-medium hover:underline" style={{ color: '#e2a731' }}>
                                Sign In
                            </Link>
                        </p>
                        <p className="text-sm" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Forgot your password?{' '}
                            <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: '#e2a731' }}>
                                Reset Password
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}