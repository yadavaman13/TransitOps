import React from 'react';
import {
    Card,
    Badge,
    DataTable,
    Breadcrumb
} from '../../template';
import '../../template/styles/index.scss';
import '../../template/pages/DashboardTemplatePage/DashboardTemplatePage.scss';

const BREADCRUMBS = [
    { label: 'Home', link: '/driver' },
    { label: 'My Trips' }
];

const COLUMNS = [
    { key: 'tripId', title: 'Trip ID', sortable: true },
    { key: 'date', title: 'Date', sortable: true },
    { key: 'route', title: 'Route' },
    { key: 'vehicle', title: 'Vehicle' },
    { key: 'status', title: 'Status', render: (row) => (
        <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'In Progress' ? 'primary' : 'warning'}>
            {row.status}
        </Badge>
    )},
];

const SAMPLE_TRIPS = [
    { id: 1, tripId: 'TRP-5021', date: '2026-07-12', route: 'Main Depot ➜ North Station', vehicle: 'Eicher Pro (MH-12-XY-9876)', status: 'In Progress' },
    { id: 2, tripId: 'TRP-5012', date: '2026-07-11', route: 'North Station ➜ Main Depot', vehicle: 'Tata Starbus (MH-12-AB-1234)', status: 'Completed' },
    { id: 3, tripId: 'TRP-4998', date: '2026-07-10', route: 'Express Depot ➜ Airport T2', vehicle: 'Eicher Pro (MH-12-XY-9876)', status: 'Completed' },
];

const DriverTripsPage = () => {
    return (
        <div className="t-dash-page">
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                </div>
            </div>
            
            <Card padding="none">
                <div style={{ padding: 'var(--t-space-6) var(--t-space-6) 0 var(--t-space-6)' }}>
                    <h2 style={{ fontSize: 'var(--t-font-size-lg)', fontWeight: 600, color: 'var(--t-text-title)' }}>My Assigned Trips</h2>
                    <p style={{ fontSize: 'var(--t-font-size-sm)', color: 'var(--t-text-muted)', marginTop: '4px' }}>
                        View and manage your active and history trips.
                    </p>
                </div>
                <DataTable
                    columns={COLUMNS}
                    data={SAMPLE_TRIPS}
                    searchable
                    paginated
                    pageSize={10}
                />
            </Card>
        </div>
    );
};

export default DriverTripsPage;
