import { QrCode } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axiosClient from '../service/axiosClient';

export default function QrTable({ onGenerateQR }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    axiosClient.get("/api/user/getalluser"),
                    axiosClient.get("/api/admin/employee/getallemployee"),
                    axiosClient.get("/api/vendor/getallvendor"),
                ]);

                // Extract data from successful responses
                const users = results[0].status === "fulfilled" ? results[0].value.data.users.map((item) => ({ ...item, type: "User" })) : [];
                const employees = results[1].status === "fulfilled" ? results[1].value.data.employees.map((item) => ({ ...item, type: "Employee" })) : [];
                const vendors = results[2].status === "fulfilled" ? results[2].value.data.vendors.map((item) => ({ ...item, type: "Vendor" })) : [];

                // Combine all data into a single array
                const combinedData = [...users, ...employees, ...vendors];

                setData(combinedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <table className="min-w-full w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-center">No.</th>
                        <th className="px-4 py-2 text-center">Image</th>
                        <th className="px-4 py-2 text-center">Name</th>
                        <th className="px-4 py-2 text-center">Type</th>
                        <th className="px-4 py-2 text-center">Referral Code</th>
                        <th className="px-4 py-2 text-center">Joined</th>
                        {/* <th className="px-4 py-2 text-center">Status</th> */}
                        <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 text-center border-b border-gray-200">
                                <td className="px-3 py-2">{index + 1}</td>
                                <td className="px-3 py-2 flex items-center justify-center">
                                    <img
                                        src={item.profileImage ? `${import.meta.env.VITE_API_URL}${item.profileImage}` : "/profileplaceholder.png"}
                                        alt="User"
                                        className="w-10 h-10 object-cover rounded-full"
                                    />
                                </td>
                                <td className="px-3 py-2">{item.firstName} {item.lastName}</td>
                                <td className="px-3 py-2 text-gray-600">{item.type}</td>
                                <td className="px-3 py-2">{item.referralCode || "N/A"}</td>
                                <td className="px-3 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                {/* <td className="px-3 py-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                        {item.status || "Inactive"}
                                    </span>
                                </td> */}
                                <td className="px-3 py-2 flex gap-2 flex-wrap justify-center">
                                    <button
                                        onClick={() => onGenerateQR(`${import.meta.env.VITE_FRONTEND_URL}/user-signup/${item.accountType}/${item.referralCode}`)}
                                        className="flex items-center justify-center bg-transparent text-green-600 py-2 rounded-md px-3 cursor-pointer hover:bg-green-600 hover:text-white border border-green-600">
                                        <QrCode size={18} className="mr-0 md:mr-2" />
                                        <span className="hidden md:inline">Generate Qr</span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center py-4 text-gray-500">
                                No Data Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
}