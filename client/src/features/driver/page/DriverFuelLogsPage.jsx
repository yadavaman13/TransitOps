import React, { useState } from 'react';
import {
    Card,
    DataTable,
    Breadcrumb,
    Button
} from '../../template';
import '../../template/styles/index.scss';
import '../../template/pages/DashboardTemplatePage/DashboardTemplatePage.scss';

const BREADCRUMBS = [
    { label: 'Home', link: '/driver' },
    { label: 'Fuel Logs' }
];

const COLUMNS = [
    { key: 'date', title: 'Refueling Date', sortable: true },
    { key: 'vehicle', title: 'Vehicle' },
    { key: 'liters', title: 'Quantity (Ltrs)', sortable: true },
    { key: 'rate', title: 'Rate (₹/Ltr)' },
    { key: 'cost', title: 'Total Cost (₹)', sortable: true, render: (row) => `₹${row.cost}` },
    { key: 'odometer', title: 'Odometer (km)' },
];

const SAMPLE_LOGS = [
    { id: 1, date: '2026-07-12', vehicle: 'Eicher Pro (MH-12-XY-9876)', liters: 45, rate: 96.5, cost: 4342.5, odometer: 104520 },
    { id: 2, date: '2026-07-08', vehicle: 'Tata Starbus (MH-12-AB-1234)', liters: 60, rate: 96.5, cost: 5790, odometer: 98120 },
    { id: 3, date: '2026-07-02', vehicle: 'Eicher Pro (MH-12-XY-9876)', liters: 40, rate: 96.5, cost: 3860, odometer: 103250 },
];

const DriverFuelLogsPage = () => {
    return (
        <div className="t-dash-page">
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                </div>
            </div>

            <Card padding="none">
                <div style={{ padding: 'var(--t-space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--t-font-size-lg)', fontWeight: 600, color: 'var(--t-text-title)' }}>Fuel Refueling Logs</h2>
                        <p style={{ fontSize: 'var(--t-font-size-sm)', color: 'var(--t-text-muted)', marginTop: '4px' }}>
                            View and log vehicle refueling receipts.
                        </p>
                    </div>
                    <Button variant="primary" icon="ri-add-line">
                        Log Refueling
                    </Button>
                </div>
                <DataTable
                    columns={COLUMNS}
                    data={SAMPLE_LOGS}
                    searchable
                    paginated
                    pageSize={10}
                />
            </Card>
        </div>
    );
};

export default DriverFuelLogsPage;
