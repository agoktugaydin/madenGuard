import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div className="pagination">
            {pageNumbers.map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={pageNumber === currentPage ? 'active' : ''}
                    disabled={pageNumber === currentPage}
                >
                    {pageNumber}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
