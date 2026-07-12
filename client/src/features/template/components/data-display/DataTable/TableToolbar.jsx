// client/src/features/template/components/data-display/DataTable/TableToolbar.jsx
import React from 'react';

const TableToolbar = ({ searchable, search, onSearch, totalCount, toolbarActions }) => {
    if (!searchable && !toolbarActions) return null;
    return (
        <div className="t-table-toolbar">
            {searchable && (
                <div className="t-table-search">
                    <i className="ri-search-line" aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        aria-label="Search table"
                    />
                </div>
            )}
            {toolbarActions && <div>{toolbarActions}</div>}
            <span className="t-table-count">
                {totalCount} record{totalCount !== 1 ? 's' : ''}
            </span>
        </div>
    );
};

export default TableToolbar;
