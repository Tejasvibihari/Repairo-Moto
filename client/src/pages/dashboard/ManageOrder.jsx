import React, { useEffect, useState, useCallback } from 'react';
import OrderTable from '../../components/OrderTable';
import OrderFilter from '../../components/ui/OrderFilter';
import Pagination from '../../components/ui/Pagination';
import axiosClient from '../../service/axiosClient';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';

export default function ManageOrder() {
    // Snackbar state
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    // Data state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    // Filter state (matches API query params)
    const [filters, setFilters] = useState({
        status: '',
        serviceType: '',
        assignedMechanic: '',
        city: '',
        q: '',          // search term
        fromDate: '',
        toDate: '',
        sort: 'createdAt:desc',
    });

    // Pagination controls
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Fetch orders with current filters, pagination, sorting
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);

            // Add filters if they have value
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    params.append(key, value);
                }
            });

            const response = await axiosClient.get(`/api/admin/order/getallorder?${params.toString()}`);
            // Expected response: { success: true, data: orders, pagination: {...} }
            if (response.data.success) {
                setOrders(response.data.data);
                setPagination(response.data.pagination);
            } else {
                // Fallback if structure differs
                setOrders(response.data);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: response.data.length,
                    itemsPerPage: limit,
                });
            }
        } catch (error) {
            let errorMsg = 'An unexpected error occurred.';
            if (error.response) {
                errorMsg = error.response.data.message || `Error: ${error.response.status}`;
            } else if (error.request) {
                errorMsg = 'No response from the server. Please try again later.';
            } else {
                errorMsg = error.message || errorMsg;
            }
            setSnackBarMessage(errorMsg);
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    // Refetch when page, limit, or filters change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handler for filter submission (from OrderFilter)
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setPage(1); // reset to first page when filters change
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            serviceType: '',
            assignedMechanic: '',
            city: '',
            q: '',
            fromDate: '',
            toDate: '',
            sort: 'createdAt:desc',
        });
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />

            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

                {/* Filter Component */}
                <OrderFilter
                    initialFilters={filters}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                />

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <CircularLoading />
                        <span className="mt-3 text-gray-600">Loading orders...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No orders found</p>
                        <button
                            onClick={handleClearFilters}
                            className="mt-3 text-blue-600 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Orders Table */}
                        <OrderTable orders={orders} />

                        {/* Pagination */}
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.totalItems}
                                itemsPerPage={limit}
                                onPageChange={handlePageChange}
                                onLimitChange={handleLimitChange}
                                limitOptions={[5, 10, 20, 50]}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}