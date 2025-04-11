import { Eye, EyeClosed, Lock, Mail, User, Building } from 'lucide-react';
import React, { useState } from 'react';
import axiosClient from '../../service/axiosClient';
import AlertSnackBar from '../ui/AlertSnackBar';
import { useNavigate } from 'react-router-dom'; // Import useParams
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUserSignIn } from '../../app/slice/userSlice';
import { Link } from 'react-router-dom';
import CircularLoading from '../ui/CircularLoading';

export default function UserSignInForm() {
    const loading = useSelector((state) => state.user.loading);
    const error = useSelector((state) => state.user.error);
    const navigate = useNavigate(); // Initialize useNavigate
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
        dispatch(setLoading(true))
        setSnackBarMessage('');
        setSnackBarOpen(false);

        // Basic validation
        if (!formData.email || !formData.password) {
            setSnackBarMessage('Please fill in all required fields.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            setLoading(false);
            return;
        }

        if (formData.accountType === 'business' && (!formData.businessName || !formData.address || !formData.city || !formData.state || !formData.pincode)) {
            setSnackBarMessage('Please fill in all business details.');
            setSnackBarSeverity('warning');
            setSnackBarOpen(true);
            setLoading(false);
            return;
        }

        try {
            console.log(formData)
            const response = await axiosClient.post('api/user/auth/user-sign-in', formData);
            console.log(response);
            dispatch(setUserSignIn(response.data))
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            dispatch(setLoading(false))
            setFormData({
                email: '',
                password: '',
            });
        } catch (err) {
            console.error(err);
            setSnackBarMessage(err.response?.data?.message || 'Login failed.');
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
            dispatch(setLoading(false))
        } finally {
            setLoading(false);
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
            <div className='h-auto w-auto bg-opacity-90 backdrop-blur-lg shadow-2xl rounded-lg p-10'>
                <div className='flex flex-col items-center justify-center'>
                    <div className='flex flex-col space-y-2'>
                        <span className='text-primary text-center text-2xl font-extrabold uppercase !leading-snug font-nunito md:text-3xl border-secondary border-l-6 border-r-6 pl-2'>
                            SIGN IN
                        </span>
                        <span className='text-base text-center font-bold leading-normal text-white-dark font-nunito'>
                            Enter your details to login
                        </span>
                    </div>

                    <form className='flex flex-col my-10 w-full space-y-4' onSubmit={handleSubmit}>
                        <div>
                            <label className='font-nunito'>Email</label>
                            <div className='relative mt-1'>
                                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='Enter Email'
                                    className='pl-10 p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className='font-nunito'>Password</label>
                            <div className='relative mt-1'>
                                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder='Enter Password'
                                    className='pl-10 pr-10 p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                    required
                                />
                                {showPassword ? (
                                    <Eye
                                        onClick={handleShowPassword}
                                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer'
                                    />
                                ) : (
                                    <EyeClosed
                                        onClick={handleShowPassword}
                                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer'
                                    />
                                )}
                            </div>
                        </div>
                        <button
                            type='submit'
                            className='py-2 flex items-center justify-center bg-primary rounded text-white font-semibold font-nunito mt-6 border border-primary hover:bg-secondary hover:text-primary cursor-pointer'
                            disabled={loading}
                        >
                            {loading ? <CircularLoading size={23} /> : 'Login'}
                        </button>
                    </form>
                    <div>
                        <span className='text-sm text-center font-nunito text-white'>
                            Don't have an account?{' '}
                            <Link to='/user-signup' className='text-primary hover:underline'>
                                Sign Up
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}