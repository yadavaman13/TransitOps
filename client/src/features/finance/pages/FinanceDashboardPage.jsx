import React, { useEffect, useState } from 'react';
import { getDashboardOverviewApi } from '../services/finance.api.js';
import { CategoryBreakdownChart, MonthlyTrendChart } from '../components/FinanceCharts.jsx';
import '../styles/finance.scss';

export default function FinanceDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const res = await getDashboardOverviewApi();
                if (res.success) {
                    setStats(res.data);
                } else {
                    setError(res.message || 'Failed to load dashboard data');
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Error communicating with server');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (val) => {
        return typeof val === 'number'
            ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '$0.00';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
                <div className="spinner" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '36px', height: '36px', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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

    const { cards, charts, recentExpenses } = stats || {
        cards: { totalExpenses: 0, fuelCost: 0, maintenanceCost: 0, monthlyCost: 0 },
        charts: { categoryBreakdown: [], monthlyTrend: [] },
        recentExpenses: []
    };

    return (
        <div className="finance-container">
            {/* Header */}
            <div className="finance-header">
                <div className="finance-header__title">
                    <h1><i className="ri-bar-chart-box-line" aria-hidden="true" /> Financial Dashboard</h1>
                    <p>Track operating costs, maintenance expenses, and fuel usage trends</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-card__icon">
                        <i className="ri-bank-card-line" />
                    </div>
                    <div className="kpi-card__content">
                        <span className="kpi-card__label">Total Expenses</span>
                        <span className="kpi-card__value">{formatCurrency(cards.totalExpenses)}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-card__icon">
                        <i className="ri-gas-station-line" />
                    </div>
                    <div className="kpi-card__content">
                        <span className="kpi-card__label">Fuel Cost</span>
                        <span className="kpi-card__value">{formatCurrency(cards.fuelCost)}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-card__icon">
                        <i className="ri-settings-5-line" />
                    </div>
                    <div className="kpi-card__content">
                        <span className="kpi-card__label">Maintenance Cost</span>
                        <span className="kpi-card__value">{formatCurrency(cards.maintenanceCost)}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-card__icon">
                        <i className="ri-calendar-todo-line" />
                    </div>
                    <div className="kpi-card__content">
                        <span className="kpi-card__label">Monthly Cost</span>
                        <span className="kpi-card__value">{formatCurrency(cards.monthlyCost)}</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Category Breakdown */}
                <div className="chart-card">
                    <div className="chart-card__header">
                        <h2>Expense Category</h2>
                    </div>
                    <div className="chart-card__body">
                        <CategoryBreakdownChart data={charts.categoryBreakdown} />
                    </div>
                </div>

                {/* Monthly Trend */}
                <div className="chart-card">
                    <div className="chart-card__header">
                        <h2>Monthly Expense Trend</h2>
                    </div>
                    <div className="chart-card__body" style={{ display: 'block', minHeight: '280px' }}>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', justifyContent: 'flex-end', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-muted)' }}>Other Expenses</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#9f6a90' }} />
                                <span style={{ color: 'var(--text-muted)' }}>Fuel Cost Component</span>
                            </div>
                        </div>
                        <MonthlyTrendChart data={charts.monthlyTrend} />
                    </div>
                </div>
            </div>

            {/* Recent Expenses Table */}
            <div className="finance-table-card">
                <div className="finance-table-card__header">
                    <span>Recent Expenses</span>
                </div>
                <div className="finance-table-card__table-wrapper">
                    <table className="finance-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                                        No recent expenses logged
                                    </td>
                                </tr>
                            ) : (
                                recentExpenses.map((exp) => (
                                    <tr key={exp.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                            {exp.registrationNumber ? `${exp.registrationNumber} (${exp.vehicleNumber})` : 'N/A'}
                                        </td>
                                        <td>
                                            <span className={`badge-pill ${exp.category === 'Fuel' ? 'badge-pill--active' : ''}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(exp.date)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
