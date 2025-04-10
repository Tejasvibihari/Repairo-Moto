import React, { useState } from 'react';
import Heading from './ui/Heading';
import { Store } from 'lucide-react';

export default function AddVendorForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        businessName: '', // New field
        gstNo: '', // New field
        profileImage: null, // File input
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Add logic to send formData to the backend
    };

    return (
        <div>
            <Heading heading={"Add Vendor"} />
            <form className="shadow-sm border border-gray-300 rounded p-4 mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Phone Number"
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
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">Business Name</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Business Name"
                        />
                    </div>
                    <div>
                        <label className="text-gray-700 font-semibold mb-2 block text-sm">GST No.</label>
                        <input
                            type="text"
                            name="gstNo"
                            value={formData.gstNo}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="GST No."
                        />
                    </div>
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
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            className="border-2 border-gray-300 rounded-md p-2 w-full"
                            required
                            placeholder="Pincode"
                        />
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
                <button
                    type="submit"
                    className="bg-primary text-white hover:bg-transparent hover:text-primary border border-primary font-semibold py-2 px-4 rounded-md mt-4 cursor-pointer"
                >
                    <span className='flex flex-row'><Store className='mr-2' />Add Vendor</span>
                </button>
            </form>
        </div>
    );
}