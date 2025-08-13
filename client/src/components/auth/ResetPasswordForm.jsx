import React, { useState } from 'react';
import { Lock, Eye, EyeClosed } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../app/slice/userSlice';
import AlertSnackBar from '../ui/AlertSnackBar';
import CircularLoading from '../ui/CircularLoading';
import axiosClient from '../../service/axiosClient';
import { Link } from 'react-router-dom';

export default function ResetPassword({ userType, token }) {
    const loading = useSelector((state) => state.user.loading);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');


    const handleShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
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

        if (!formData.newPassword || !formData.confirmPassword) {
            setSnackBarMessage('Please fill in all required fields.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setSnackBarMessage('Passwords do not match.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        if (!validatePassword(formData.newPassword)) {
            setSnackBarMessage('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            return;
        }

        try {

            const response = await axiosClient.post(`/api/admin/reset-password/${userType}/${token}`, {
                token,
                password: formData.newPassword
            });
            setSnackBarMessage(response.data.message || 'Password reset successfully.');
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            dispatch(setLoading(false));
            setFormData({
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => navigate('/user-signin'), 2000); // Redirect to sign-in after success
        } catch (err) {
            // console.error(err);  
            setSnackBarMessage(err.response?.data?.message || 'Failed to reset password.');
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
                            Set New Password
                        </h1>
                        <p className="text-sm md:text-base" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Create a strong new password for your account
                        </p>
                    </div>

                    <div className="flex flex-col w-full space-y-5">
                        <div>
                            <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>New Password</label>
                            <div className="relative mt-1 group">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                    style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                    required
                                />
                                {showNewPassword ? (
                                    <Eye
                                        onClick={handleShowNewPassword}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 cursor-pointer hover:text-yellow-600 transition-colors"
                                        style={{ color: '#78dcca' }}
                                    />
                                ) : (
                                    <EyeClosed
                                        onClick={handleShowNewPassword}
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
                            <label className="text-sm font-medium" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>Confirm New Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#78dcca' }} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-200 ease-in-out"
                                    style={{ borderColor: '#78dcca', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929', backgroundColor: '#ffffff', focusRingColor: '#e2a731' }}
                                    required
                                />
                                {showConfirmPassword ? (
                                    <Eye
                                        onClick={handleShowConfirmPassword}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 cursor-pointer hover:text-yellow-600 transition-colors"
                                        style={{ color: '#78dcca' }}
                                    />
                                ) : (
                                    <EyeClosed
                                        onClick={handleShowConfirmPassword}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 cursor-pointer hover:text-yellow-600 transition-colors"
                                        style={{ color: '#78dcca' }}
                                    />
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="py-2.5 w-full text-white font-semibold rounded-lg focus:ring-4 focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#e2a731', fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#ffffff' }}
                            disabled={loading}
                        >
                            {loading ? <CircularLoading size={20} color="inherit" /> : 'Set New Password'}
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm" style={{ fontFamily: 'Nunito, Roboto, Inter, sans-serif', color: '#292929' }}>
                            Back to{' '}
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