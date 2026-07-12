import React, { useState } from 'react';
import {
    StatCard,
    Card,
    Badge,
    Tabs,
    DataTable,
    Breadcrumb
} from '../../template';
import '../../template/styles/index.scss';
import '../../template/pages/DashboardTemplatePage/DashboardTemplatePage.scss';

const BREADCRUMBS = [{ label: 'Home' }];
const TABS = [
    { key: 'trips', label: 'My Trips', icon: 'ri-navigation-line' },
    { key: 'checklist', label: 'Vehicle Check', icon: 'ri-checkbox-circle-line' },
];

const COLUMNS = [
    { key: 'date', title: 'Date', sortable: true },
    { key: 'route', title: 'Route Name' },
    { key: 'duration', title: 'Duration' },
    { key: 'status', title: 'Trip Status', render: (row) => (
        <Badge variant={row.status === 'Completed' ? 'success' : 'neutral'}>
            {row.status}
        </Badge>
    )},
];

const SAMPLE_TRIPS = [
    { id: 1, date: '2026-07-12', route: 'Route 104: Main Depot to North Station', duration: '1 hr 15 mins', status: 'Completed' },
    { id: 2, date: '2026-07-11', route: 'Route 104: North Station to Main Depot', duration: '1 hr 10 mins', status: 'Completed' },
    { id: 3, date: '2026-07-10', route: 'Route 108: Express Depot to Airport T2', duration: '2 hrs 5 mins', status: 'Completed' },
];

const DriverDashboard = () => {
    const [activeTab, setActiveTab] = useState('trips');

    return (
        <div className="t-dash-page">
            {/* Page header */}
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                </div>
            </div>

            {/* KPI grid */}
            <div className="t-dash-page__stats">
                <StatCard title="Active Assignment" value="Route 104" icon="ri-road-map-line" color="primary" subtitle="Next departure: 2:00 PM" />
                <StatCard title="Duty Hours (Week)" value="32.5 hrs" icon="ri-time-line" color="success" subtitle="Within normal limits" />
                <StatCard title="Safety Score" value="4.9 / 5.0" icon="ri-shield-check-line" color="warning" subtitle="Excellent rating" />
                <StatCard title="Active Alerts" value="0" icon="ri-notification-3-line" color="danger" subtitle="No issues reported" />
            </div>

            {/* Content card with tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)' }}>
                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
                </div>
                {activeTab === 'trips' && (
                    <DataTable
                        columns={COLUMNS}
                        data={SAMPLE_TRIPS}
                        searchable
                        selectable
                        paginated
                        pageSize={10}
                    />
                )}
                {activeTab === 'checklist' && (
                    <div style={{ padding: 'var(--t-space-8)', textAlign: 'center', color: 'var(--t-text-muted)' }}>
                        ✅ Daily vehicle safety checklist is completed. Tire pressure, breaks, and fuel are okay.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DriverDashboard;
