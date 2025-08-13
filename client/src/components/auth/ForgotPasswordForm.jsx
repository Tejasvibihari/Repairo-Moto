import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../app/slice/userSlice';
import AlertSnackBar from '../ui/AlertSnackBar';
import CircularLoading from '../ui/CircularLoading';
import { Link } from 'react-router-dom';
import axiosClient from '../../service/axiosClient';

export default function ForgotPasswordForm() {
    const loading = useSelector((state) => state.user.loading);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: '',
        userType: 'User'
    });
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

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

        if (!formData.email) {
            setSnackBarMessage('Please enter your email address.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        try {
            const response = await axiosClient.post('/api/admin/forgotpassword', formData);
            setSnackBarMessage(response.data.message || 'Password reset link sent to your email.');
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            setFormData({
                email: '',
                userType: 'User'
            });
            setTimeout(() => navigate('/user-signin'), 2000); // Redirect to sign-in after success
        } catch (err) {
            console.error(err);
            setSnackBarMessage(err.response?.data?.message || 'Failed to send password reset link.');
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
                            Forgot Password
                        </h1>
                        <p className="text-sm md:text-base" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Select your user type and enter your email to reset your password
                        </p>
                    </div>

                    <div className="flex flex-col w-full space-y-5">
                        <div>
                            <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>User Type</label>
                            <div className="relative mt-1">
                                <select
                                    name="userType"
                                    value={formData.userType}
                                    onChange={handleChange}
                                    className="pl-4 pr-8 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out appearance-none"
                                    style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                    required
                                >
                                    <option value="User">User</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Vendor">Vendor</option>
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4" style={{ color: '#78dcca' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
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
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="py-2.5 w-full text-white font-semibold rounded-lg focus:ring-4 focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#e2a731', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#ffffff' }}
                            disabled={loading}
                        >
                            {loading ? <CircularLoading size={20} color="inherit" /> : 'Send Reset Link'}
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Remembered your password?{' '}
                            <Link to="/user-signin" className="font-medium hover:underline" style={{ color: '#e2a731' }}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}