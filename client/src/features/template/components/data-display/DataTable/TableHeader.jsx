// client/src/features/template/components/data-display/DataTable/TableHeader.jsx
import React from 'react';

const TableHeader = ({ columns, selectable, allSelected, onSelectAll, sortKey, sortDir, onSort }) => (
    <thead>
        <tr>
            {selectable && (
                <th className="t-table__checkbox-cell">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={onSelectAll}
                        aria-label="Select all rows"
                    />
                </th>
            )}
            {columns.map((col) => (
                <th
                    key={col.key}
                    className={col.sortable ? 't-th--sortable' : ''}
                    onClick={col.sortable ? () => onSort(col.key) : undefined}
                    aria-sort={
                        sortKey === col.key
                            ? sortDir === 'asc' ? 'ascending' : 'descending'
                            : undefined
                    }
                >
                    {col.title}
                    {col.sortable && sortKey === col.key && (
                        <i
                            className={`t-table__sort-icon ${sortDir === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}`}
                            aria-hidden="true"
                        />
                    )}
                </th>
            ))}
        </tr>
    </thead>
);

export default TableHeader;
