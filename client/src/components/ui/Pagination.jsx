import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onLimitChange,
    limitOptions = [5, 10, 20, 50]
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const handleLimitChange = (e) => {
        onLimitChange(Number(e.target.value));
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });
        return rangeWithDots;
    };

    if (totalPages === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                        value={itemsPerPage}
                        onChange={handleLimitChange}
                        className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {limitOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* Pagination buttons */}
                <nav className="flex items-center gap-1">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md border ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {getPageNumbers().map((page, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof page === 'number' && goToPage(page)}
                            className={`px-3 py-1 rounded-md text-sm ${page === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : page === '...'
                                        ? 'cursor-default text-gray-500'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                            disabled={page === '...'}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-md border ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Pagination;