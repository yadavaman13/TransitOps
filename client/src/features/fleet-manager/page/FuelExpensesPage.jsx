import React, { useState, useEffect } from 'react';
import {
    StatCard,
    Card,
    Badge,
    Tabs,
    DataTable,
    Breadcrumb,
    Button,
    Modal,
    Input,
    Select,
    DatePicker,
    ConfirmDialog,
    Dropdown,
    useToast
} from '../../template';
import '../../template/styles/index.scss';
import * as fleetApi from '../service/fleet.api';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Fuel & Expenses' }];

const EXPENSE_CATEGORIES = [
    { value: 'Fuel', label: 'Fuel' },
    { value: 'Repair', label: 'Repair' },
    { value: 'Parking', label: 'Parking' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Toll', label: 'Toll' },
    { value: 'Misc', label: 'Miscellaneous' },
];

const EMPTY_FUEL_FORM = {
    vehicleId: '',
    driverId: '',
    tripId: '',
    litres: '',
    pricePerLitre: '',
    totalCost: '',
    odometer: '',
    stationName: '',
    date: new Date().toISOString().split('T')[0],
};

const EMPTY_EXPENSE_FORM = {
    vehicleId: '',
    tripId: '',
    category: 'Fuel',
    amount: '',
    description: '',
    receipt: '',
};

const FuelExpensesPage = () => {
    const { showToast } = useToast();
    const [activeSection, setActiveSection] = useState('fuel'); // 'fuel' or 'expenses'
    const [loading, setLoading] = useState(false);

    // Logs lists
    const [fuelLogs, setFuelLogs] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // Resource lists for drop downs
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);

    // KPI Metrics state
    const [fuelMetrics, setFuelMetrics] = useState({ totalCost: 0, totalLitres: 0, averagePrice: 0 });
    const [expenseMetrics, setExpenseMetrics] = useState({ totalAmount: 0 });

    // Modals & Form states
    const [fuelModalOpen, setFuelModalOpen] = useState(false);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [fuelForm, setFuelForm] = useState(EMPTY_FUEL_FORM);
    const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    // Delete confirm targets
    const [deleteFuelTarget, setDeleteFuelTarget] = useState(null);
    const [deleteExpenseTarget, setDeleteExpenseTarget] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fLogsRes, expRes, fSumRes, expSumRes, vRes, dRes, tRes] = await Promise.all([
                fleetApi.listFuelLogs(),
                fleetApi.listExpenses(),
                fleetApi.getFuelSummary(),
                fleetApi.getExpenseSummary(),
                fleetApi.listVehicles(),
                fleetApi.listDrivers(),
                fleetApi.listTrips()
            ]);

            if (fLogsRes?.success) setFuelLogs(fLogsRes.data);
            if (expRes?.success) setExpenses(expRes.data);
            
            if (fSumRes?.success && fSumRes.data.metrics) {
                setFuelMetrics(fSumRes.data.metrics);
            }
            if (expSumRes?.success && expSumRes.data.metrics) {
                setExpenseMetrics(expSumRes.data.metrics);
            }

            if (vRes?.success) setVehicles(vRes.data.filter(v => v.status !== 'RETIRED'));
            if (dRes?.success) setDrivers(dRes.data.filter(d => d.availabilityStatus !== 'SUSPENDED'));
            if (tRes?.success) setTrips(tRes.data);
        } catch (err) {
            showToast('Failed to load pricing log sheets.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Fuel form changes
    const handleFuelField = (key) => (e) => {
        setFuelForm(prev => ({ ...prev, [key]: e.target.value }));
        if (formErrors[key]) {
            setFormErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    // Expense form changes
    const handleExpenseField = (key) => (e) => {
        setExpenseForm(prev => ({ ...prev, [key]: e.target.value }));
        if (formErrors[key]) {
            setFormErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validateFuelForm = () => {
        const errors = {};
        if (!fuelForm.vehicleId) errors.vehicleId = 'Please select a vehicle';
        if (!fuelForm.driverId) errors.driverId = 'Please select a driver';
        if (!fuelForm.tripId) errors.tripId = 'Please select a trip';
        if (!fuelForm.stationName.trim()) errors.stationName = 'Station name is required';

        const litres = Number(fuelForm.litres);
        if (isNaN(litres) || litres <= 0) errors.litres = 'Must be greater than 0';

        const price = Number(fuelForm.pricePerLitre);
        if (isNaN(price) || price <= 0) errors.pricePerLitre = 'Must be greater than 0';

        const odo = Number(fuelForm.odometer);
        if (isNaN(odo) || odo < 0) {
            errors.odometer = 'Cannot be negative';
        } else {
            const vObj = vehicles.find(v => v.id === fuelForm.vehicleId);
            if (vObj && odo < Number(vObj.currentOdometer)) {
                errors.odometer = `Cannot be less than vehicle's current odometer of ${vObj.currentOdometer} km`;
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateExpenseForm = () => {
        const errors = {};
        if (!expenseForm.vehicleId) errors.vehicleId = 'Please select a vehicle';
        if (!expenseForm.category) errors.category = 'Please select a category';
        if (!expenseForm.description.trim()) errors.description = 'Description is required';

        const amount = Number(expenseForm.amount);
        if (isNaN(amount) || amount <= 0) errors.amount = 'Must be greater than 0';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateFuel = async () => {
        if (!validateFuelForm()) return;
        setSubmitLoading(true);
        try {
            const litresVal = Number(fuelForm.litres);
            const priceVal = Number(fuelForm.pricePerLitre);
            const total = litresVal * priceVal;

            const res = await fleetApi.createFuelLog({
                ...fuelForm,
                litres: litresVal.toString(),
                pricePerLitre: priceVal.toString(),
                totalCost: total.toString(),
                odometer: fuelForm.odometer.toString()
            });

            if (res.success) {
                showToast('Fuel transaction log registered successfully!', 'success');
                setFuelModalOpen(false);
                setFuelForm(EMPTY_FUEL_FORM);
                loadData();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit fuel log.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCreateExpense = async () => {
        if (!validateExpenseForm()) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.createExpense({
                ...expenseForm,
                amount: Number(expenseForm.amount).toFixed(2)
            });

            if (res.success) {
                showToast('Operational expense posted successfully!', 'success');
                setExpenseModalOpen(false);
                setExpenseForm(EMPTY_EXPENSE_FORM);
                loadData();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit expense.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteFuel = async () => {
        if (!deleteFuelTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.deleteFuelLog(deleteFuelTarget.id);
            if (res.success) {
                showToast('Fuel log transaction removed.', 'success');
                setDeleteFuelTarget(null);
                loadData();
            }
        } catch (err) {
            showToast('Failed to delete fuel log.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteExpense = async () => {
        if (!deleteExpenseTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.deleteExpense(deleteExpenseTarget.id);
            if (res.success) {
                showToast('Expense transaction voucher deleted.', 'success');
                setDeleteExpenseTarget(null);
                loadData();
            }
        } catch (err) {
            showToast('Failed to delete expense.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const openFuelModal = () => {
        setFuelForm(EMPTY_FUEL_FORM);
        setFormErrors({});
        setFuelModalOpen(true);
    };

    const openExpenseModal = () => {
        setExpenseForm(EMPTY_EXPENSE_FORM);
        setFormErrors({});
        setExpenseModalOpen(true);
    };

    // Calculate aggregated parameters
    const totalFuelCost = Number(fuelMetrics.totalCost || 0);
    const totalExpensesCost = Number(expenseMetrics.totalAmount || 0);
    const totalOperationalCost = totalFuelCost + totalExpensesCost;

    const fuelColumns = [
        { key: 'date', title: 'Fill Date', render: (r) => new Date(r.date).toLocaleDateString(), sortable: true },
        { key: 'vehicleRegistration', title: 'Vehicle', render: (r) => r.vehicle?.registrationNumber || 'Asset' },
        { key: 'tripNumber', title: 'Trip Ref', render: (r) => r.trip?.tripNumber || 'Transit' },
        { key: 'driverName', title: 'Driver', render: (r) => r.driver?.name || 'Staff' },
        { key: 'litres', title: 'Quantity', render: (r) => `${r.litres} L` },
        { key: 'pricePerLitre', title: 'Price/L', render: (r) => `₹${r.pricePerLitre}` },
        { key: 'totalCost', title: 'Total Cost', render: (r) => `₹${Number(r.totalCost).toLocaleString()}`, sortable: true },
        { key: 'stationName', title: 'Fuel Station' },
        {
            key: '_actions', title: '', render: (row) => (
                <Dropdown
                    trigger={<Button size="sm" variant="ghost" iconLeft="ri-more-2-fill" />}
                    items={[
                        { label: 'Delete Log', icon: 'ri-delete-bin-line', danger: true, onClick: () => setDeleteFuelTarget(row) }
                    ]}
                    align="right"
                />
            )
        }
    ];

    const expenseColumns = [
        { key: 'date', title: 'Post Date', render: (r) => new Date(r.createdAt).toLocaleDateString(), sortable: true },
        { key: 'vehicleRegistration', title: 'Vehicle', render: (r) => r.vehicle?.registrationNumber || 'Asset' },
        { key: 'tripNumber', title: 'Trip Ref', render: (r) => r.trip?.tripNumber || 'N/A' },
        { key: 'category', title: 'Category', sortable: true },
        { key: 'description', title: 'Voucher Note' },
        { key: 'amount', title: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString()}`, sortable: true },
        {
            key: 'receipt', title: 'Receipt Attachment', render: (r) => r.receipt ? (
                <a href={r.receipt} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--t-primary)' }}>
                    <i className="ri-attachment-line"></i> View Receipt
                </a>
            ) : <span style={{ color: 'var(--t-text-muted)' }}>No file</span>
        },
        {
            key: '_actions', title: '', render: (row) => (
                <Dropdown
                    trigger={<Button size="sm" variant="ghost" iconLeft="ri-more-2-fill" />}
                    items={[
                        { label: 'Delete Expense', icon: 'ri-delete-bin-line', danger: true, onClick: () => setDeleteExpenseTarget(row) }
                    ]}
                    align="right"
                />
            )
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Operational Cost & Expense Ledger
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: 'var(--t-space-3)' }}>
                    <Button variant="outline" iconLeft="ri-gas-station-line" onClick={openFuelModal}>
                        Log Fuel Refill
                    </Button>
                    <Button iconLeft="ri-money-dollar-circle-line" onClick={openExpenseModal}>
                        Post General Expense
                    </Button>
                </div>
            </div>

            {/* Aggregated KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--t-space-4)' }}>
                <StatCard title="Today's Fuel Refills" value="₹5,200" icon="ri-gas-station-fill" color="warning" subtitle="Estimated daily fill cost" />
                <StatCard title="Monthly Fuel Costs" value={`₹${totalFuelCost.toLocaleString()}`} icon="ri-gas-station-line" color="primary" />
                <StatCard title="Average Fuel Economy" value="12.5 km/L" icon="ri-line-chart-line" color="success" subtitle="Across commercial routes" />
                <StatCard title="Total Operational Cost" value={`₹${totalOperationalCost.toLocaleString()}`} icon="ri-wallet-3-line" color="primary" subtitle="Fuel + General Ledger" />
            </div>

            {/* List Panels */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tabs
                        tabs={[
                            { key: 'fuel', label: 'Fuel Logs', icon: 'ri-gas-station-line' },
                            { key: 'expenses', label: 'Expense Ledger', icon: 'ri-money-dollar-circle-line' },
                        ]}
                        activeTab={activeSection}
                        onChange={setActiveSection}
                    />
                </div>
                {activeSection === 'fuel' ? (
                    <DataTable
                        columns={fuelColumns}
                        data={fuelLogs}
                        selectable
                        paginated
                        pageSize={10}
                        loading={loading}
                        emptyMessage="No fuel log transactions registered yet."
                    />
                ) : (
                    <DataTable
                        columns={expenseColumns}
                        data={expenses}
                        selectable
                        paginated
                        pageSize={10}
                        loading={loading}
                        emptyMessage="No expense ledger entries registered yet."
                    />
                )}
            </Card>

            {/* Log Fuel Modal */}
            <Modal
                isOpen={fuelModalOpen}
                onClose={() => !submitLoading && setFuelModalOpen(false)}
                title="Log Fuel Transaction Record"
                size="md"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                        <Button variant="ghost" onClick={() => setFuelModalOpen(false)} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button loading={submitLoading} onClick={handleCreateFuel}>
                            Log Refill
                        </Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Select
                            label="Target Vehicle"
                            value={fuelForm.vehicleId}
                            onChange={handleFuelField('vehicleId')}
                            required
                            options={[
                                { value: '', label: 'Select asset' },
                                ...vehicles.map(v => ({ value: v.id, label: `${v.brand} ${v.model} (${v.registrationNumber})` }))
                            ]}
                            error={formErrors.vehicleId}
                        />
                        <Select
                            label="Driver On Duty"
                            value={fuelForm.driverId}
                            onChange={handleFuelField('driverId')}
                            required
                            options={[
                                { value: '', label: 'Select driver' },
                                ...drivers.map(d => ({ value: d.id, label: d.name }))
                            ]}
                            error={formErrors.driverId}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Select
                            label="Associated Dispatch Trip"
                            value={fuelForm.tripId}
                            onChange={handleFuelField('tripId')}
                            required
                            options={[
                                { value: '', label: 'Select trip assignment' },
                                ...trips.map(t => ({ value: t.id, label: `${t.tripNumber} (${t.source} → ${t.destination})` }))
                            ]}
                            error={formErrors.tripId}
                        />
                        <Input
                            label="Odometer At Refill (km)"
                            type="number"
                            placeholder="Current mileage"
                            value={fuelForm.odometer}
                            onChange={handleFuelField('odometer')}
                            required
                            error={formErrors.odometer}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Fuel Quantity (Litres)"
                            type="number"
                            placeholder="L"
                            value={fuelForm.litres}
                            onChange={handleFuelField('litres')}
                            required
                            error={formErrors.litres}
                        />
                        <Input
                            label="Price Per Litre (₹)"
                            type="number"
                            placeholder="₹/L"
                            value={fuelForm.pricePerLitre}
                            onChange={handleFuelField('pricePerLitre')}
                            required
                            error={formErrors.pricePerLitre}
                        />
                        <DatePicker
                            label="Refill Date"
                            value={fuelForm.date}
                            onChange={handleFuelField('date')}
                            required
                        />
                    </div>
                    <Input
                        label="Station Location / Vendor Name"
                        placeholder="e.g. Shell Petrol Depot, Highway 4"
                        value={fuelForm.stationName}
                        onChange={handleFuelField('stationName')}
                        required
                        error={formErrors.stationName}
                    />
                </div>
            </Modal>

            {/* Post Expense Modal */}
            <Modal
                isOpen={expenseModalOpen}
                onClose={() => !submitLoading && setExpenseModalOpen(false)}
                title="Post General Operational Expense"
                size="md"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                        <Button variant="ghost" onClick={() => setExpenseModalOpen(false)} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button loading={submitLoading} onClick={handleCreateExpense}>
                            Post Expense
                        </Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Select
                            label="Target Vehicle"
                            value={expenseForm.vehicleId}
                            onChange={handleExpenseField('vehicleId')}
                            required
                            options={[
                                { value: '', label: 'Select vehicle asset' },
                                ...vehicles.map(v => ({ value: v.id, label: `${v.brand} ${v.model} (${v.registrationNumber})` }))
                            ]}
                            error={formErrors.vehicleId}
                        />
                        <Select
                            label="Associated Dispatch Trip (Optional)"
                            value={expenseForm.tripId}
                            onChange={handleExpenseField('tripId')}
                            options={[
                                { value: '', label: 'Select trip' },
                                ...trips.map(t => ({ value: t.id, label: t.tripNumber }))
                            ]}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Select
                            label="Expense Category"
                            value={expenseForm.category}
                            onChange={handleExpenseField('category')}
                            options={EXPENSE_CATEGORIES}
                        />
                        <Input
                            label="Voucher Amount (₹)"
                            type="number"
                            placeholder="₹"
                            value={expenseForm.amount}
                            onChange={handleExpenseField('amount')}
                            required
                            error={formErrors.amount}
                        />
                    </div>
                    <Input
                        label="Brief Description / Reason"
                        placeholder="e.g. National Highway Toll fee"
                        value={expenseForm.description}
                        onChange={handleExpenseField('description')}
                        required
                        error={formErrors.description}
                    />
                    <Input
                        label="Receipt Attachment URL (Optional)"
                        placeholder="e.g. https://storage.transitops.com/receipts/01.pdf"
                        value={expenseForm.receipt}
                        onChange={handleExpenseField('receipt')}
                    />
                </div>
            </Modal>

            {/* Confirm Actions */}
            <ConfirmDialog
                isOpen={!!deleteFuelTarget}
                onClose={() => setDeleteFuelTarget(null)}
                onConfirm={handleDeleteFuel}
                title="Delete Fuel Record"
                message="Are you sure you want to permanently delete this fuel log transaction?"
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={submitLoading}
            />

            <ConfirmDialog
                isOpen={!!deleteExpenseTarget}
                onClose={() => setDeleteExpenseTarget(null)}
                onConfirm={handleDeleteExpense}
                title="Delete Expense Record"
                message="Are you sure you want to permanently delete this expense ledger voucher?"
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={submitLoading}
            />

        </div>
    );
};

export default FuelExpensesPage;
