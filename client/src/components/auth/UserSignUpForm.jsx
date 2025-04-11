import { Eye, EyeClosed, Lock, Mail, User, Building } from 'lucide-react';
import React, { useState } from 'react';
import axiosClient from '../../service/axiosClient';
import AlertSnackBar from '../ui/AlertSnackBar';
import { useParams } from 'react-router-dom'; // Import useParams


export default function UserSignUpForm() {
    const { referralType, referralId } = useParams();
    console.log(referralType)
    console.log(referralId)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        referralCode: referralId || '',
        accountType: 'personal', // Default to personal
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
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        setSnackBarMessage('');
        setSnackBarOpen(false);

        // Basic validation
        if (!formData.firstName || !formData.email || !formData.password || !formData.phone) {
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
            const response = await axiosClient.post('/api/user/register', formData);
            setSnackBarMessage('User registered successfully!');
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
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
        } catch (err) {
            console.error(err);
            setSnackBarMessage(err.response?.data?.message || 'Registration failed.');
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
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
                            USER SIGN UP
                        </span>
                        <span className='text-base text-center font-bold leading-normal text-white-dark font-nunito'>
                            Enter your details to register
                        </span>
                    </div>

                    <form className='flex flex-col my-10 w-full space-y-4' onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='font-nunito'>First Name</label>
                                <div className='relative mt-1'>
                                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                    <input
                                        type='text'
                                        name='firstName'
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder='Enter First Name'
                                        className='pl-10 p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='font-nunito'>Last Name</label>
                                <div className='relative mt-1'>
                                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                    <input
                                        type='text'
                                        name='lastName'
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder='Enter Last Name'
                                        className='pl-10 p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='font-nunito'>Phone</label>
                                <div className='relative mt-1'>
                                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                    <input
                                        type='text'
                                        name='phone'
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder='Enter Phone Number'
                                        className='pl-10 p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                        required
                                    />
                                </div>
                            </div>
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
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                            <div>
                                <label className='font-nunito'>Referral ID</label>
                                <div className='relative mt-1'>
                                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                    <input
                                        type='text'
                                        name='referralCode'
                                        value={formData.referralCode}
                                        onChange={handleChange}
                                        disabled={referralId && "disabled"}
                                        placeholder='Enter Referral ID (Optional)'
                                        className='pl-10 p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className='font-nunito'>Account Type</label>
                            <select
                                name='accountType'
                                value={formData.accountType}
                                onChange={handleChange}
                                className='p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                required
                            >
                                <option value='personal'>Personal</option>
                                <option value='business'>Business</option>
                            </select>
                        </div>
                        {formData.accountType === 'business' && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='font-nunito'>Business Name</label>
                                    <div className='relative mt-1'>
                                        <Building className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                        <input
                                            type='text'
                                            name='businessName'
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder='Enter Business Name'
                                            className='pl-10 p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className='font-nunito'>Address</label>
                                    <input
                                        type='text'
                                        name='address'
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder='Enter Address'
                                        className='p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='font-nunito'>City</label>
                                    <input
                                        type='text'
                                        name='city'
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder='Enter City'
                                        className='p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='font-nunito'>State</label>
                                    <input
                                        type='text'
                                        name='state'
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder='Enter State'
                                        className='p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='font-nunito'>Pincode</label>
                                    <input
                                        type='text'
                                        name='pincode'
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder='Enter Pincode'
                                        className='p-2 border border-gray-300 bg-white rounded w-full font-nunito text-sm'
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            type='submit'
                            className='py-2 bg-primary rounded text-white font-semibold font-nunito mt-6 border border-primary hover:bg-secondary hover:text-primary cursor-pointer'
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}