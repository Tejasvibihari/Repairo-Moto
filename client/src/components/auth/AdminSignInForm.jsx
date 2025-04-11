import { Eye, EyeClosed, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setError, setLoading } from '../../app/slice/adminAuthSlice';
import axiosClient from '../../service/axiosClient';

export default function AdminSignInForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const admin = useSelector((state) => state.admin);
    const loading = useSelector((state) => state.admin.loading);
    const error = useSelector((state) => state.admin.error);
    const dispatch = useDispatch()
    console.log(admin);
    const [showPassword, setShowPassword] = useState(false);


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
        dispatch(setError(null))
        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Both email and password are required');
            setLoading(false);
            return;
        }
        try {
            console.log(formData)
            // Simulate API call
            const response = await axiosClient.post("", formData);
            console.log(response);
            dispatch(setLoading(false))
            console.log('Sign-in successful:', response);
            alert('Sign-in successful!');
        } catch (err) {
            console.error('Sign-in failed:', err);
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    // Simulated API call (replace with actual API call)
    const fakeSignInAPI = (data) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (data.email === 'admin@example.com' && data.password === 'password123') {
                    resolve({ message: 'Sign-in successful' });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    };

    return (
        <>
            <div className='h-3xl h-9/12 w-3xl bg-opacity-90 backdrop-blur-lg shadow-2xl rounded-lg p-10'>
                <div className='flex flex-col items-center justify-center'>
                    <div className='flex flex-col space-y-2'>
                        <span className='text-primary text-center text-2xl font-extrabold uppercase !leading-snug font-nunito md:text-3xl border-secondary border-l-6 border-r-6 pl-2'>
                            ADMIN SIGN IN
                        </span>
                        <span className='text-base font-bold leading-normal text-white-dark font-nunito'>
                            Enter your email and password to login
                        </span>
                    </div>

                    <form className='flex flex-col my-10 w-74 space-y-4' onSubmit={handleSubmit}>
                        {error && (
                            <div className='text-red-500 text-sm font-nunito'>
                                {error}
                            </div>
                        )}
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
                            <div>
                                <span className='text-xs font-nunito cursor-pointer'>
                                    Forget Password?
                                </span>
                            </div>
                        </div>
                        <button
                            type='submit'
                            className='py-2 bg-primary rounded text-white font-semibold font-nunito mt-6 border border-primary hover:bg-secondary hover:text-primary cursor-pointer'
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}