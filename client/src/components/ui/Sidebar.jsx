import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Home, Bike, FileText, NotebookPen, User2, Briefcase,
    ShoppingCart, QrCode, Menu, ChevronLeft, ChevronRight,
    User, DollarSign, X
} from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const admin = useSelector((state) => state.admin.admin.user);

    const currentPath = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

    const menuItems = [
        { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
        { id: 'model', path: '/model', label: 'Bike Model', icon: <Bike size={18} /> },
        { id: 'admin-order-form', path: '/admin-order-form', label: 'Order Booking', icon: <ShoppingCart size={18} /> },
        { id: 'manage-order', path: '/manage-order', label: 'Manage Order', icon: <ShoppingCart size={18} /> },
        { id: 'manage-employee', path: '/manage-employee', label: 'Manage Employee', icon: <User2 size={18} /> },
        { id: 'manage-vendor', path: '/manage-vendor', label: 'Manage Vendor', icon: <Briefcase size={18} /> },
        { id: 'manage-qr', path: '/manage-qr', label: 'Manage QR', icon: <QrCode size={18} /> },
        { id: 'all-user', path: '/all-user', label: 'All Users', icon: <User size={18} /> },
        { id: 'manage-referral', path: '/manage-referral', label: 'Manage Referral', icon: <DollarSign size={18} /> },
        { id: 'add-blog', path: '/add-blog', label: 'Add Blog', icon: <FileText size={18} /> },
        { id: 'manage-blog', path: '/manage-blog', label: 'Manage Blog', icon: <NotebookPen size={18} /> },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) setIsMobileMenuOpen(false);
    };

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        } else {
            setCollapsed(!collapsed);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileMenuOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen relative bg-gray-100">
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 ${isMobile && isMobileMenuOpen
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible'
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`
                bg-secondary border-r border-gray-200 h-screen 
                transition-all duration-300 ease-in-out shadow-sm
                ${isMobile
                    ? `fixed top-0 left-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } w-64`
                    : `${collapsed ? 'w-16' : 'w-60'}`
                }
                flex flex-col
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
                    <div className={`transition-all duration-300 overflow-hidden ${collapsed && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'
                        }`}>
                        {(!collapsed || isMobile) && (
                            <img
                                src="/logo/textlogo72.png"
                                className="h-8 w-auto"
                                alt="Logo"
                            />
                        )}
                    </div>

                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-md hover:bg-primary transition-colors duration-200"
                    >
                        {isMobile ? (
                            <X size={16} className="text-gray-600" />
                        ) : (
                            <div className="transition-transform duration-200">
                                {collapsed ? <ChevronRight className='text-primary hover:text-black' size={16} /> : <ChevronLeft className='text-primary hover:text-black' size={16} />}
                            </div>
                        )}
                    </button>
                </div>

                {/* Scrollable Navigation */}
                <nav className="flex-1 overflow-y-auto py-2">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => {
                            const isActive = currentPath === item.id;
                            const isHovered = hoveredItem === item.id;

                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`
                                            group relative flex items-center w-full p-2.5 text-sm 
                                            rounded-lg transition-all duration-200
                                            ${collapsed && !isMobile ? 'justify-center px-2' : ''}
                                            ${isActive
                                                ? 'bg-blue-100 text-primary border-l-4 border-primary'
                                                : 'hover:bg-gray-50 text-white hover:text-gray-900'
                                            }
                                        `}
                                        title={collapsed && !isMobile ? item.label : ''}
                                    >
                                        {/* Icon */}
                                        <span className={`
                                            flex-shrink-0 transition-colors duration-200
                                            ${collapsed && !isMobile ? 'mx-auto' : ''}
                                            ${isActive ? 'text-primary' : 'text-gray-500'}
                                            ${isHovered && !isActive ? 'text-primary' : ''}
                                        `}>
                                            {item.icon}
                                        </span>

                                        {/* Label */}
                                        <span className={`
                                            ml-3 font-medium transition-all duration-300 whitespace-nowrap
                                            ${collapsed && !isMobile
                                                ? 'opacity-0 w-0 overflow-hidden'
                                                : 'opacity-100 w-auto'
                                            }
                                        `}>
                                            {item.label}
                                        </span>

                                        {/* Active indicator */}
                                        {isActive && (
                                            <div className="absolute right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile - Fixed at bottom */}
                <div className="border-t border-gray-200 p-3 flex-shrink-0">
                    <Link
                        to="/admin-profile"
                        className="flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                            {admin?.firstName?.[0] || 'U'}{admin?.lastName?.[0] || 'S'}
                        </div>

                        <div className={`
                            ml-2 min-w-0 transition-all duration-300
                            ${collapsed && !isMobile
                                ? 'opacity-0 w-0 overflow-hidden'
                                : 'opacity-100 w-auto'
                            }
                        `}>
                            <p className="text-xs font-medium text-primary hover:text-black truncate">
                                {admin?.firstName} {admin?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">
                                {admin?.role}
                            </p>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Header Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Mobile Menu Toggle */}
                            {isMobile && (
                                <button
                                    className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu size={20} className="text-gray-600" />
                                </button>
                            )}

                            <h2 className="text-lg font-semibold text-gray-800">
                                {menuItems.find(item => item.id === currentPath)?.label || 'Dashboard'}
                            </h2>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-2">
                            {/* Notification Bell (commented out as in original) */}
                            {/* <button className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
                                <Badge badgeContent={4} color="error">
                                    <NotificationsIcon className="text-gray-600" />
                                </Badge>
                            </button> */}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Sidebar;
// Update 1 