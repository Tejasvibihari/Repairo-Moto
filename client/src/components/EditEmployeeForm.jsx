import React, { useState } from 'react';
import Heading from './ui/Heading';
import { UserPen } from 'lucide-react';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';
import CircularLoading from './ui/CircularLoading';

export default function EditEmployeeForm({ initialData, onSuccess }) {
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        position: initialData?.position || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        pinCode: initialData?.pinCode || '',
        aadhar: initialData?.aadhar || '',
        dl: initialData?.dl || '',
        profileImage: null, // File input
    });
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity


    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            profileImage: e.target.files[0], // Store the file object
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        console.log("Form submitted"); // Debugging log

        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        try {
            const response = await axiosClient.put(`/api/admin/employee/updateemployee/${initialData.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Employee updated successfully:', response);
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            setLoading(false)
            if (onSuccess) {
                onSuccess(response.data); // Callback to refresh the UI or show a success message
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        } finally {
            setLoading(false);
        }
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
            <Heading heading="Edit Employee" />
            <form className="shadow-sm border border-gray-300 rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="First Name"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Last Name"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="0000000000"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Aadhar No.</label>
                        <input
                            type="number"
                            name="aadhar"
                            value={formData.aadhar}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Aadhar Number"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Driving Licence</label>
                        <input
                            type="text"
                            name="dl"
                            value={formData.dl}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Driving Licence"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Role</label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                        >
                            <option value="" disabled>Select One</option>
                            <option value="admin">Operation Manager</option>
                            <option value="mechanic">Mechanic</option>
                            <option value="delivery">Delivery</option>
                            <option value="manager">Manager</option>
                            <option value="hr">HR</option>
                            <option value="accountant">Accountant</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Profile Image</label>
                        <input
                            type="file"
                            name="profileImage"
                            onChange={handleFileChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Address"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="City"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="State"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Pincode</label>
                        <input
                            type="number"
                            name="pinCode"
                            value={formData.pinCode}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="000000"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-primary text-white hover:bg-transparent hover:text-primary border border-primary font-semibold py-2 px-4 rounded-md mt-4 col-span-1 md:col-span-3 cursor-pointer"
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {loading ? <CircularLoading /> : <span className='flex flex-row'><UserPen className='mr-2' /> Make Changes</span>}
                </button>
            </form>
        </div>
    );
}