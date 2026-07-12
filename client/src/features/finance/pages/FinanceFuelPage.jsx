import React, { useEffect, useState } from 'react';
import { getFuelLogsApi } from '../services/finance.api.js';
import '../styles/finance.scss';

export default function FinanceFuelPage() {
    const [fuelLogs, setFuelLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFuelLogs = async () => {
            try {
                setLoading(true);
                const res = await getFuelLogsApi();
                if (res.success) {
                    setFuelLogs(res.data.fuelLogs);
                } else {
                    setError(res.message || 'Failed to load fuel logs');
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Error communicating with server');
            } finally {
                setLoading(false);
            }
        };

        fetchFuelLogs();
    }, []);

    const formatCurrency = (val) => {
        return typeof val === 'number'
            ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="finance-container">
            {/* Header */}
            <div className="finance-header">
                <div className="finance-header__title">
                    <h1><i className="ri-gas-station-line" aria-hidden="true" /> Fuel Logs</h1>
                    <p>Audit vehicle refueling transactions, fuel rates, and total consumption costs</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="finance-table-card">
                <div className="finance-table-card__header">
                    <span>Fuel Refilling Entries</span>
                </div>
                <div className="finance-table-card__table-wrapper">
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                            <div className="spinner" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--danger)' }}>
                            <i className="ri-error-warning-line" style={{ fontSize: '24px', marginRight: '8px' }} />
                            <span>{error}</span>
                        </div>
                    ) : fuelLogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <i className="ri-inbox-line" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                            <span>No fuel log records found in the database</span>
                        </div>
                    ) : (
                        <table className="finance-table">
                            <thead>
                                <tr>
                                    <th>Vehicle</th>
                                    <th>Trip</th>
                                    <th>Litres</th>
                                    <th>Price/Litre</th>
                                    <th>Total Cost</th>
                                    <th>Station Name</th>
                                    <th>Odometer</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fuelLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ fontWeight: 600 }}>
                                            {log.registrationNumber ? `${log.registrationNumber} (${log.vehicleNumber})` : '—'}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{log.tripNumber || '—'}</td>
                                        <td>{Number(log.litres).toFixed(2)} L</td>
                                        <td>{formatCurrency(log.pricePerLitre)}/L</td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(log.totalCost)}</td>
                                        <td>{log.stationName || '—'}</td>
                                        <td>{log.odometer ? `${Number(log.odometer).toLocaleString()} km` : '—'}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(log.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
