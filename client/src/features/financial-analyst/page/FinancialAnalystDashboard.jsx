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
    { key: 'expenses', label: 'Expenses Log', icon: 'ri-money-dollar-circle-line' },
    { key: 'reports', label: 'Department Budgets', icon: 'ri-pie-chart-line' },
];

const COLUMNS = [
    { key: 'category', title: 'Expense Category', sortable: true },
    { key: 'amount', title: 'Amount', sortable: true },
    { key: 'status', title: 'Status', render: (row) => (
        <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'}>
            {row.status}
        </Badge>
    )},
    { key: 'approvedBy', title: 'Approved By' },
    { key: 'date', title: 'Date', sortable: true },
];

const SAMPLE_EXPENSES = [
    { id: 1, category: 'Fuel Refill - Eicher Pro', amount: '₹14,500', status: 'Approved', approvedBy: 'Fleet Manager', date: '2026-07-12' },
    { id: 2, category: 'Break Pad Replacement', amount: '₹8,200', status: 'Approved', approvedBy: 'Fleet Manager', date: '2026-07-11' },
    { id: 3, category: 'Insurance Renewal (Tata Starbus)', amount: '₹45,000', status: 'Pending', approvedBy: '—', date: '2026-07-09' },
];

const FinancialAnalystDashboard = () => {
    const [activeTab, setActiveTab] = useState('expenses');

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
                <StatCard title="Total Spend" value="₹2,45,000" icon="ri-wallet-3-line" color="primary" subtitle="This month" />
                <StatCard title="Cost per Km" value="₹12.4 / km" icon="ri-pin-distance-line" color="success" subtitle="Goal: <₹15.0 / km" />
                <StatCard title="Fuel Efficiency" value="4.8 km/L" icon="ri-gas-station-fill" color="warning" subtitle="Fleet average" />
                <StatCard title="Pending Invoices" value="₹45,000" icon="ri-bill-line" color="danger" subtitle="Action required" />
            </div>

            {/* Content card with tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)' }}>
                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
                </div>
                {activeTab === 'expenses' && (
                    <DataTable
                        columns={COLUMNS}
                        data={SAMPLE_EXPENSES}
                        searchable
                        selectable
                        paginated
                        pageSize={10}
                    />
                )}
                {activeTab === 'reports' && (
                    <div style={{ padding: 'var(--t-space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--t-text-muted)' }}>
                        <i className="ri-bar-chart-box-line" style={{ color: 'var(--t-color-primary, #6366f1)', fontSize: '18px' }} />
                        Operating budget at 64% utilization for Q3. Fuel costs account for 55% of the total spend.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default FinancialAnalystDashboard;
