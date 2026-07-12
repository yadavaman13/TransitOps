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

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Maintenance' }];

const STATUS_VARIANTS = {
    PENDING: 'warning',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'neutral',
};

const MAINTENANCE_TYPES = [
    { value: 'Repair', label: 'Repair' },
    { value: 'Oil Change', label: 'Oil Change' },
    { value: 'Tyres', label: 'Tyres' },
    { value: 'Insurance', label: 'Insurance Compliance' },
    { value: 'General Service', label: 'General Service' },
];

const EMPTY_MAINTENANCE_FORM = {
    vehicleId: '',
    title: '',
    maintenanceType: 'General Service',
    serviceCenter: '',
    cost: '0.00',
    scheduledDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'PENDING'
};

const MaintenancePage = () => {
    const { showToast } = useToast();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Available vehicles list
    const [vehicles, setVehicles] = useState([]);

    // Modal & Form State
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [formData, setFormData] = useState(EMPTY_MAINTENANCE_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    // Confirm dialog targets
    const [closeTarget, setCloseTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const loadMaintenance = async () => {
        setLoading(true);
        try {
            const res = await fleetApi.listMaintenance();
            if (res?.success) {
                setRecords(res.data);
            }
        } catch (err) {
            showToast('Failed to load maintenance logs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadVehicles = async () => {
        try {
            const res = await fleetApi.listVehicles();
            if (res?.success) {
                // Filter out retired vehicles
                setVehicles(res.data.filter(v => v.status !== 'RETIRED'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadMaintenance();
        loadVehicles();
    }, []);

    const handleFieldChange = (key) => (e) => {
        setFormData(prev => ({ ...prev, [key]: e.target.value }));
        if (formErrors[key]) {
            setFormErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title / Service Description is required';
        if (!formData.vehicleId) errors.vehicleId = 'Please select a vehicle';
        if (!formData.serviceCenter.trim()) errors.serviceCenter = 'Garage / Service Center is required';
        
        const cost = Number(formData.cost);
        if (isNaN(cost) || cost < 0) {
            errors.cost = 'Cost must be a positive number';
        }

        if (!formData.scheduledDate) {
            errors.scheduledDate = 'Scheduled Date is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showToast('Please correct form errors.', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = {
                ...formData,
                cost: Number(formData.cost).toFixed(2),
            };

            let res;
            if (editTarget) {
                res = await fleetApi.updateMaintenance(editTarget.id, payload);
            } else {
                res = await fleetApi.createMaintenance(payload);
            }

            if (res.success) {
                showToast(`Maintenance record ${editTarget ? 'updated' : 'scheduled'} successfully!`, 'success');
                setCreateModalOpen(false);
                loadMaintenance();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit maintenance form.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCloseMaintenance = async () => {
        if (!closeTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.closeMaintenance(closeTarget.id);
            if (res.success) {
                showToast(`Maintenance ticket for ${closeTarget.vehicle?.registrationNumber || 'Vehicle'} closed. Vehicle is now AVAILABLE.`, 'success');
                setCloseTarget(null);
                loadMaintenance();
            }
        } catch (err) {
            showToast('Failed to close maintenance.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancelMaintenance = async () => {
        if (!cancelTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.cancelMaintenance(cancelTarget.id);
            if (res.success) {
                showToast(`Maintenance ticket for ${cancelTarget.vehicle?.registrationNumber || 'Vehicle'} cancelled. Vehicle status returned to AVAILABLE.`, 'success');
                setCancelTarget(null);
                loadMaintenance();
            }
        } catch (err) {
            showToast('Failed to cancel maintenance.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const openCreate = () => {
        setEditTarget(null);
        setFormData(EMPTY_MAINTENANCE_FORM);
        setFormErrors({});
        setCreateModalOpen(true);
    };

    const openEdit = (record) => {
        setEditTarget(record);
        setFormData({
            vehicleId: record.vehicleId,
            title: record.title,
            maintenanceType: record.maintenanceType,
            serviceCenter: record.serviceCenter || '',
            cost: record.cost,
            scheduledDate: new Date(record.scheduledDate).toISOString().split('T')[0],
            description: record.description || '',
            status: record.status
        });
        setFormErrors({});
        setCreateModalOpen(true);
    };

    const countByStatus = (status) => records.filter(r => r.status === status).length;

    const filteredRecords = records.filter(r => {
        if (activeTab === 'all') return true;
        return r.status === activeTab.toUpperCase();
    });

    const columns = [
        { key: 'vehicleRegistration', title: 'Vehicle', render: (row) => row.vehicle?.registrationNumber || 'Asset' },
        { key: 'title', title: 'Title / Action', sortable: true },
        { key: 'maintenanceType', title: 'Category' },
        { key: 'serviceCenter', title: 'Garage' },
        { key: 'cost', title: 'Cost', render: (row) => `₹${row.cost}`, sortable: true },
        { key: 'scheduledDate', title: 'Scheduled', render: (row) => new Date(row.scheduledDate).toLocaleDateString(), sortable: true },
        {
            key: 'status', title: 'Status', render: (row) => (
                <Badge variant={STATUS_VARIANTS[row.status] || 'neutral'}>
                    {row.status}
                </Badge>
            )
        },
        {
            key: '_actions', title: '', render: (row) => {
                const isTerminal = row.status === 'COMPLETED' || row.status === 'CANCELLED';
                const dropdownItems = [];

                if (!isTerminal) {
                    dropdownItems.push({ label: 'Edit Service', icon: 'ri-pencil-line', onClick: () => openEdit(row) });
                    dropdownItems.push({ label: 'Close & Complete', icon: 'ri-checkbox-circle-line', onClick: () => setCloseTarget(row) });
                    dropdownItems.push({ label: 'Cancel Schedule', icon: 'ri-close-circle-line', danger: true, onClick: () => setCancelTarget(row) });
                } else {
                    dropdownItems.push({ label: 'No Actions Available', icon: 'ri-prohibited-line', disabled: true });
                }

                return (
                    <Dropdown
                        trigger={<Button size="sm" variant="ghost" iconLeft="ri-more-2-fill" />}
                        items={dropdownItems}
                        align="right"
                    />
                );
            }
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Maintenance Schedules
                    </h1>
                </div>
                <Button iconLeft="ri-add-line" onClick={openCreate}>
                    Schedule Maintenance
                </Button>
            </div>

            {/* Quick KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--t-space-4)' }}>
                <StatCard title="Pending Tickets" value={countByStatus('PENDING')} icon="ri-calendar-todo-line" color="warning" />
                <StatCard title="Active In-Progress" value={countByStatus('IN_PROGRESS')} icon="ri-settings-4-line" color="primary" />
                <StatCard title="Completed Tickets" value={countByStatus('COMPLETED')} icon="ri-checkbox-circle-line" color="success" />
                <StatCard title="Cancelled Tickets" value={countByStatus('CANCELLED')} icon="ri-close-circle-line" color="neutral" />
            </div>

            {/* Table and Tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)' }}>
                    <Tabs
                        tabs={[
                            { key: 'all', label: 'All Records', icon: 'ri-list-check' },
                            { key: 'pending', label: 'Pending', icon: 'ri-calendar-todo-line' },
                            { key: 'in_progress', label: 'In Progress', icon: 'ri-settings-4-line' },
                            { key: 'completed', label: 'Completed', icon: 'ri-checkbox-circle-line' },
                            { key: 'cancelled', label: 'Cancelled', icon: 'ri-close-circle-line' },
                        ]}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
                <DataTable
                    columns={columns}
                    data={filteredRecords}
                    selectable
                    paginated
                    pageSize={10}
                    loading={loading}
                    emptyMessage="No maintenance service tickets found."
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => !submitLoading && setCreateModalOpen(false)}
                title={editTarget ? 'Edit Service Ticket' : 'Schedule Maintenance Action'}
                size="md"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                        <Button variant="ghost" onClick={() => setCreateModalOpen(false)} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button loading={submitLoading} onClick={handleSubmit}>
                            {editTarget ? 'Save Changes' : 'Schedule Service'}
                        </Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Select
                            label="Target Vehicle"
                            value={formData.vehicleId}
                            onChange={handleFieldChange('vehicleId')}
                            required
                            options={[
                                { value: '', label: 'Select vehicle asset' },
                                ...vehicles.map(v => ({ value: v.id, label: `${v.brand} ${v.model} (${v.registrationNumber})` }))
                            ]}
                            error={formErrors.vehicleId}
                            disabled={editTarget && formData.status === 'IN_PROGRESS'}
                        />
                        <Select
                            label="Service Type / Category"
                            value={formData.maintenanceType}
                            onChange={handleFieldChange('maintenanceType')}
                            options={MAINTENANCE_TYPES}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Service Description / Title"
                            placeholder="e.g. Engine noise check"
                            value={formData.title}
                            onChange={handleFieldChange('title')}
                            required
                            error={formErrors.title}
                        />
                        <Select
                            label="Current Ticket Status"
                            value={formData.status}
                            onChange={handleFieldChange('status')}
                            options={[
                                { value: 'PENDING', label: 'Pending / Scheduled' },
                                { value: 'IN_PROGRESS', label: 'Active In-Progress' }
                            ]}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Garage / Service Center Name"
                            placeholder="e.g. Apex Auto Center"
                            value={formData.serviceCenter}
                            onChange={handleFieldChange('serviceCenter')}
                            required
                            error={formErrors.serviceCenter}
                        />
                        <Input
                            label="Estimated / Final Cost"
                            type="number"
                            placeholder="₹ cost"
                            value={formData.cost}
                            onChange={handleFieldChange('cost')}
                            required
                            error={formErrors.cost}
                        />
                    </div>
                    <DatePicker
                        label="Scheduled Target Date"
                        value={formData.scheduledDate}
                        onChange={handleFieldChange('scheduledDate')}
                        required
                        error={formErrors.scheduledDate}
                    />
                    <Input
                        label="Detailed Inspection Notes"
                        placeholder="Inspect items / instructions..."
                        value={formData.description}
                        onChange={handleFieldChange('description')}
                    />
                </div>
            </Modal>

            {/* Confirm Actions */}
            <ConfirmDialog
                isOpen={!!closeTarget}
                onClose={() => setCloseTarget(null)}
                onConfirm={handleCloseMaintenance}
                title="Close & Complete Service Ticket"
                message={`Complete maintenance ticket for vehicle "${closeTarget?.vehicle?.registrationNumber || 'Asset'}"? This action records costs and sets the vehicle status back to AVAILABLE.`}
                confirmLabel="Complete Service"
                confirmVariant="success"
                loading={submitLoading}
            />

            <ConfirmDialog
                isOpen={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={handleCancelMaintenance}
                title="Cancel Service Ticket"
                message={`Cancel maintenance ticket for "${cancelTarget?.vehicle?.registrationNumber || 'Asset'}"? Vehicle status will be returned back to AVAILABLE.`}
                confirmLabel="Cancel Ticket"
                confirmVariant="danger"
                loading={submitLoading}
            />

        </div>
    );
};

export default MaintenancePage;
