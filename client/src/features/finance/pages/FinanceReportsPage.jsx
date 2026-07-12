import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getReportsApi } from '../services/finance.api.js';
import { CategoryBreakdownChart, MonthlyTrendChart, FuelCostTrendChart } from '../components/FinanceCharts.jsx';
import '../styles/finance.scss';
import { Button } from '../../template/index.js';

export default function FinanceReportsPage() {
    const [reportsData, setReportsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportsData = async () => {
            try {
                setLoading(true);
                const res = await getReportsApi();
                if (res.success) {
                    setReportsData(res.data);
                } else {
                    setError(res.message || 'Failed to load report analytics');
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Error communicating with server');
            } finally {
                setLoading(false);
            }
        };

        fetchReportsData();
    }, []);

    const formatCurrency = (val) => {
        return typeof val === 'number'
            ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // CSV Export Handler
    const handleExportCSV = async () => {
        try {
            // Fetch raw lists
            const [expRes, fuelRes] = await Promise.all([
                axios.get('/api/finance/expenses', { withCredentials: true }),
                axios.get('/api/finance/fuel', { withCredentials: true })
            ]);

            const expenses = expRes.data?.data?.expenses || [];
            const fuelLogs = fuelRes.data?.data?.fuelLogs || [];

            // Compile into rows
            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'Type,Vehicle,Trip,Category,Amount,Receipt,Description/Station,Date\n';

            expenses.forEach(e => {
                const vehicle = e.registrationNumber ? `${e.registrationNumber} (${e.vehicleNumber})` : '—';
                const row = [
                    'Expense',
                    vehicle,
                    e.tripNumber || '—',
                    e.category,
                    e.amount,
                    e.receipt || '—',
                    `"${(e.description || '').replace(/"/g, '""')}"`,
                    new Date(e.date).toLocaleDateString()
                ].join(',');
                csvContent += row + '\n';
            });

            fuelLogs.forEach(f => {
                const vehicle = f.registrationNumber ? `${f.registrationNumber} (${f.vehicleNumber})` : '—';
                const row = [
                    'Fuel Refill',
                    vehicle,
                    f.tripNumber || '—',
                    'Fuel',
                    f.totalCost,
                    '—',
                    `"Litres: ${f.litres} | Station: ${f.stationName || '—'}"`,
                    new Date(f.date).toLocaleDateString()
                ].join(',');
                csvContent += row + '\n';
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `TransitOps_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('CSV Export failed:', err);
            alert('Failed to export CSV report: ' + (err.message || err));
        }
    };

    // PDF Print Handler
    const handleExportPDF = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
                <div className="spinner" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="finance-container" style={{ textAlign: 'center', padding: '48px 0' }}>
                <i className="ri-error-warning-line" style={{ fontSize: '48px', color: 'var(--danger)' }} />
                <h2 style={{ fontSize: '18px', marginTop: '16px', color: 'var(--text-main)' }}>Data Fetching Error</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{error}</p>
            </div>
        );
    }

    const { vehicleOperatingCosts, categoryBreakdown, monthlyTrend } = reportsData || {
        vehicleOperatingCosts: [],
        categoryBreakdown: [],
        monthlyTrend: []
    };

    // Calculate maximum vehicle operating cost for scale sizing
    const maxVehicleCost = Math.max(...vehicleOperatingCosts.map(v => v.total), 1);

    return (
        <div className="finance-container print-area">
            {/* Styles for print media template */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .chart-card {
                        box-shadow: none !important;
                        border: 1px solid #000 !important;
                        page-break-inside: avoid;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="finance-header">
                <div className="finance-header__title">
                    <h1><i className="ri-line-chart-line" aria-hidden="true" /> Reports &amp; Analytics</h1>
                    <p>Compile financial reports, export logs, and analyze vehicle cost efficiencies</p>
                </div>
                <div className="finance-header__actions no-print">
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        iconLeft="ri-file-excel-line"
                    >
                        Export CSV
                    </Button>
                    <Button
                        onClick={handleExportPDF}
                        iconLeft="ri-file-pdf-line"
                    >
                        Export PDF / Print
                    </Button>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid charts-grid--reports">
                {/* 1. Fuel Cost trend */}
                <div className="chart-card">
                    <div className="chart-card__header">
                        <h2>Fuel Cost Trend</h2>
                    </div>
                    <div className="chart-card__body">
                        <FuelCostTrendChart data={monthlyTrend} />
                    </div>
                </div>

                {/* 2. Expense Category share */}
                <div className="chart-card">
                    <div className="chart-card__header">
                        <h2>Expense Trend</h2>
                    </div>
                    <div className="chart-card__body">
                        <MonthlyTrendChart data={monthlyTrend} />
                    </div>
                </div>
            </div>

            <div className="charts-grid charts-grid--reports">
                {/* 3. Maintenance Cost category breakdown */}
                <div className="chart-card">
                    <div className="chart-card__header">
                        <h2>Maintenance Cost Breakdown</h2>
                    </div>
                    <div className="chart-card__body">
                        <CategoryBreakdownChart data={categoryBreakdown} />
                    </div>
                </div>

                {/* 4. Vehicle Operating Cost */}
                <div className="chart-card">
                    <div className="chart-card__header">
                        <h2>Vehicle Operating Cost</h2>
                    </div>
                    <div className="chart-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'flex-start', alignItems: 'stretch' }}>
                        {vehicleOperatingCosts.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '40px' }}>
                                No vehicle costs tracked
                            </div>
                        ) : (
                            vehicleOperatingCosts.map(v => {
                                const ratio = v.total / maxVehicleCost;
                                return (
                                    <div key={v.vehicleId} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                            <span style={{ color: 'var(--text-main)' }}>{v.registrationNumber} ({v.brand} {v.model})</span>
                                            <span>{formatCurrency(v.total)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                            <span>Fuel: {formatCurrency(v.fuel)}</span>
                                            <span>•</span>
                                            <span>Maint: {formatCurrency(v.maintenance)}</span>
                                            <span>•</span>
                                            <span>Other: {formatCurrency(v.other)}</span>
                                        </div>
                                        
                                        {/* Cost Bar */}
                                        <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-input)', borderRadius: '6px', overflow: 'hidden', marginTop: '2px' }}>
                                            <div 
                                                style={{ 
                                                    width: `${ratio * 100}%`, 
                                                    height: '100%', 
                                                    backgroundColor: 'var(--primary)', 
                                                    borderRadius: '6px',
                                                    transition: 'width 0.5s ease-out'
                                                }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
