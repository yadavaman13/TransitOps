// client/src/features/template/components/data-display/DataTable/TableBody.jsx
import React from 'react';

const TableBody = ({
    columns, rows, loading, emptyMessage,
    selectable, selected, onToggleRow, onRowClick,
}) => {
    const colSpan = columns.length + (selectable ? 1 : 0);

    if (loading) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan}>
                        <div className="t-table-loading">
                            <i className="ri-loader-4-line" aria-hidden="true" />
                            Loading...
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (!rows.length) {
        return (
            <tbody>
                <tr>
                    <td colSpan={colSpan}>
                        <div className="t-table-empty">
                            <i className="ri-inbox-line" aria-hidden="true" />
                            {emptyMessage}
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {rows.map((row, idx) => {
                const key = row.id ?? idx;
                const isSelected = selected.has(key);
                return (
                    <tr
                        key={key}
                        className={[
                            onRowClick  ? 't-tr--clickable' : '',
                            isSelected  ? 't-tr--selected'  : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => onRowClick?.(row)}
                    >
                        {selectable && (
                            <td
                                className="t-table__checkbox-cell"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleRow(row, idx)}
                                    aria-label={`Select row ${idx + 1}`}
                                />
                            </td>
                        )}
                        {columns.map((col) => (
                            <td key={col.key}>
                                {col.render ? col.render(row) : (row[col.key] ?? '—')}
                            </td>
                        ))}
                    </tr>
                );
            })}
        </tbody>
    );
};

export default TableBody;
