import { Eye, EyeClosed, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import axiosClient from '../../service/axiosClient';
import AlertSnackBar from '../ui/AlertSnackBar';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CircularLoading from '../ui/CircularLoading';
import { setVendorSignIn, setLoading } from '../../app/slice/vendorAuth';
import { setVendorToken } from '../../app/slice/authSlice';

export default function VendorSignInForm() {
    const loading = useSelector((state) => state.vendorAuth.loading);
    const error = useSelector((state) => state.vendorAuth.error);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(setLoading(true));
        setSnackBarMessage('');
        setSnackBarOpen(false);

        if (!formData.email || !formData.password) {
            setSnackBarMessage('Please fill in all required fields.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        try {
            const response = await axiosClient.post('api/vendor/auth/vendor-sign-in', formData);
            dispatch(setVendorSignIn(response.data.vendor));
            dispatch(setVendorToken(response.data.token));
            setSnackBarMessage(response.data.message || 'Login successful.');
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            setFormData({
                email: '',
                password: '',
            });
            navigate('/vendor/dashboard');
        } catch (err) {
            console.error(err);
            setSnackBarMessage(err.response?.data?.message || 'Login failed.');
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
                            Vendor Sign In
                        </h1>
                        <p className="text-sm md:text-base" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Enter your credentials to access your vendor dashboard
                        </p>
                    </div>

                    <div className="flex flex-col w-full space-y-5">
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
                        <div>
                            <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Password</label>
                            <div className="relative mt-1">
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
                            </div>
                            <div className="text-right mt-2">
                                <Link to="/forgot-password" className="text-sm font-medium hover:underline" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#e2a731' }}>
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="py-2.5 w-full text-white font-semibold rounded-lg focus:ring-4 focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#e2a731', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#ffffff' }}
                            disabled={loading}
                        >
                            {loading ? <CircularLoading size={20} color="inherit" /> : 'Sign In'}
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Are you an Employee?{' '}
                            <Link to="/employee/sign-in" className="font-medium hover:underline" style={{ color: '#e2a731' }}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}