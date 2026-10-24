import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Home, ShoppingCart, Bike, Briefcase, QrCode, FileText, NotebookPen,
    Menu, X, ChevronLeft, ChevronRight, ChevronDown,
    HandCoins, User, MapPin, PhoneCall, Users, Store, CalendarDays,
    Receipt, FilePlus, MessageCircle, Ticket, Image, Megaphone, Settings,
    Truck, Share2, UserCog, Clock3,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useChatUnreadTotal } from '../../utils/chatAlerts';

const S = 18;
const CHAT_ITEM_IDS = ['chat-support', 'manager-chat'];

// Soft pulsing green glow AROUND the Chat Support menu entry while customer messages are unread
const CHAT_GLOW_CSS = `
@keyframes chat-menu-glow {
  0%, 100% { box-shadow: 0 0 0 1px rgba(34,197,94,.85), 0 0 6px 1px rgba(34,197,94,.45); }
  50%      { box-shadow: 0 0 0 1px rgba(74,222,128,1), 0 0 13px 4px rgba(34,197,94,.75); }
}
.chat-glow { position: relative; z-index: 1; animation: chat-menu-glow 1.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .chat-glow { animation: none; box-shadow: 0 0 0 1px rgba(34,197,94,.9), 0 0 10px 3px rgba(34,197,94,.6); } }
`;

/* ------------------------------------------------------------------
   Menus. An entry is either a plain item { id, path, label, icon }
   or a group { group, label, icon, items: [...] }.
   Role restrictions are unchanged: position decides which menu loads.
------------------------------------------------------------------ */
const TELECALLER_MENU = [
    { id: 'dashboard', path: '/employee/dashboard', label: 'Dashboard', icon: <Home size={S} /> },
    { id: 'leads', path: '/employee/leads', label: 'Leads', icon: <PhoneCall size={S} /> },
    { id: 'attendance', path: '/employee/attendance', label: 'Attendance', icon: <CalendarDays size={S} /> },
    { id: 'invoices-create', path: '/employee/invoices/create', label: 'Create Invoice', icon: <FilePlus size={S} /> },
    { id: 'invoices', path: '/employee/invoices', label: 'Invoices', icon: <FileText size={S} /> },
    { id: 'chat-support', path: '/employee/chat-support', label: 'Chat Support', icon: <MessageCircle size={S} /> },
];

const MANAGER_MENU = [
    { id: 'dashboard', path: '/employee/dashboard', label: 'Dashboard', icon: <Home size={S} /> },
    {
        group: 'orders', label: 'Orders & Billing', icon: <Truck size={S} />,
        items: [
            { id: 'manager-orders', path: '/employee/manager-orders', label: 'Orders', icon: <ShoppingCart size={S} /> },
            { id: 'manager-create-invoice', path: '/employee/manager-invoices/create', label: 'Create Invoice', icon: <FilePlus size={S} /> },
            { id: 'manager-invoices', path: '/employee/manager-invoices', label: 'Invoice', icon: <Receipt size={S} /> },
            { id: 'live-tracking', path: '/employee/live-tracking', label: 'Live Tracking', icon: <MapPin size={S} /> },
        ],
    },
    {
        group: 'growth', label: 'Customers & Growth', icon: <Share2 size={S} />,
        items: [
            { id: 'manager-leads', path: '/employee/manager-leads', label: 'Leads', icon: <PhoneCall size={S} /> },
            { id: 'manager-chat', path: '/employee/manager-chat', label: 'Chat Support', icon: <MessageCircle size={S} /> },
            { id: 'manager-coupons', path: '/employee/manager-coupons', label: 'Coupons', icon: <Ticket size={S} /> },
            { id: 'manager-banners', path: '/employee/manager-banners', label: 'Banners', icon: <Image size={S} /> },
            { id: 'manager-notifications', path: '/employee/manager-notifications', label: 'Send Notification', icon: <Megaphone size={S} /> },
            { id: 'manager-whatsapp', path: '/employee/manager-whatsapp', label: 'WhatsApp Alerts', icon: <MessageCircle size={S} /> },
            { id: 'manager-referrals', path: '/employee/manager-referrals', label: 'Referral Wallets', icon: <HandCoins size={S} /> },
        ],
    },
    {
        group: 'team', label: 'Team & Shop', icon: <UserCog size={S} />,
        items: [
            { id: 'manager-attendance', path: '/employee/manager-attendance', label: 'My Attendance', icon: <CalendarDays size={S} /> },
            { id: 'manager-staff', path: '/employee/manager-staff', label: 'Staff Overview', icon: <Users size={S} /> },
            { id: 'manager-shop', path: '/employee/manager-shop', label: 'Shop Status', icon: <Store size={S} /> },
            { id: 'manager-slots', path: '/employee/manager-slots', label: 'Booking Slots', icon: <Clock3 size={S} /> },
        ],
    },
    { id: 'manager-settings', path: '/employee/manager-settings', label: 'Settings', icon: <Settings size={S} /> },
];

