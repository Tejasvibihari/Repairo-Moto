import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard, IndianRupee } from 'lucide-react';

export default function VendorRevenueCard({ orders = [] }) {
    const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [percentChange, setPercentChange] = useState(0);
    console.log(orders.length)
    useEffect(() => {
        if (!orders || orders.length === 0) return;

        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter orders for current month
        const currentMonthOrders = orders.filter(order => {
            // Support both { $date: ... } and plain string
            let orderDateStr = order.orderDate?.$date || order.orderDate;
            if (!orderDateStr) return false;
            const orderDate = new Date(orderDateStr);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });

        // Calculate revenue from current month orders
        let totalRevenue = 0;
        currentMonthOrders.forEach(order => {
            if (order.partsUsed && Array.isArray(order.partsUsed)) {
                order.partsUsed.forEach(part => {
                    // Calculate revenue (price - discount) * quantity
                    const partRevenue = (part.price - (part.discountPrice || 0)) * part.quantity;
                    totalRevenue += partRevenue;
                });
            }
        });
        // ...existing code...


        // Set the current month revenue
        setCurrentMonthRevenue(totalRevenue);

        // Set order count
        setOrderCount(currentMonthOrders.length);

        // Calculate percent change from previous month (mock data for now)
        // In a real app, you would calculate this based on previous month's data
        // setPercentChange(12.5);
    }, [orders]);

    // Format number as currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Define color scheme for revenue card
    const scheme = {
        bgGradient: "from-emerald-600 to-teal-500",
        iconBg: "bg-emerald-700",
        accentColor: "rgba(20, 184, 166, 0.4)",
        secondaryColor: "rgba(255, 255, 255, 0.15)"
    };

    return (
        <div className="w-full rounded-xl overflow-hidden shadow-lg">
            {/* Main card with gradient background */}
            <div className={`h-full bg-gradient-to-br ${scheme.bgGradient} relative`}>
                {/* Complex abstract pattern background */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Abstract SVG pattern overlay */}
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        {/* Abstract geometric shapes */}
                        <defs>
                            <pattern id="revenuePattern" width="100" height="100" patternUnits="userSpaceOnUse">
                                {/* Circle elements */}
                                <circle cx="10" cy="10" r="8" fill="transparent" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <circle cx="90" cy="90" r="15" fill="transparent" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <circle cx="50" cy="30" r="20" fill={scheme.accentColor} opacity="0.2" />

                                {/* Line elements */}
                                <line x1="0" y1="30" x2="40" y2="0" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <line x1="60" y1="0" x2="100" y2="40" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <line x1="0" y1="70" x2="30" y2="100" stroke={scheme.secondaryColor} strokeWidth="1" />
                                <line x1="70" y1="100" x2="100" y2="70" stroke={scheme.secondaryColor} strokeWidth="1" />

                                {/* Currency symbols */}
                                <text x="20" y="50" fontSize="12" fill={scheme.secondaryColor} opacity="0.5">₹</text>
                                <text x="70" y="30" fontSize="14" fill={scheme.secondaryColor} opacity="0.5">₹</text>
                                <text x="40" y="80" fontSize="16" fill={scheme.secondaryColor} opacity="0.5">₹</text>
                                <text x="85" y="65" fontSize="10" fill={scheme.secondaryColor} opacity="0.5">₹</text>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#revenuePattern)" />

                        {/* Large accent elements */}
                        <circle cx="0" cy="0" r="80" fill={scheme.accentColor} opacity="0.2" />
                        <circle cx="100%" cy="100%" r="120" fill={scheme.accentColor} opacity="0.15" />

                        {/* Revenue chart line representation */}
                        <path d="M0,80 C30,70 60,90 100,60 S150,40 200,30" stroke={scheme.secondaryColor} strokeWidth="2" fill="none" />
                    </svg>
                </div>

                {/* Floating geometric elements with blur for depth */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 blur-xl translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white opacity-10 blur-xl -translate-x-10 translate-y-10"></div>

                {/* Card content */}
                <div className="relative px-6 py-5 h-48">
                    <div className="relative flex flex-col h-full text-white">
                        <div className="flex justify-between items-center mb-4">
                            <div className={`p-3 rounded-lg ${scheme.iconBg} shadow-lg relative z-10`}>
                                <IndianRupee size={24} className="text-white" />
                            </div>

                            <div className="flex items-center bg-white/20 px-3 py-1 rounded-lg">
                                <Calendar size={14} className="mr-1" />
                                <span className="text-xs font-medium">
                                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto relative z-10">
                            <h3 className="text-lg font-medium">Monthly Revenue</h3>
                            <div className="mt-2 flex items-baseline">
                                <p className="text-3xl font-bold">{formatCurrency(currentMonthRevenue)}</p>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center">
                                    <CreditCard size={14} className="mr-1" />
                                    <span className="text-sm">{orderCount} Orders</span>
                                </div>

                                {/* <div className="flex items-center bg-white/20 px-2 py-0.5 rounded-md">
                                    <TrendingUp size={14} className="mr-1" />
                                    <span className="text-xs font-medium">+{percentChange}%</span>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}