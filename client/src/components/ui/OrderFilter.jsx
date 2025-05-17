import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const OrderFilter = ({ orders, setFilteredOrders }) => {
    // Filter states
    const [orderId, setOrderId] = useState('');
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // Get unique statuses for dropdown
    const uniqueStatuses = [...new Set(orders.map(order => order.status))];

    // Apply filters whenever any filter value changes
    useEffect(() => {
        applyFilters();

        // Count active filters
        let count = 0;
        if (orderId) count++;
        if (name) count++;
        if (mobileNumber) count++;
        if (status) count++;
        if (startDate || endDate) count++;

        setActiveFiltersCount(count);
    }, [orderId, name, mobileNumber, status, startDate, endDate]);

    const applyFilters = () => {
        let filteredData = [...orders];

        // Filter by orderId
        if (orderId) {
            filteredData = filteredData.filter(order =>
                order.orderId.toLowerCase().includes(orderId.toLowerCase())
            );
        }

        // Filter by name
        if (name) {
            filteredData = filteredData.filter(order =>
                order.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        // Filter by mobile number
        if (mobileNumber) {
            filteredData = filteredData.filter(order =>
                order.contactNo.includes(mobileNumber)
            );
        }

        // Filter by status
        if (status) {
            filteredData = filteredData.filter(order => order.status === status);
        }

        // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59); // Set to end of day

            filteredData = filteredData.filter(order => {
                const orderDate = new Date(order.createdAt.$date || order.createdAt);
                return orderDate >= start && orderDate <= end;
            });
        } else if (startDate) {
            const start = new Date(startDate);
            filteredData = filteredData.filter(order => {
                const orderDate = new Date(order.createdAt.$date || order.createdAt);
                return orderDate >= start;
            });
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59); // Set to end of day
            filteredData = filteredData.filter(order => {
                const orderDate = new Date(order.createdAt.$date || order.createdAt);
                return orderDate <= end;
            });
        }

        // Update filtered orders
        setFilteredOrders(filteredData);
    };

    const clearFilters = () => {
        setOrderId('');
        setName('');
        setMobileNumber('');
        setStatus('');
        setStartDate('');
        setEndDate('');
        setFilteredOrders(orders);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            {/* Header with expand/collapse toggle */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Filter className="text-blue-600 mr-2" size={20} />
                    <h2 className="text-lg font-medium">Filter Orders</h2>
                    {activeFiltersCount > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {activeFiltersCount} active
                        </span>
                    )}
                </div>
                <div className="flex items-center">
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="mr-4 flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <X size={16} className="mr-1" /> Clear all
                        </button>
                    )}
                    <button
                        onClick={toggleExpand}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={20} className="ml-1" />
                                <span className="text-sm ml-1">Collapse</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown size={20} className="ml-1" />
                                <span className="text-sm ml-1">Expand</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Compact search always visible */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="text-gray-400" size={18} />
                    </div>
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Search by Order ID..."
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {orderId && (
                        <button
                            onClick={() => setOrderId('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable filters */}
            {isExpanded && (
                <div className="flex flex-wrap -mx-2">
                    {/* Name Filter */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 lg:w-1/5 mb-3">
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Customer Name"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {name && (
                                <button
                                    onClick={() => setName('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Number Filter */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 lg:w-1/5 mb-3">
                        <div className="relative">
                            <input
                                type="text"
                                id="mobile"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="Mobile Number"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {mobileNumber && (
                                <button
                                    onClick={() => setMobileNumber('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 lg:w-1/5 mb-3">
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            {uniqueStatuses.map((statusOption, index) => (
                                <option key={index} value={statusOption}>
                                    {statusOption}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 lg:w-2/5 mb-3 flex gap-2 items-center">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Calendar className="text-gray-400" size={16} />
                            </div>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Start Date"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <span className="text-gray-500">to</span>
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Calendar className="text-gray-400" size={16} />
                            </div>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="End Date"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Filter summary and results count */}
            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                <div>
                    {activeFiltersCount > 0 ? (
                        <span>
                            Showing {setFilteredOrders.length} filtered results
                        </span>
                    ) : (
                        <span>
                            Showing all {orders.length} results
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderFilter;