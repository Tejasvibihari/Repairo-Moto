import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Home, Bike, FileText, NotebookPen, User2, Briefcase,
    ShoppingCart, QrCode, Menu, ChevronRight,
    User,
    DollarSign,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const admin = useSelector((state) => state.admin.admin.user);

    const currentPath = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

    const menuItems = [
        { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
        // { id: 'invoice', path: '/invoice', label: 'Invoice', icon: <QrCode size={20} /> },
        { id: 'model', path: '/model', label: 'Bike Model', icon: <Bike size={20} /> },
        { id: 'admin-order-form', path: '/admin-order-form', label: 'Order Booking', icon: <ShoppingCart size={20} /> },
        { id: 'manage-order', path: '/manage-order', label: 'Manage Order', icon: <ShoppingCart size={20} /> },
        { id: 'manage-employee', path: '/manage-employee', label: 'Manage Employee', icon: <User2 size={20} /> },
        { id: 'manage-vendor', path: '/manage-vendor', label: 'Manage Vendor', icon: <Briefcase size={20} /> },
        { id: 'manage-qr', path: '/manage-qr', label: 'Manage Qr', icon: <QrCode size={20} /> },
        { id: 'all-user', path: '/all-user', label: 'All User', icon: <User size={20} /> },
        { id: 'manage-referral', path: '/manage-referral', label: 'Manage Referral', icon: <DollarSign size={20} /> },
        { id: 'add-blog', path: '/add-blog', label: 'Add Blog', icon: <FileText size={20} /> },
        { id: 'manage-blog', path: '/manage-blog', label: 'Manage Blog', icon: <NotebookPen size={20} /> },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) setIsMobileMenuOpen(false); // close sidebar after navigation
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen relative bg-gray-100">
            {/* Mobile Overlay */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                bg-secondary text-white h-screen transition-all duration-300 ease-in-out
                ${isMobile
                    ? `fixed top-0 left-0 z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-3/4`
                    : `${collapsed ? 'w-20' : 'w-64'}`
                }
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    {(!collapsed || isMobile) && (
                        <img src="/logo/textlogo72.png" className="w-28" />
                    )}
                    <button
                        onClick={() => isMobile ? setIsMobileMenuOpen(!isMobileMenuOpen) : setCollapsed(!collapsed)}
                        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        {collapsed && !isMobile ? <ChevronRight size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavigation(item.path)}
                                    className={`group flex ${collapsed && !isMobile ? 'justify-center' : 'items-center'} w-full p-2 text-sm hover:bg-gray-700 transition-all ${currentPath === item.id ? 'bg-primary text-secondary' : ''}`}
                                >
                                    <span className={`flex-shrink-0 ${collapsed && !isMobile ? 'mx-auto' : 'text-gray-400 group-hover:text-primary'} ${currentPath === item.id ? 'text-secondary' : ''}`}>
                                        {item.icon}
                                    </span>
                                    {/* Show label in mobile and expanded */}
                                    {(!collapsed || isMobile) && (
                                        <span className="ml-4 font-nunito">{item.label}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile at Bottom (Now visible on both mobile and desktop) */}
                <div className={`absolute bottom-0 border-t border-gray-700 ${isMobile ? 'w-3/4' : (collapsed ? 'w-20' : 'w-64')}`}>
                    <div className="flex items-center p-4 hover:bg-gray-700 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            JS
                        </div>
                        {(!collapsed || isMobile) && (
                            <Link to="/admin-profile">
                                <div className="ml-3">
                                    <p className="text-sm font-medium font-nunito">{admin.firstName} {admin.lastName}</p>
                                    <p className="text-xs text-gray-400">{admin.role.toUpperCase()}</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                {/* Header Bar */}
                <header className="bg-white shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {menuItems.find(item => item.id === currentPath)?.label || 'Dashboard'}
                        </h2>

                        {/* Notifications + Mobile Menu Toggle */}
                        <div className="flex items-center gap-4">
                            {/* Notification Bell Always */}
                            {/* <span className="bg-gray-200 border border-gray-300 rounded cursor-pointer p-1">
                                <Badge badgeContent={4} color="success">
                                    <NotificationsIcon color="action" />
                                </Badge>
                            </span> */}

                            {/* Mobile Menu Button */}
                            {isMobile && (
                                <button
                                    className="p-2 border rounded"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Sidebar; 