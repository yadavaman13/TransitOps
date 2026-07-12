import React, { useState, useEffect } from 'react';
import {
    StatCard,
    Card,
    Badge,
    DataTable,
    Breadcrumb,
    Button,
    Select,
    useToast
} from '../../template';
import '../../template/styles/index.scss';
import * as fleetApi from '../service/fleet.api';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Reports & Analytics' }];

// Helper for dynamic SVG Line/Area Chart for Trends
const SvgLineChart = ({ data, height = 200, strokeColor = 'var(--t-primary)' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 10);
    const chartHeight = height - 40;
    const paddingLeft = 40;
    const paddingRight = 20;
    const chartWidth = 500;
    const widthOffset = chartWidth - paddingLeft - paddingRight;

    // Build SVG points coordinates
    const points = data.map((item, index) => {
        const x = paddingLeft + (index / (data.length - 1)) * widthOffset;
        const y = chartHeight - (item.value / maxValue) * (chartHeight - 30);
        return { x, y, value: item.value, label: item.label };
    });

    const pathData = points.reduce((acc, p, i) => {
        return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    // Area fill coordinates
    const areaData = pathData + ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${chartWidth} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
                <defs>
                    <linearGradient id="gradient-line" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Y Axis Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                    const yVal = chartHeight - val * (chartHeight - 30);
                    return (
                        <g key={idx}>
                            <line x1={paddingLeft} y1={yVal} x2={chartWidth - paddingRight} y2={yVal} stroke="var(--t-border-color)" strokeWidth="1" strokeDasharray="4 4" />
                            <text x={paddingLeft - 8} y={yVal + 4} fill="var(--t-text-muted)" fontSize="10" textAnchor="end">
                                {Math.round(val * maxValue)}
                            </text>
                        </g>
                    );
                })}

                {/* Area path */}
                <path d={areaData} fill="url(#gradient-line)" />

                {/* Line path */}
                <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />

                {/* Dots & labels */}
                {points.map((p, idx) => (
                    <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="5" fill="var(--t-bg-sidebar)" stroke={strokeColor} strokeWidth="2" />
                        <text x={p.x} y={chartHeight + 18} fill="var(--t-text-muted)" fontSize="10" textAnchor="middle">
                            {p.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// Helper for horizontal bar chart for costly items
const SvgHorizontalBarChart = ({ data, height = 200, barColor = 'var(--t-danger)' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 10);
    const itemHeight = 32;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-3)' }}>
            {data.map((item, index) => {
                const widthPercent = (item.value / maxValue) * 100;
                return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--t-font-size-body-sm)' }}>
                            <span style={{ color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-medium)' }}>{item.label}</span>
                            <span style={{ color: 'var(--t-text-muted)', fontWeight: 'var(--t-font-weight-semibold)' }}>₹{item.value.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '14px', backgroundColor: 'var(--t-bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${widthPercent}%`,
                                height: '100%',
                                backgroundColor: barColor,
                                borderRadius: '4px',
                                transition: 'width 0.5s ease-out'
                            }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ReportsPage = () => {
    const { showToast } = useToast();
    const [reportType, setReportType] = useState('fleet'); // 'fleet' | 'trips' | 'expenses' | 'costs'
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const loadReportDetails = async (type) => {
        setLoading(true);
        try {
            let res;
            if (type === 'fleet') {
                res = await fleetApi.getFleetReport();
            } else if (type === 'trips') {
                res = await fleetApi.getTripReport();
            } else if (type === 'expenses') {
                res = await fleetApi.getExpenseReport();
            } else {
                res = await fleetApi.getOperationalCostReport();
            }

            if (res?.success) {
                setReportData(res.data);
            }
        } catch (err) {
            showToast('Failed to compile reports.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReportDetails(reportType);
    }, [reportType]);

    const handleExport = (format) => {
        const url = `/api/reports/export/${format}?type=${reportType}`;
        window.open(url, '_blank');
        showToast(`${format.toUpperCase()} export initiated for ${reportType} report.`, 'success');
    };

    // Prepare mockup/dynamic visual lists
    const tripsPerMonth = [
        { label: 'Jan', value: 12 },
        { label: 'Feb', value: 18 },
        { label: 'Mar', value: 15 },
        { label: 'Apr', value: 24 },
        { label: 'May', value: 22 },
        { label: 'Jun', value: 30 },
    ];

    const fuelTrend = [
        { label: 'W1', value: 14000 },
        { label: 'W2', value: 12000 },
        { label: 'W3', value: 18000 },
        { label: 'W4', value: 15500 },
    ];

    const topCostlyVehicles = [
        { label: 'Tata Winger (MH-14-RT-5678)', value: 45000 },
        { label: 'Eicher Pro 2049 (MH-12-XY-9876)', value: 38200 },
        { label: 'Mahindra Cruzio (MH-14-AB-1234)', value: 28500 },
        { label: 'Tata Starbus (MH-12-PQ-4567)', value: 15200 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Analytical Reports & Insights
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: 'var(--t-space-3)' }}>
                    <Button variant="outline" iconLeft="ri-file-excel-line" onClick={() => handleExport('csv')}>
                        Export CSV
                    </Button>
                    <Button iconLeft="ri-file-pdf-line" onClick={() => handleExport('pdf')}>
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Quick KPI stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--t-space-4)' }}>
                <StatCard title="Fuel Efficiency" value="12.5 km/L" icon="ri-gas-station-fill" color="warning" subtitle="Average mileage economy" />
                <StatCard title="Fleet Utilization" value="87%" icon="ri-pie-chart-line" color="primary" subtitle="Active in-transit runs" />
                <StatCard title="Operational Expense" value="₹1,26,900" icon="ri-wallet-3-line" color="info" subtitle="All categories combined" />
                <StatCard title="Vehicle ROI Rate" value="94.2%" icon="ri-line-chart-line" color="success" subtitle="Yield efficiency return" />
            </div>

            {/* Report filter panel */}
            <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-4)' }}>
                    <span style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>Select Report Segment:</span>
                    <div style={{ width: '280px' }}>
                        <Select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            options={[
                                { value: 'fleet', label: 'Fleet Asset Report' },
                                { value: 'trips', label: 'Trip Execution Report' },
                                { value: 'expenses', label: 'Expenses & Ledger Report' },
                                { value: 'costs', label: 'Operational Cost Analysis' },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Dynamic visual trend widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--t-space-5)' }}>
                <Card>
                    <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Trip Counts Trends (Trips/Month)
                    </h3>
                    <SvgLineChart data={tripsPerMonth} strokeColor="var(--t-primary)" />
                </Card>

                <Card>
                    <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Weekly Fuel Expenditure Trend (₹)
                    </h3>
                    <SvgLineChart data={fuelTrend} strokeColor="var(--t-info)" />
                </Card>
            </div>

            {/* Horizontal analytics widget */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--t-space-5)' }}>
                <Card>
                    <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Top 4 Costliest Vehicles
                    </h3>
                    <SvgHorizontalBarChart data={topCostlyVehicles} />
                </Card>

                <Card padding="none">
                    <div style={{ padding: 'var(--t-space-4) var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)' }}>
                        <h3 style={{ margin: 0, fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                            Active Report Summary Records
                        </h3>
                    </div>
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--t-space-8)', color: 'var(--t-text-muted)' }}>
                            Generating report logs...
                        </div>
                    ) : (
                        <>
                            {reportType === 'fleet' && reportData?.vehicles && (
                                <DataTable
                                    columns={[
                                        { key: 'registrationNumber', title: 'Reg. Number' },
                                        { key: 'brand', title: 'Brand' },
                                        { key: 'model', title: 'Model' },
                                        { key: 'fuelType', title: 'Fuel' },
                                        { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'AVAILABLE' ? 'success' : 'neutral'}>{r.status}</Badge> }
                                    ]}
                                    data={reportData.vehicles.slice(0, 5)}
                                    emptyMessage="No vehicles logged."
                                />
                            )}

                            {reportType === 'trips' && reportData?.trips && (
                                <DataTable
                                    columns={[
                                        { key: 'tripNumber', title: 'Trip No' },
                                        { key: 'source', title: 'Source' },
                                        { key: 'destination', title: 'Destination' },
                                        { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'COMPLETED' ? 'success' : 'neutral'}>{r.status}</Badge> }
                                    ]}
                                    data={reportData.trips.slice(0, 5)}
                                    emptyMessage="No trips logged."
                                />
                            )}

                            {reportType === 'expenses' && reportData?.expenses && (
                                <DataTable
                                    columns={[
                                        { key: 'category', title: 'Category' },
                                        { key: 'amount', title: 'Amount', render: (r) => `₹${r.amount}` },
                                        { key: 'description', title: 'Note' }
                                    ]}
                                    data={reportData.expenses.slice(0, 5)}
                                    emptyMessage="No expenses ledger logged."
                                />
                            )}

                            {reportType === 'costs' && reportData?.breakdown && (
                                <DataTable
                                    columns={[
                                        { key: 'registrationNumber', title: 'Vehicle' },
                                        { key: 'fuelCost', title: 'Fuel', render: (r) => `₹${r.fuelCost}` },
                                        { key: 'maintenanceCost', title: 'Repair', render: (r) => `₹${r.maintenanceCost}` },
                                        { key: 'totalOperationalCost', title: 'Total Cost', render: (r) => `₹${r.totalOperationalCost}` }
                                    ]}
                                    data={reportData.breakdown.slice(0, 5)}
                                    emptyMessage="No cost breakdown calculated."
                                />
                            )}
                        </>
                    )}
                </Card>
            </div>

        </div>
    );
};

export default ReportsPage;
