import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const OrderFilter = ({ initialFilters, onApply, onClear }) => {
    const [filters, setFilters] = useState(initialFilters);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // Update local state when initialFilters change (e.g., after clear)
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    // Count active filters
    useEffect(() => {
        let count = 0;
        if (filters.q) count++;
        if (filters.status) count++;
        if (filters.serviceType) count++;
        if (filters.assignedMechanic) count++;
        if (filters.city) count++;
        if (filters.fromDate) count++;
        if (filters.toDate) count++;
        if (filters.sort !== 'createdAt:desc') count++;
        setActiveFiltersCount(count);
    }, [filters]);

    const handleInputChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onApply(filters);
    };

    const handleClear = () => {
        onClear();
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            {/* Header */}
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
                <div className="flex items-center gap-3">
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={handleClear}
                            className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center"
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
                                <ChevronUp size={20} />
                                <span className="text-sm ml-1">Collapse</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown size={20} />
                                <span className="text-sm ml-1">Expand</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick search (always visible) */}
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="text-gray-400" size={18} />
                    </div>
                    <input
                        type="text"
                        value={filters.q}
                        onChange={(e) => handleInputChange('q', e.target.value)}
                        placeholder="Search by Order ID, Name, Email, or Mobile..."
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {filters.q && (
                        <button
                            onClick={() => handleInputChange('q', '')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable advanced filters */}
            {isExpanded && (
                <div className="flex flex-wrap -mx-2 mb-4">
                    {/* Status */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 mb-3">
                        <input
                            type="text"
                            value={filters.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            placeholder="Status (Pending, Completed, etc.)"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            list="statusOptions"
                        />
                        <datalist id="statusOptions">
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Mechanic Assigned</option>
                            <option>Completed</option>
                            <option>Invoice Generated</option>
                            <option>Cancelled</option>
                        </datalist>
                    </div>

                    {/* Service Type */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 mb-3">
                        <select
                            value={filters.serviceType}
                            onChange={(e) => handleInputChange('serviceType', e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                        >
                            <option value="">All Service Types</option>
                            <option value="Schedule Repair">Schedule Repair</option>
                            <option value="Emergency Repair">Emergency Repair</option>
                        </select>
                    </div>

                    {/* Assigned Mechanic (name) */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 mb-3">
                        <input
                            type="text"
                            value={filters.assignedMechanic}
                            onChange={(e) => handleInputChange('assignedMechanic', e.target.value)}
                            placeholder="Assigned Mechanic Name"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                        />
                    </div>

                    {/* City */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 mb-3">
                        <input
                            type="text"
                            value={filters.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="City (e.g., DELHI)"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 uppercase"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/2 mb-3 flex gap-2 items-center">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Calendar className="text-gray-400" size={16} />
                            </div>
                            <input
                                type="date"
                                value={filters.fromDate}
                                onChange={(e) => handleInputChange('fromDate', e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                            />
                        </div>
                        <span className="text-gray-500">to</span>
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Calendar className="text-gray-400" size={16} />
                            </div>
                            <input
                                type="date"
                                value={filters.toDate}
                                onChange={(e) => handleInputChange('toDate', e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                            />
                        </div>
                    </div>

                    {/* Sorting */}
                    <div className="px-2 w-full sm:w-1/2 md:w-1/4 mb-3">
                        <select
                            value={filters.sort}
                            onChange={(e) => handleInputChange('sort', e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                        >
                            <option value="createdAt:desc">Newest First</option>
                            <option value="createdAt:asc">Oldest First</option>
                            <option value="preferredDate:asc">Preferred Date (Earliest)</option>
                            <option value="preferredDate:desc">Preferred Date (Latest)</option>
                            <option value="total.total:desc">Highest Total</option>
                            <option value="total.total:asc">Lowest Total</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-2">
                <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Search size={16} />
                    Apply Filters
                </button>
            </div>

            {/* Results count hint (optional) - actual count is shown in parent */}
            <div className="text-sm text-gray-500 mt-3">
                {activeFiltersCount > 0 ? (
                    <span>{activeFiltersCount} filter(s) active – click Apply to refresh results</span>
                ) : (
                    <span>No active filters</span>
                )}
            </div>
        </div>
    );
};

export default OrderFilter;