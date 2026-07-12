// client/src/features/template/components/data-display/DataTable/DataTable.jsx
import React, { useState, useMemo } from 'react';
import TableToolbar   from './TableToolbar.jsx';
import TableHeader    from './TableHeader.jsx';
import TableBody      from './TableBody.jsx';
import TablePagination from './TablePagination.jsx';
import './DataTable.scss';

/**
 * DataTable — universal ERP data grid.
 * Composed of TableToolbar, TableHeader, TableBody, TablePagination.
 */
const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    searchable = false,
    selectable = false,
    paginated = false,
    pageSize = 10,
    emptyMessage = 'No records found.',
    onRowClick,
    toolbarActions,
}) => {
    const [search,   setSearch]   = useState('');
    const [sortKey,  setSortKey]  = useState(null);
    const [sortDir,  setSortDir]  = useState('asc');
    const [selected, setSelected] = useState(new Set());
    const [page,     setPage]     = useState(1);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter((row) =>
            columns.some(({ key }) => String(row[key] ?? '').toLowerCase().includes(q))
        );
    }, [data, search, columns]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const va = a[sortKey], vb = b[sortKey];
            if (va == null) return 1;
            if (vb == null) return -1;
            return sortDir === 'asc'
                ? String(va).localeCompare(String(vb), undefined, { numeric: true })
                : String(vb).localeCompare(String(va), undefined, { numeric: true });
        });
    }, [filtered, sortKey, sortDir]);

    const totalPages = paginated ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
    const pageData   = paginated ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

    const handleSelectAll = () => {
        if (selected.size === pageData.length)
            setSelected(new Set());
        else
            setSelected(new Set(pageData.map((r, i) => r.id ?? i)));
    };

    const handleToggleRow = (row, idx) => {
        const k = row.id ?? idx;
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(k) ? next.delete(k) : next.add(k);
            return next;
        });
    };

    return (
        <div className="t-table-wrapper">
            <TableToolbar
                searchable={searchable}
                search={search}
                onSearch={(v) => { setSearch(v); setPage(1); }}
                totalCount={sorted.length}
                toolbarActions={toolbarActions}
            />
            <div className="t-table-scroll">
                <table className="t-table" role="grid">
                    <TableHeader
                        columns={columns}
                        selectable={selectable}
                        allSelected={selected.size === pageData.length && pageData.length > 0}
                        onSelectAll={handleSelectAll}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                    />
                    <TableBody
                        columns={columns}
                        rows={pageData}
                        loading={loading}
                        emptyMessage={emptyMessage}
                        selectable={selectable}
                        selected={selected}
                        onToggleRow={handleToggleRow}
                        onRowClick={onRowClick}
                    />
                </table>
            </div>
            {paginated && totalPages > 1 && (
                <TablePagination
                    page={page}
                    totalPages={totalPages}
                    onPage={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
                />
            )}
        </div>
    );
};

export default DataTable;
