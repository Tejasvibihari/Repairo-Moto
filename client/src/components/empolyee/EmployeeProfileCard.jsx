import { User, MapPin, Phone, Mail, Star, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEmployeeLogout } from "../../app/slice/employeeAuth";
import { setEmployeeSignOut } from "../../app/slice/authSlice";

export default function EmployeeProfileCard() {
    const [copied, setCopied] = useState(false);
    const employee = useSelector((state) => state.employeeAuth.employee)
    const dispatch = useDispatch()

    const employeeLogout = () => {
        dispatch(setEmployeeLogout())
        dispatch(setEmployeeSignOut())
    }
    const copyReferralCode = () => {
        navigator.clipboard.writeText(employee.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Primary color variables
    const primaryColor = "#e2a731";
    const primaryColorLight = "#f5e1bc";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Card Header with Profile Image */}
                <div
                    className="p-4 flex flex-col items-center sm:flex-row sm:items-start"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="relative">
                        <img
                            src={`${import.meta.env.VITE_API_URL}/${employee.profileImage}`}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            className="h-24 w-24 rounded-full border-4 border-white object-cover"
                        />
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                        <h1 className="text-xl font-bold text-white">{employee.firstName} {employee.lastName}</h1>
                        <p className="text-white text-opacity-90 text-sm capitalize">{employee.role}</p>
                        <div className="flex items-center justify-center sm:justify-start mt-1">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={i < employee.rating ? "text-white fill-white" : "text-white text-opacity-30"}
                                    />
                                ))}
                            </div>
                            <span className="text-white text-xs ml-2">{employee.rating}/5</span>
                        </div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                    {/* Employee Details */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <User
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Your Referral Code</p>
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-500 mr-2">{employee.referralCode}</p>
                                    <button
                                        onClick={copyReferralCode}
                                        className="text-xs p-1 rounded-md hover:bg-gray-100"
                                        title="Copy referral code"
                                    >
                                        {copied ? (
                                            <CheckCheck size={14} className="text-green-500" />
                                        ) : (
                                            <Copy size={14} style={{ color: primaryColor }} />
                                        )}
                                    </button>
                                </div>
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: primaryColor }}
                                >
                                    Share this code to invite others to join
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Mail
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email</p>
                                <p className="text-sm text-gray-500 break-all">{employee.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Phone
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Phone</p>
                                <p className="text-sm text-gray-500">{employee.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <MapPin
                                className="h-5 w-5"
                                style={{ color: primaryColor }}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Address</p>
                                <p className="text-sm text-gray-500">
                                    {employee.address}, {employee.city}, {employee.state} - {employee.pinCode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div
                    className="px-6 py-4 border-t border-gray-100"
                    style={{ backgroundColor: primaryColorLight }}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <button
                            className="w-full sm:w-auto mb-2 sm:mb-0 text-white py-2 px-4 rounded-lg transition-colors duration-300"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={employeeLogout}
                            className="w-full cursor-pointer sm:w-auto bg-white py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 border"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}