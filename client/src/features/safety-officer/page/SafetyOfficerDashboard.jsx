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
    { key: 'incidents', label: 'Incident Log', icon: 'ri-alarm-warning-line' },
    { key: 'audits', label: 'Driver Audits', icon: 'ri-file-user-line' },
];

const COLUMNS = [
    { key: 'driver', title: 'Driver Name', sortable: true },
    { key: 'vehicle', title: 'Vehicle' },
    { key: 'type', title: 'Incident Type' },
    { key: 'severity', title: 'Severity', render: (row) => (
        <Badge variant={row.severity === 'High' ? 'danger' : row.severity === 'Medium' ? 'warning' : 'neutral'}>
            {row.severity}
        </Badge>
    )},
    { key: 'date', title: 'Date', sortable: true },
];

const SAMPLE_INCIDENTS = [
    { id: 1, driver: 'Suresh Patel', vehicle: 'Eicher Pro (MH-12-XY-9876)', type: 'Over-speeding (>80 km/h)', severity: 'Medium', date: '2026-07-12' },
    { id: 2, driver: 'Vikram Singh', vehicle: 'Tata Winger (MH-14-RT-5678)', type: 'Harsh Braking', severity: 'Low', date: '2026-07-11' },
    { id: 3, driver: 'Ramesh Kumar', vehicle: 'Tata Starbus (MH-12-PQ-4567)', type: 'Route Deviation Alert', severity: 'Low', date: '2026-07-10' },
];

const SafetyOfficerDashboard = () => {
    const [activeTab, setActiveTab] = useState('incidents');

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
                <StatCard title="Critical Incidents" value="1" icon="ri-error-warning-fill" color="danger" subtitle="Needs investigation" />
                <StatCard title="Speed Violations" value="4" icon="ri-dashboard-fill" color="warning" subtitle="In the last 24 hours" />
                <StatCard title="Avg Safety Score" value="92%" icon="ri-shield-fill" color="success" subtitle="Goal: >90% compliance" />
                <StatCard title="Driver Audits Done" value="18 / 20" icon="ri-contacts-book-line" color="primary" subtitle="This month" />
            </div>

            {/* Content card with tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)' }}>
                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
                </div>
                {activeTab === 'incidents' && (
                    <DataTable
                        columns={COLUMNS}
                        data={SAMPLE_INCIDENTS}
                        searchable
                        selectable
                        paginated
                        pageSize={10}
                    />
                )}
                {activeTab === 'audits' && (
                    <div style={{ padding: 'var(--t-space-8)', textAlign: 'center', color: 'var(--t-text-muted)' }}>
                        📝 All 18 driver background verification and medical audits completed successfully. 2 pending.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SafetyOfficerDashboard;
