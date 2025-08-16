import { User, Menu, X, ChevronDown, MessageSquareMore, MessageCircle, Instagram, Twitter, Facebook } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setLogOut } from '../../app/slice/authSlice';
import { setUserLogout } from '../../app/slice/userSlice';

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const user = useSelector((state) => state.user.isAuthenticated);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const userDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const [isSocialOpen, setIsSocialOpen] = useState(false);

    const toggleSocialMenu = () => {
        setIsSocialOpen(!isSocialOpen);
    };

    // Array of navigation links
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Contact', path: '/contact' },
        { name: 'Blog', path: '/blog' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Referral & Earning', path: '/referral' },
    ];

    useEffect(() => {


        // function handleClickOutside(event) {
        //     if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        //         setUserDropdownOpen(false);
        //     }

        //     if (window.innerWidth < 768 && mobileMenuRef.current &&
        //         !mobileMenuRef.current.contains(event.target) &&
        //         !event.target.closest('button[aria-label="Toggle menu"]')) {
        //         setIsMenuOpen(false);
        //     }
        // }

        // document.addEventListener('mousedown', handleClickOutside);
        // return () => {
        //     document.removeEventListener('mousedown', handleClickOutside);
        // };
    }, [user, location.pathname]);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
        setUserDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(setLogOut())
        dispatch(setUserLogout())
        setUserDropdownOpen(false);
        navigate('/user-signin');
    };

    // Direct navigation handlers
    const navigateTo = (path) => {
        setIsMenuOpen(false);
        setUserDropdownOpen(false);
        navigate(path);
    };

    const navigateToProfile = () => {
        setUserDropdownOpen(false);
        setIsMenuOpen(false);
        setTimeout(() => {
            navigate('/user/dashboard');
        }, 10);
    };

    return (
        <nav className="bg-white shadow-md w-full sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center text-xl font-bold text-primary cursor-pointer"
                    onClick={() => navigateTo('/')}
                >
                    <img src="/logo/textlogo150.png" alt="Logo" className="h-10 md:h-12" />
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-3 lg:space-x-6 mx-auto">
                    {navLinks.map((link, index) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <div
                                key={index}
                                className={`text-gray-700 hover:text-primary font-semibold font-nunito py-2 px-1 transition-all duration-200 cursor-pointer ${isActive
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'hover:border-b-2 border-primary'
                                    }`}
                                onClick={() => navigateTo(link.path)}
                            >
                                {link.name}
                            </div>
                        );
                    })}
                </div>

                {/* Desktop User Controls */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full text-gray-700 transition-colors duration-200"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setUserDropdownOpen((prev) => !prev);
                                }}
                                aria-label="User menu"
                                aria-expanded={userDropdownOpen}
                            >
                                <User size={20} />
                                <ChevronDown size={16} className={`transform transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100">
                                    <div
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-200 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            navigateToProfile();
                                        }}
                                    >
                                        Profile
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-200 border-t border-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            className="bg-primary hover:bg-secondary text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105"
                            onClick={() => navigateTo('/user-order-booking')}
                        >
                            Book Appointment
                        </button>
                    )}
                </div>

                {/* Mobile Controls */}
                <div className="flex items-center space-x-3 md:hidden">
                    {user && (
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                className="p-2 text-gray-700 hover:text-primary focus:outline-none"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setUserDropdownOpen((prev) => !prev);
                                }}
                                aria-label="User menu"
                            >
                                <User size={24} />
                            </button>

                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100">
                                    <div
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            navigateToProfile();
                                        }}
                                    >
                                        Profile
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-700 hover:text-primary focus:outline-none"
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu - Slide-in from right */}
            <div
                ref={mobileMenuRef}
                className={`fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-lg transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    } transition-transform duration-300 ease-in-out md:hidden`}
            >
                <div className="flex items-center justify-between px-4 py-5 border-b">
                    <div
                        className="text-xl font-bold text-primary cursor-pointer"
                        onClick={() => navigateTo('/')}
                    >
                        <img src="/logo/textlogo150.png" alt="Logo" className="h-8" />
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-gray-500 hover:text-primary focus:outline-none"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col py-4">
                    {navLinks.map((link, index) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <div
                                key={index}
                                className={`px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors cursor-pointer ${isActive ? 'text-primary font-semibold bg-gray-50' : ''
                                    }`}
                                onClick={() => navigateTo(link.path)}
                            >
                                {link.name}
                            </div>
                        );
                    })}

                    {user ? (
                        <div className="px-6 pt-4 mt-2 border-t">
                            <div
                                className="block w-full bg-primary hover:bg-secondary text-white text-center py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                                onClick={navigateToProfile}
                            >
                                Profile
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 pt-4 mt-2 border-t">
                            <div
                                className="block w-full bg-primary hover:bg-secondary text-white text-center py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
                                onClick={() => navigateTo('/user-order-booking')}
                            >
                                Book Appointment
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            {/* Social Media Icon  */}
            {/* <div className="fixed right-4 bottom-6 z-50"> */}
            {/* Main contact button */}
            {/* <button
                    onClick={toggleSocialMenu}
                    className="bg-primary cursor-pointer hover:bg-secondary group text-white rounded-full p-3 shadow-lg transition-all duration-300"
                >
                    <MessageSquareMore size={24} className='group-hover:text-primary' />
                </button> */}

            {/* Social media icons that appear when clicked */}
            {/* {isSocialOpen && (
                    <div className="absolute right-0 bottom-16 flex flex-col space-y-2 items-end animate-fadeIn">
                        <a
                            href="https://wa.me/919229207021"
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-md transition-all duration-200 flex items-center"
                        >
                            <MessageCircle size={24} />
                            <span className="ml-2 mr-1">WhatsApp</span>
                        </a>

                        <a
                            href="https://www.instagram.com/repairomoto"
                            className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-3 shadow-md transition-all duration-200 flex items-center"
                        >
                            <Instagram size={24} />
                            <span className="ml-2 mr-1">Instagram</span>
                        </a>

                        <a
                            href="https://x.com/Repairomoto"
                            className="bg-black hover:bg-gray-800 text-white rounded-full p-3 shadow-md transition-all duration-200 flex items-center"
                        >
                            <Twitter size={24} />
                            <span className="ml-2 mr-1">Twitter (X)</span>
                        </a>

                        <a
                            href="https://www.facebook.com/share/1D4UWBzREr/"
                            className="bg-blue-800 hover:bg-blue-900 text-white rounded-full p-3 shadow-md transition-all duration-200 flex items-center"
                        >
                            <Facebook size={24} />
                            <span className="ml-2 mr-1">Facebook</span>
                        </a>
                    </div>
                )} */}
            {/* </div> */}
        </nav>
    );
}