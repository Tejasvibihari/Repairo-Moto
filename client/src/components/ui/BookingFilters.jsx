import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

export default function BookingFilters({ onFilterChange }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const statuses = ['All', 'Pending', 'In Progress', 'Completed', 'Canceled'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFilters = { ...filters, [name]: value };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            searchTerm: '',
            status: '',
            startDate: '',
            endDate: ''
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    // Calculate if any filters are active
    const hasActiveFilters = filters.searchTerm || filters.status || filters.startDate || filters.endDate;

    return (
        <div className="bg-white rounded-lg shadow-md mb-6">
            {/* Header - always visible */}
            <div
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={toggleExpanded}
            >
                <div className="flex items-center">
                    <Filter size={18} className="mr-2 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-700">
                        Filter Bookings
                        {hasActiveFilters && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Active
                            </span>
                        )}
                    </h3>
                </div>
                <div className="flex items-center">
                    {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                        <ChevronDown size={20} className="text-gray-600" />
                    )}
                </div>
            </div>

            {/* Collapsible content */}
            {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-200">
                    {/* Desktop/Tablet View - Single Row */}
                    <div className="hidden sm:flex sm:flex-wrap sm:items-end sm:gap-4">
                        {/* Search by name or order number */}
                        <div className="flex-1 min-w-0">
                            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                                Search by Name/Order #
                            </label>
                            <input
                                type="text"
                                id="searchTerm"
                                name="searchTerm"
                                value={filters.searchTerm}
                                onChange={handleChange}
                                placeholder="Name or Order #"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter by status */}
                        <div className="flex-1 min-w-0">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={filters.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status === 'All' ? '' : status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* From Date */}
                        <div className="flex-1 min-w-0">
                            <label htmlFor="startDate-desktop" className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                id="startDate-desktop"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex-1 min-w-0">
                            <label htmlFor="endDate-desktop" className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                id="endDate-desktop"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-end space-x-2 pb-0.5">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                            >
                                Reset
                            </button>
                            <button
                                onClick={toggleExpanded}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Mobile View - Stacked */}
                    <div className="grid grid-cols-1 gap-4 sm:hidden">
                        {/* Search by name or order number */}
                        <div>
                            <label htmlFor="searchTerm-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                Search by Name/Order #
                            </label>
                            <input
                                type="text"
                                id="searchTerm-mobile"
                                name="searchTerm"
                                value={filters.searchTerm}
                                onChange={handleChange}
                                placeholder="Name or Order #"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter by status */}
                        <div>
                            <label htmlFor="status-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status-mobile"
                                name="status"
                                value={filters.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status === 'All' ? '' : status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date filters */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Filter by start date */}
                            <div>
                                <label htmlFor="startDate-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate-mobile"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Filter by end date */}
                            <div>
                                <label htmlFor="endDate-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate-mobile"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                            >
                                Reset Filters
                            </button>
                            <button
                                onClick={toggleExpanded}
                                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}