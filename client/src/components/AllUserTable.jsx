import React, { useState } from 'react';
import { Search } from 'lucide-react';

const AllUsersTable = ({ users }) => {
    // Sample users data


    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 cursor-pointer">
                                S.No
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Image
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Name
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Email
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Phone
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Account Type
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Bussiness Name
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Address
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                City
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                State
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Pin Code
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Referral Code
                            </th>
                            <th className="px-6 py-3 cursor-pointer">
                                Created At
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user, index) => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex-shrink-0 overflow-hidden">
                                        {user.profileImage ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                                {user.firstName.charAt(0) + user.lastName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.phone}</td>
                                <td className="px-6 py-4 capitalize">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.accountType === 'personal' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {user.accountType.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user?.businessName ? user?.businessName : "-"}</td>
                                <td className="px-6 py-4">{user?.address ? user.address : "-"}</td>
                                <td className="px-6 py-4">{user?.city ? user.city : "-"}</td>
                                <td className="px-6 py-4">{user?.state ? user.state : "-"}</td>
                                <td className="px-6 py-4">{user?.pincode ? user.pincode : "-"}</td>
                                <td className="px-6 py-4">{user.referralCode}</td>
                                <td className="px-6 py-4">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table >
            </div >

            {/* <div className="flex justify-between items-center mt-4">
                <div>
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-medium">{users.length}</span> users
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Previous</button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Next</button>
                </div>
            </div> */}
        </div >
    );
};

export default AllUsersTable;