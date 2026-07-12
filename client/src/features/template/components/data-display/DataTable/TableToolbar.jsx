// client/src/features/template/components/data-display/DataTable/TableToolbar.jsx
import React from 'react';
import SearchBar from '../../navigation/SearchBar/index.js';

const TableToolbar = ({ searchable, search, onSearch, totalCount, toolbarActions }) => {
    if (!searchable && !toolbarActions) return null;
    return (
        <div className="t-table-toolbar">
            {searchable && (
                <SearchBar
                    value={search}
                    onChange={(v) => onSearch(v)}
                    placeholder="Search..."
                />
            )}
            {toolbarActions && <div>{toolbarActions}</div>}
            <span className="t-table-count">
                {totalCount} record{totalCount !== 1 ? 's' : ''}
            </span>
        </div>
    );
};

export default TableToolbar;
