import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getExpensesApi, createExpenseApi } from '../services/finance.api.js';
import '../styles/finance.scss';

export default function FinanceExpensesPage() {
    const [expensesList, setExpensesList] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    
    // Filters state
    const [filterCategory, setFilterCategory] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalVehicleId, setModalVehicleId] = useState('');
    const [modalCategory, setModalCategory] = useState('Toll');
    const [modalAmount, setModalAmount] = useState('');
    const [modalTripId, setModalTripId] = useState('');
    const [modalDescription, setModalDescription] = useState('');
    const [modalReceipt, setModalReceipt] = useState('');
    const [modalSubmitting, setModalSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterCategory) params.category = filterCategory;
            if (filterVehicle) params.vehicleId = filterVehicle;
            if (filterStartDate) params.startDate = filterStartDate;
            if (filterEndDate) params.endDate = filterEndDate;

            const res = await getExpensesApi(params);
            if (res.success) {
                setExpensesList(res.data.expenses);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            // Load vehicles
            const vehRes = await axios.get('/api/vehicles', { withCredentials: true });
            if (vehRes.data?.success) {
                // Adjust if returned nested inside data
                const list = vehRes.data.data.vehicles || vehRes.data.data || [];
                setVehicles(list);
            }
            
            // Load trips
            const tripRes = await axios.get('/api/trips', { withCredentials: true });
            if (tripRes.data?.success) {
                const list = tripRes.data.data.trips || tripRes.data.data || [];
                setTrips(list);
            }
        } catch (err) {
            console.error('Dropdown load warning:', err);
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchDropdowns();
    }, [filterCategory, filterVehicle, filterStartDate, filterEndDate]);

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        try {
            setModalSubmitting(true);
            setModalError(null);

            const payload = {
                vehicleId: modalVehicleId,
                category: modalCategory,
                amount: parseFloat(modalAmount),
                description: modalDescription || undefined,
                receipt: modalReceipt || undefined
            };

            if (modalTripId) {
                payload.tripId = modalTripId;
            }

            const res = await createExpenseApi(payload);
            if (res.success) {
                setIsModalOpen(false);
                // Clear modal form
                setModalVehicleId('');
                setModalCategory('Toll');
                setModalAmount('');
                setModalTripId('');
                setModalDescription('');
                setModalReceipt('');
                fetchExpenses();
            } else {
                setModalError(res.message || 'Failed to create expense');
            }
        } catch (err) {
            console.error(err);
            setModalError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to submit expense');
        } finally {
            setModalSubmitting(false);
        }
    };

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
                    <h1><i className="ri-receipt-line" aria-hidden="true" /> Expense Log</h1>
                    <p>Track operating costs, toll expenses, maintenance bills, and manual logs</p>
                </div>
                <div className="finance-header__actions">
                    <button 
                        className="button-primary"
                        onClick={() => setIsModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 var(--space-4)' }}
                    >
                        <i className="ri-add-line" />
                        <span>Add Manual Expense</span>
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filters-panel">
                <div className="filter-group">
                    <label htmlFor="filter-cat">Category</label>
                    <select
                        id="filter-cat"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Toll">Toll</option>
                        <option value="Parking">Parking</option>
                        <option value="Repair">Repair</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Misc">Misc</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="filter-veh">Vehicle</label>
                    <select
                        id="filter-veh"
                        value={filterVehicle}
                        onChange={(e) => setFilterVehicle(e.target.value)}
                    >
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.registrationNumber} ({v.brand} {v.model})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="filter-start">Start Date</label>
                    <input
                        id="filter-start"
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="filter-end">End Date</label>
                    <input
                        id="filter-end"
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                </div>

                {(filterCategory || filterVehicle || filterStartDate || filterEndDate) && (
                    <button
                        className="button-secondary"
                        onClick={() => {
                            setFilterCategory('');
                            setFilterVehicle('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                        }}
                        style={{ height: '36px', marginTop: '16px' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="finance-table-card">
                <div className="finance-table-card__header">
                    <span>Expense Items</span>
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
                    ) : expensesList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <i className="ri-inbox-line" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                            <span>No expenses found matching the active filters</span>
                        </div>
                    ) : (
                        <table className="finance-table">
                            <thead>
                                <tr>
                                    <th>Trip</th>
                                    <th>Vehicle</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Receipt</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expensesList.map((exp) => (
                                    <tr key={exp.id}>
                                        <td style={{ fontWeight: 500 }}>{exp.tripNumber || '—'}</td>
                                        <td style={{ fontWeight: 500 }}>
                                            {exp.registrationNumber ? `${exp.registrationNumber} (${exp.vehicleNumber})` : '—'}
                                        </td>
                                        <td>
                                            <span className="badge-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                                        <td>
                                            {exp.receipt ? (
                                                <a href={exp.receipt} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                                    View Receipt
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>No Receipt</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{exp.description || '—'}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(exp.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Manual Expense Modal */}
            {isModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(31, 26, 55, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="modal-content" style={{ width: '100%', maxWidth: 'var(--detail-modal-width)', backgroundColor: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="modal-content__header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
                            <i className="ri-add-circle-line" style={{ fontSize: '22px', color: 'var(--primary)' }} />
                            <span className="modal-content__title" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>Log Manual Expense</span>
                        </div>

                        {modalError && (
                            <div style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger)', padding: '10px', borderRadius: 'var(--border-radius)', color: 'var(--danger-dark)', fontSize: '13px', marginBottom: '16px' }}>
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle *</label>
                                <select
                                    required
                                    value={modalVehicleId}
                                    onChange={(e) => setModalVehicleId(e.target.value)}
                                    style={{ height: '38px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '0 8px', outline: 'none', backgroundColor: 'var(--bg-input)' }}
                                >
                                    <option value="">Select Fleet Vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.registrationNumber} ({v.brand} {v.model})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category *</label>
                                <select
                                    required
                                    value={modalCategory}
                                    onChange={(e) => setModalCategory(e.target.value)}
                                    style={{ height: '38px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '0 8px', outline: 'none', backgroundColor: 'var(--bg-input)' }}
                                >
                                    <option value="Toll">Toll</option>
                                    <option value="Parking">Parking</option>
                                    <option value="Repair">Repair</option>
                                    <option value="Insurance">Insurance</option>
                                    <option value="Misc">Misc</option>
                                </select>
                            </div>

                            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount ($) *</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="Enter cost amount"
                                    value={modalAmount}
                                    onChange={(e) => setModalAmount(e.target.value)}
                                    style={{ height: '38px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '0 10px', outline: 'none', backgroundColor: 'var(--bg-input)' }}
                                />
                            </div>

                            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Associated Trip (Optional)</label>
                                <select
                                    value={modalTripId}
                                    onChange={(e) => setModalTripId(e.target.value)}
                                    style={{ height: '38px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '0 8px', outline: 'none', backgroundColor: 'var(--bg-input)' }}
                                >
                                    <option value="">None / Not associated</option>
                                    {trips.map(t => (
                                        <option key={t.id} value={t.id}>
                                            Trip #{t.tripNumber} ({t.source} → {t.destination})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Receipt URL / File Path</label>
                                <input
                                    type="text"
                                    placeholder="e.g. https://receipts.com/bill.pdf"
                                    value={modalReceipt}
                                    onChange={(e) => setModalReceipt(e.target.value)}
                                    style={{ height: '38px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '0 10px', outline: 'none', backgroundColor: 'var(--bg-input)' }}
                                />
                            </div>

                            <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Provide detailed breakdown"
                                    value={modalDescription}
                                    onChange={(e) => setModalDescription(e.target.value)}
                                    style={{ borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', padding: '8px 10px', outline: 'none', backgroundColor: 'var(--bg-input)', resize: 'vertical' }}
                                />
                            </div>

                            <div className="modal-content__actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    className="button-secondary"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setModalError(null);
                                    }}
                                    disabled={modalSubmitting}
                                    style={{ height: '38px', padding: '0 16px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="button-primary"
                                    disabled={modalSubmitting}
                                    style={{ height: '38px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    {modalSubmitting ? 'Logging...' : 'Log Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
