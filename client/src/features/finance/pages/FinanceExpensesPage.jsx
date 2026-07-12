import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getExpensesApi, createExpenseApi } from '../services/finance.api.js';
import '../styles/finance.scss';
import {
    Button,
    Select,
    Input,
    DatePicker,
    Modal,
    Form,
    FormSection,
    FormRow,
    FormActions
} from '../../template/index.js';

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
            ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
                    <Button 
                        iconLeft="ri-add-line"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add Manual Expense
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filters-panel" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '160px' }}>
                    <Select
                        label="Category"
                        options={[
                            { value: 'Toll', label: 'Toll' },
                            { value: 'Parking', label: 'Parking' },
                            { value: 'Repair', label: 'Repair' },
                            { value: 'Insurance', label: 'Insurance' },
                            { value: 'Misc', label: 'Misc' }
                        ]}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        size="sm"
                        clearable
                        placeholder="All Categories"
                    />
                </div>

                <div style={{ minWidth: '220px' }}>
                    <Select
                        label="Vehicle"
                        options={vehicles.map(v => ({
                            value: v.id,
                            label: `${v.registrationNumber} (${v.brand} ${v.model})`
                        }))}
                        value={filterVehicle}
                        onChange={(e) => setFilterVehicle(e.target.value)}
                        size="sm"
                        clearable
                        placeholder="All Vehicles"
                    />
                </div>

                <div style={{ minWidth: '150px' }}>
                    <DatePicker
                        label="Start Date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                </div>

                <div style={{ minWidth: '150px' }}>
                    <DatePicker
                        label="End Date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                </div>

                {(filterCategory || filterVehicle || filterStartDate || filterEndDate) && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setFilterCategory('');
                            setFilterVehicle('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                        }}
                    >
                        Clear Filters
                    </Button>
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
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                }}
                title="Log Manual Expense"
            >
                {modalError && (
                    <div style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger)', padding: '10px', borderRadius: 'var(--border-radius)', color: 'var(--danger-dark)', fontSize: '13px', marginBottom: '16px' }}>
                        {modalError}
                    </div>
                )}

                <Form onSubmit={handleCreateExpense}>
                    <FormSection>
                        <FormRow>
                            <Select
                                label="Vehicle"
                                required
                                options={vehicles.map(v => ({
                                    value: v.id,
                                    label: `${v.registrationNumber} (${v.brand} ${v.model})`
                                }))}
                                value={modalVehicleId}
                                onChange={(e) => setModalVehicleId(e.target.value)}
                                placeholder="Select Fleet Vehicle"
                            />
                        </FormRow>
                        <FormRow cols={2}>
                            <Select
                                label="Category"
                                required
                                options={[
                                    { value: 'Toll', label: 'Toll' },
                                    { value: 'Parking', label: 'Parking' },
                                    { value: 'Repair', label: 'Repair' },
                                    { value: 'Insurance', label: 'Insurance' },
                                    { value: 'Misc', label: 'Misc' }
                                ]}
                                value={modalCategory}
                                onChange={(e) => setModalCategory(e.target.value)}
                            />
                            <Input
                                type="number"
                                label="Amount (₹)"
                                required
                                step="0.01"
                                min="0.01"
                                placeholder="Enter cost amount"
                                value={modalAmount}
                                onChange={(e) => setModalAmount(e.target.value)}
                            />
                        </FormRow>
                        <FormRow>
                            <Select
                                label="Associated Trip (Optional)"
                                options={trips.map(t => ({
                                    value: t.id,
                                    label: `Trip #${t.tripNumber} (${t.source} → ${t.destination})`
                                }))}
                                value={modalTripId}
                                onChange={(e) => setModalTripId(e.target.value)}
                                clearable
                                placeholder="None / Not associated"
                            />
                        </FormRow>
                        <FormRow>
                            <Input
                                type="text"
                                label="Receipt URL / File Path"
                                placeholder="e.g. https://receipts.com/bill.pdf"
                                value={modalReceipt}
                                onChange={(e) => setModalReceipt(e.target.value)}
                            />
                        </FormRow>
                        <FormRow>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Provide detailed breakdown"
                                    value={modalDescription}
                                    onChange={(e) => setModalDescription(e.target.value)}
                                    style={{
                                        borderRadius: 'var(--border-radius)',
                                        border: '1px solid var(--border-color)',
                                        padding: '8px 10px',
                                        outline: 'none',
                                        backgroundColor: 'var(--bg-input)',
                                        resize: 'vertical',
                                        color: 'var(--text-main)',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                        </FormRow>
                    </FormSection>

                    <FormActions>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                setModalError(null);
                            }}
                            disabled={modalSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={modalSubmitting}
                        >
                            Log Expense
                        </Button>
                    </FormActions>
                </Form>
            </Modal>
        </div>
    );
}
