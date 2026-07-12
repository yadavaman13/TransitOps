import React from 'react';
import {
    Card,
    Breadcrumb,
    Button
} from '../../template';

const BREADCRUMBS = [{ label: 'Home', href: '/safety-officer' }, { label: 'Reports' }];

const SafetyReportsPage = () => {

    const handleDownload = (format, type) => {
        // Formats are: 'csv' or 'pdf'
        // Types are: 'drivers' (License Report), 'fleet' (Vehicle Safety), 'maintenance' (Maintenance)
        window.open(`/api/reports/export/${format}?type=${type}`, '_blank');
    };

    return (
        <div className="t-dash-page">
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                    <h1 className="t-dash-page__heading">Compliance Reports & Audit Logs</h1>
                    <p className="t-dash-page__subtitle">Export official company documents, licensing ledgers, and safety tracking history in CSV or PDF formats.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--t-space-5)' }}>
                {/* License Report */}
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-3)', marginBottom: 'var(--t-space-2)' }}>
                                <i className="ri-file-user-line" style={{ fontSize: '2rem', color: 'var(--t-primary)' }}></i>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--t-text-main)' }}>License Expiry Report</h3>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--t-text-muted)', margin: 0 }}>
                                Contains detailed driver rosters including names, emails, license numbers, expiration dates, availability statuses, and safety scores.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--t-space-3)' }}>
                            <Button variant="secondary" onClick={() => handleDownload('csv', 'drivers')} style={{ flex: 1 }}>
                                <i className="ri-file-excel-2-line"></i> Export CSV
                            </Button>
                            <Button variant="primary" onClick={() => handleDownload('pdf', 'drivers')} style={{ flex: 1 }}>
                                <i className="ri-file-pdf-2-line"></i> Export PDF
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Vehicle Safety Report */}
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-3)', marginBottom: 'var(--t-space-2)' }}>
                                <i className="ri-shield-check-line" style={{ fontSize: '2rem', color: 'var(--t-success)' }}></i>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--t-text-main)' }}>Vehicle Safety Report</h3>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--t-text-muted)', margin: 0 }}>
                                Lists all vehicles with registration numbers, fuel types, current odometers, statuses, and compliance dates (Insurance and PUC/pollution expiration).
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--t-space-3)' }}>
                            <Button variant="secondary" onClick={() => handleDownload('csv', 'fleet')} style={{ flex: 1 }}>
                                <i className="ri-file-excel-2-line"></i> Export CSV
                            </Button>
                            <Button variant="primary" onClick={() => handleDownload('pdf', 'fleet')} style={{ flex: 1 }}>
                                <i className="ri-file-pdf-2-line"></i> Export PDF
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Maintenance Report */}
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-3)', marginBottom: 'var(--t-space-2)' }}>
                                <i className="ri-tools-line" style={{ fontSize: '2rem', color: 'var(--t-warning)' }}></i>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--t-text-main)' }}>Maintenance Audit Report</h3>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--t-text-muted)', margin: 0 }}>
                                Compiles scheduled servicing orders, emergency breakdown repairs, service centers, cost breakdowns, and completion dates.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--t-space-3)' }}>
                            <Button variant="secondary" onClick={() => handleDownload('csv', 'maintenance')} style={{ flex: 1 }}>
                                <i className="ri-file-excel-2-line"></i> Export CSV
                            </Button>
                            <Button variant="primary" onClick={() => handleDownload('pdf', 'maintenance')} style={{ flex: 1 }}>
                                <i className="ri-file-pdf-2-line"></i> Export PDF
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SafetyReportsPage;
