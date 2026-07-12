import React, { useState } from 'react';
import StatCard    from '../../components/ui/StatCard/index.js';
import Card        from '../../components/ui/Card/index.js';
import Badge       from '../../components/ui/Badge/index.js';
import Button      from '../../components/ui/Button/index.js';
import Tabs        from '../../components/data-display/Tabs/index.js';
import DataTable   from '../../components/data-display/DataTable/index.js';
import Breadcrumb  from '../../components/navigation/Breadcrumb/index.js';
import './DashboardTemplatePage.scss';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Dashboard' }];
const TABS = [
    { key: 'overview',   label: 'Overview',   icon: 'ri-layout-grid-line' },
    { key: 'analytics',  label: 'Analytics',  icon: 'ri-bar-chart-line' },
];

const COLUMNS = [
    { key: 'name',   title: 'Name',   sortable: true },
    { key: 'email',  title: 'Email',  sortable: true },
    { key: 'status', title: 'Status', render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</Badge>
    )},
    { key: '_act', title: '', render: () => (
        <Button size="sm" variant="ghost" iconLeft="ri-pencil-line">Edit</Button>
    )},
];

const SAMPLE_DATA = [
    { id: 1, name: 'Alice Johnson', email: 'alice@erp.com', status: 'Active' },
    { id: 2, name: 'Bob Smith',     email: 'bob@erp.com',   status: 'Inactive' },
    { id: 3, name: 'Carol White',   email: 'carol@erp.com', status: 'Active' },
];

/**
 * DashboardTemplatePage
 * ── Copy this page into your feature and replace sample data with real API calls.
 */
const DashboardTemplatePage = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="t-dash-page">
            {/* Page header */}
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                    <h1 className="t-dash-page__heading">Dashboard</h1>
                    <p className="t-dash-page__subtitle">Welcome back — here's your overview</p>
                </div>
                <div className="t-dash-page__actions">
                    <Button variant="outline" iconLeft="ri-download-line" size="sm">Export</Button>
                    <Button iconLeft="ri-add-line" size="sm">New Record</Button>
                </div>
            </div>

            {/* KPI grid */}
            <div className="t-dash-page__stats">
                <StatCard title="Total Revenue"  value="₹1,20,000" icon="ri-money-dollar-circle-line" trend="+12%" trendUp color="primary" subtitle="vs last month" />
                <StatCard title="Active Users"   value="248"       icon="ri-group-line"               trend="+5%"  trendUp color="success" />
                <StatCard title="Pending Orders" value="34"        icon="ri-shopping-cart-2-line"      trend="-3"   trendUp={false} color="warning" />
                <StatCard title="Open Issues"    value="7"         icon="ri-error-warning-line"        color="danger" />
            </div>

            {/* Content card with tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)' }}>
                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
                </div>
                {activeTab === 'overview' && (
                    <DataTable
                        columns={COLUMNS}
                        data={SAMPLE_DATA}
                        searchable
                        selectable
                        paginated
                        pageSize={10}
                        toolbarActions={
                            <Button variant="outline" size="sm" iconLeft="ri-filter-line">Filter</Button>
                        }
                    />
                )}
                {activeTab === 'analytics' && (
                    <div style={{ padding: 'var(--t-space-8)', textAlign: 'center', color: 'var(--t-text-muted)' }}>
                        📊 Plug in a ChartCard component here (Recharts / Chart.js wrapper)
                    </div>
                )}
            </Card>

        </div>
    );
};

export default DashboardTemplatePage;
