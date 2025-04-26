import React from 'react';

export default function Profile() {
    const user = {
        _id: "67f89fe317e776523dae6c3c",
        firstName: "Tejasvi",
        lastName: "Kumar",
        email: "tejasvibihari2000@gmail.com",
        role: "admin",
        profilePicture: "default.jpg", // Replace with the actual image path if available
        createdAt: "2025-04-11T04:51:47.771Z",
    };

    const profileImageUrl = `${import.meta.env.VITE_API_URL}/uploads/${user.profilePicture}`; // Adjust the path based on your backend setup

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <div className="flex flex-col items-center">
                    <img
                        src={profileImageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-32 h-32 rounded-full object-cover border border-gray-300"
                    />
                    <h2 className="text-xl font-semibold mt-4">{`${user.firstName} ${user.lastName}`}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-500 text-sm mt-2 capitalize">{user.role}</p>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold">Profile Details</h3>
                    <ul className="mt-2 text-gray-700">
                        <li>
                            <strong>Full Name:</strong> {`${user.firstName} ${user.lastName}`}
                        </li>
                        <li>
                            <strong>Email:</strong> {user.email}
                        </li>
                        <li>
                            <strong>Role:</strong> {user.role}
                        </li>
                        <li>
                            <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}