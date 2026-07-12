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
    { key: 'fleet', label: 'Fleet Status', icon: 'ri-bus-line' },
    { key: 'alerts', label: 'Safety Alerts', icon: 'ri-alert-line' },
];

const COLUMNS = [
    { key: 'name', title: 'Vehicle Name', sortable: true },
    { key: 'plate', title: 'Plate Number' },
    { key: 'driver', title: 'Assigned Driver', sortable: true },
    { key: 'status', title: 'Status', render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Maintenance' ? 'warning' : 'neutral'}>
            {row.status}
        </Badge>
    )},
];

const SAMPLE_VEHICLES = [
    { id: 1, name: 'Tata Starbus 40 Seater', plate: 'MH-12-PQ-4567', driver: 'Ramesh Kumar', status: 'Active' },
    { id: 2, name: 'Eicher Pro 2049', plate: 'MH-12-XY-9876', driver: 'Suresh Patel', status: 'Active' },
    { id: 3, name: 'Mahindra Cruzio', plate: 'MH-14-AB-1234', driver: 'Anil Deshmukh', status: 'Maintenance' },
    { id: 4, name: 'Tata Winger Staff Transport', plate: 'MH-14-RT-5678', driver: 'Vikram Singh', status: 'Inactive' },
];

const FleetManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('fleet');

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
                <StatCard title="Total Vehicles" value="45" icon="ri-bus-fill" color="primary" subtitle="Across all routes" />
                <StatCard title="Active Trips" value="12" icon="ri-roadster-line" color="success" subtitle="In-transit now" />
                <StatCard title="Safety Alerts" value="2" icon="ri-error-warning-line" color="danger" subtitle="Action required" />
                <StatCard title="Fuel Consumption" value="1,200 L" icon="ri-gas-station-line" color="warning" subtitle="This week" />
            </div>

            {/* Content card with tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)' }}>
                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
                </div>
                {activeTab === 'fleet' && (
                    <DataTable
                        columns={COLUMNS}
                        data={SAMPLE_VEHICLES}
                        searchable
                        selectable
                        paginated
                        pageSize={10}
                    />
                )}
                {activeTab === 'alerts' && (
                    <div style={{ padding: 'var(--t-space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--t-text-muted)' }}>
                        <i className="ri-error-warning-line" style={{ color: 'var(--t-color-danger, #ef4444)', fontSize: '18px' }} />
                        Speed alert triggered for Eicher Pro (MH-12-XY-9876) on Route 5B.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default FleetManagerDashboard;
