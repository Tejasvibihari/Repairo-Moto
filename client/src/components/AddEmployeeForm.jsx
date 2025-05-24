import React, { useState } from 'react';
import Heading from './ui/Heading';
import CircularLoading from './ui/CircularLoading';
import { UserRoundPlus } from 'lucide-react';
import axios from 'axios';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import { useDispatch } from 'react-redux';
import { addEmployee, setEmployee } from '../app/slice/employeeSlice';

export default function AddEmployeeForm() {
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        position: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        aadhar: '',
        dl: '',
        profileImage: null,
        aadharFront: null,
        aadharBack: null,
        dlImage: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files[0],
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });


        try {
            console.log('Form Data:', formData);
            const res = await axiosClient.post('/api/admin/employee/addemployee', data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Ensure correct content type
                    },
                }
            );
            console.log('Employee added:', res);
            dispatch(addEmployee(res.data.employee)); // Dispatch the employee data to the Redux store
            setLoading(false);
            console.log(res.data.message); // Set the message to display in the Snackbar
            setSnackBarMessage(res.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true);
            setFormData({
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                position: '',
                address: '',
                city: '',
                state: '',
                pinCode: '',
                aadhar: '',
                dl: '',
                profileImage: null,
                aadharFront: null,
                aadharBack: null,
                dlImage: null
            });

        } catch (err) {
            console.log('Error:', err);
            // Check if the error has a response and status code
            if (err.response && err.response.status === 400) {
                setSnackBarMessage(err.response.data.message || 'Bad Request'); // Use the server-provided message or fallback
            } else {
                setSnackBarMessage(err.message || 'Something went wrong'); // Fallback to general error message
            }

            setSnackBarSeverity('error'); // Set severity to error
            setSnackBarOpen(true); // Open the Snackbar
            setLoading(false);

            // alert('Something went wrong.');
        }

        setLoading(false);
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarOpen(false);
    }

    return (
        <div>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />
            <Heading heading="Add Employee" />
            <form className='shadow-sm border border-gray-300 rounded p-4' onSubmit={handleSubmit}>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-6'>
                    <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                    <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                    <InputField label="Phone Number" type='number' name="phone" value={formData.phone} onChange={handleChange} />
                    <InputField label="Email" name="email" value={formData.email} type="email" onChange={handleChange} />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
                    <InputField label="Aadhar" name="aadhar" value={formData.aadhar} type="number" onChange={handleChange} />
                    <InputField label="Driving Licence" name="dl" value={formData.dl} type="text" onChange={handleChange} />
                    <div>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>Position</label>
                        <select name="position" value={formData.position} onChange={handleChange} required className='border-2 border-gray-300 rounded-md p-2 w-full'>
                            <option value="" disabled>Select One</option>
                            <option value="employee">Employee</option>
                            <option value="mechanic">Mechanic</option>
                            <option value="delivery">Delivery</option>
                            <option value="manager">Manager</option>
                            <option value="operational manager">Operational Manager</option>
                            <option value="telecaller">Telecaller</option>
                        </select>
                    </div>
                </div >
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4'>
                    <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
                    <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
                    <InputField label="State" name="state" value={formData.state} onChange={handleChange} />
                    <InputField label="Pincode" name="pinCode" value={formData.pinCode} onChange={handleChange} type="number" />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4'>
                    <div>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>Profile Image</label>
                        <input
                            type='file'
                            accept='image/*'
                            name='profileImage'
                            onChange={handleFileChange}
                            required
                            className='border-2 border-gray-300 rounded-md p-2 w-full' />
                    </div>
                    <div>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>Aadhar Front Image</label>
                        <input
                            type='file'
                            accept='image/*'
                            name='aadharFront'
                            onChange={handleFileChange}
                            required
                            className='border-2 border-gray-300 rounded-md p-2 w-full' />
                    </div>
                    <div>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>Aadhar Back Image</label>
                        <input
                            type='file'
                            accept='image/*'
                            name='aadharBack'
                            onChange={handleFileChange}
                            required
                            className='border-2 border-gray-300 rounded-md p-2 w-full' />
                    </div>
                    <div>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>Driving License Image</label>
                        <input
                            type='file'
                            accept='image/*'
                            name='dlImage'
                            onChange={handleFileChange}
                            required
                            className='border-2 border-gray-300 rounded-md p-2 w-full' />
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-primary mt-4 font-semibold hover:bg-transparent hover:text-primary border-primary border text-white px-4 py-2 rounded cursor-pointer"
                >
                    {loading ? (
                        <div className='flex items-center justify-center'>
                            <CircularLoading size={20} />
                        </div>
                    ) : (
                        <span className='flex flex-row items-center justify-center'><UserRoundPlus className='mr-2' /> Add Employee</span>
                    )}
                </button>
            </form >
        </div >
    );
}

function InputField({ label, name, value, onChange, type = "text" }) {
    return (
        <div>
            <label className='text-gray-700 font-semibold mb-2 block text-sm'>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required
                className='border-2 border-gray-300 rounded-md p-2 w-full'
                placeholder={label}
            />
        </div>
    );
}