const DEFAULT_MENU = [
    { id: 'dashboard', path: '/employee/dashboard', label: 'Dashboard', icon: <Home size={S} /> },
    { id: 'all-booking', path: '/employee/all-booking', label: 'All Booking', icon: <ShoppingCart size={S} /> },
    { id: 'referral', path: '/employee/referral', label: 'Referral & Earnings', icon: <HandCoins size={S} /> },
];

const STORAGE_KEY = 'employee-sidebar-open-groups';

const readOpenGroups = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && typeof saved === 'object') return saved;
    } catch (e) { /* ignore */ }
    return null;
};

const EmployeeSidebar = ({ children }) => {
    const employee = useSelector((state) => state.employeeAuth.employee);
    const position = employee?.position;

    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState(() => readOpenGroups() || { orders: true });
    const navigate = useNavigate();
    const location = useLocation();
    const chatUnread = useChatUnreadTotal(); // unread customer messages -> menu glows

    /* ---------- pick menu by role (restriction preserved) ---------- */
    const menu =
        position === 'telecaller' ? TELECALLER_MENU
            : position === 'operational manager' ? MANAGER_MENU
                : DEFAULT_MENU;

    const flatItems = useMemo(
        () => menu.flatMap((e) => (e.group ? e.items : [e])),
        [menu]
    );

    /* ---------- active item: longest matching path wins ----------
       Fixes "Invoice" and "Create Invoice" both lighting up on
       /manager-invoices/create. */
    const activeItem = useMemo(() => {
        const path = location.pathname;
        return flatItems
            .filter((i) => path === i.path || path.startsWith(`${i.path}/`))
            .sort((a, b) => b.path.length - a.path.length)[0];
    }, [flatItems, location.pathname]);

    const activeGroup = menu.find((e) => e.group && e.items.some((i) => i.id === activeItem?.id))?.group;
    const isProfile = location.pathname.startsWith('/employee/profile');
    const pageTitle = isProfile ? 'Profile' : activeItem?.label || 'Dashboard';

    useEffect(() => {
        if (activeGroup) {
            setOpenGroups((prev) => (prev[activeGroup] ? prev : { ...prev, [activeGroup]: true }));
        }
    }, [activeGroup]);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups)); } catch (e) { /* ignore */ }
    }, [openGroups]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setIsMobileMenuOpen(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) setIsMobileMenuOpen(false);
    }, [location.pathname, isMobile]);

    const isCollapsed = collapsed && !isMobile;
    const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
    const initials = `${employee?.firstName?.[0] || ''}${employee?.lastName?.[0] || ''}`.toUpperCase() || 'U';

    /* ---------- item ---------- */
    const renderItem = (item, nested = false) => {
        const isActive = activeItem?.id === item.id;
        const glow = CHAT_ITEM_IDS.includes(item.id) && chatUnread > 0;
        return (
            <li key={item.id}>
                <button
                    type="button"
                    onClick={() => navigate(item.path)}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                        group relative flex items-center w-full py-2.5 text-sm rounded-lg transition-colors duration-200
                        ${glow ? 'chat-glow' : ''}
                        ${isCollapsed ? 'justify-center px-2' : nested ? 'px-3' : 'px-3'}
                        ${isActive ? 'bg-primary text-secondary' : 'text-white hover:bg-white/10'}
                    `}
                >
                    <span className={`flex-shrink-0 ${isActive ? 'text-secondary' : 'text-gray-300 group-hover:text-primary'}`}>
                        {item.icon}
                    </span>
                    {!isCollapsed && (
                        <span className={`ml-3 font-nunito whitespace-nowrap truncate ${glow ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    )}
                </button>
            </li>
        );
    };

    /* ---------- group ---------- */
    const renderGroup = (g) => {
        const hasActive = g.group === activeGroup;
        const groupGlow = chatUnread > 0 && g.items.some((i) => CHAT_ITEM_IDS.includes(i.id));

        if (isCollapsed) {
            return (
                <li key={g.group}>
                    <div className="mx-3 my-2 border-t border-white/10" />
                    <ul className="space-y-1">{g.items.map((i) => renderItem(i))}</ul>
                </li>
            );
        }

        const isOpen = !!openGroups[g.group];
        const panelId = `emp-group-${g.group}`;

        return (
            <li key={g.group}>
                <button
                    type="button"
                    onClick={() => toggleGroup(g.group)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-semibold font-nunito transition-colors duration-200 hover:bg-white/10 ${hasActive ? 'text-white' : 'text-gray-300'} ${!isOpen && groupGlow ? 'chat-glow' : ''}`}
                >
                    <span className="flex-shrink-0">{g.icon}</span>
                    <span className="ml-3 flex-1 text-left truncate">{g.label}</span>
                    {hasActive && !isOpen && (
                        <span className="mr-2 w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                    <ChevronDown
                        size={16}
                        className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                <div
                    id={panelId}
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                    <div className="overflow-hidden">
                        <ul className="my-1 ml-4 py-1 pl-2 pr-2 space-y-1 border-l border-white/10">
                            {g.items.map((i) => renderItem(i, true))}
                        </ul>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <div className="flex h-screen relative bg-gray-100">
            <style>{CHAT_GLOW_CSS}</style>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ${isMobile && isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar: flex column so a long menu scrolls and never runs under the profile block */}
            <aside
                className={`
                    bg-secondary text-white h-screen flex flex-col flex-shrink-0
                    transition-all duration-300 ease-in-out
                    ${isMobile
                        ? `fixed top-0 left-0 z-40 w-72 max-w-[85%] transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0 min-h-[65px]">
                    {!isCollapsed && <img src="/logo/textlogo72.png" className="w-28" alt="Logo" />}
                    <button
                        type="button"
                        onClick={() => (isMobile ? setIsMobileMenuOpen(false) : setCollapsed((v) => !v))}
                        aria-label={isMobile ? 'Close menu' : isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className={`p-2 rounded-md hover:bg-white/10 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
                    >
                        {isMobile ? <X size={18} /> : isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
                    <ul className="space-y-1">
                        {menu.map((entry) => (entry.group ? renderGroup(entry) : renderItem(entry)))}
                    </ul>
                </nav>

                {/* Profile (whole row is the link now) */}
                <div className="border-t border-gray-700 flex-shrink-0">
                    <Link
                        to="/employee/profile"
                        title={isCollapsed ? 'Profile' : undefined}
                        className={`flex items-center p-4 hover:bg-white/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {initials}
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium font-nunito truncate">
                                    {employee?.firstName} {employee?.lastName}
                                </p>
                                <p className="text-xs text-gray-400 uppercase truncate">{position}</p>
                            </div>
                        )}
                    </Link>
                </div>
            </aside>

            {/* Content area */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm flex-shrink-0">
                    <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
                        {isMobile && (
                            <button
                                type="button"
                                aria-label="Open menu"
                                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu size={20} className="text-gray-600" />
                            </button>
                        )}
                        <h2 className="text-xl font-semibold text-gray-800 truncate">{pageTitle}</h2>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
};

export default EmployeeSidebar;