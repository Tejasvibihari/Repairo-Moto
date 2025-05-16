import React, { useState } from 'react';
import { Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AllUsersTable = ({ users }) => {

    const exportToExcel = () => {
        const excelData = users.map((user, index) => ({
            "S.No": index + 1,
            "Name": `${user.firstName} ${user.lastName}`,
            "Email": user.email,
            "Phone": user.phone,
            "Account Type": user.accountType.toUpperCase(),
            "Business Name": user.businessName || "-",
            "Address": user.address || "-",
            "City": user.city || "-",
            "State": user.state || "-",
            "Pin Code": user.pincode || "-",
            "Referral Code": user.referralCode,
            "Created At": user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "All Users");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(file, 'All_Users.xlsx');
    };
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-end mb-2">
                <button
                    onClick={exportToExcel}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-yellow-600 cursor-pointer transition"
                >
                    Export to Excel
                </button>
            </div>
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
                            <tr key={user._id} className="bg-white border-b hover:bg-gray-50">
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
        </div >
    );
};

export default AllUsersTable;