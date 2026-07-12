// client/src/features/template/components/data-display/DataTable/TablePagination.jsx
import React from 'react';

const TablePagination = ({ page, totalPages, onPage }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => Math.abs(p - page) <= 2);

    return (
        <div className="t-table-pagination">
            <span className="t-table-pagination__info">
                Page {page} of {totalPages}
            </span>
            <div className="t-table-pagination__pages">
                <button
                    className="t-table-pagination__btn"
                    onClick={() => onPage(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                >
                    <i className="ri-arrow-left-s-line" />
                </button>
                {pages.map((p) => (
                    <button
                        key={p}
                        className={`t-table-pagination__btn ${p === page ? 't-table-pagination__btn--active' : ''}`}
                        onClick={() => onPage(p)}
                        aria-current={p === page ? 'page' : undefined}
                        aria-label={`Go to page ${p}`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    className="t-table-pagination__btn"
                    onClick={() => onPage(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                >
                    <i className="ri-arrow-right-s-line" />
                </button>
            </div>
        </div>
    );
};

export default TablePagination;
