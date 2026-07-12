import React, { useState, useEffect } from 'react';
import {
    Card,
    Badge,
    DataTable,
    Breadcrumb,
    Button,
    Modal,
    Input,
    DatePicker,
    ConfirmDialog,
    useToast
} from '../../template';
import * as safetyApi from '../service/safety.api';

const BREADCRUMBS = [{ label: 'Home', href: '/safety-officer' }, { label: 'Drivers' }];

const SafetyDriversPage = () => {
    const [loading, setLoading] = useState(true);
    const [drivers, setDrivers] = useState([]);
    const { addToast } = useToast();

    // Modals state
    const [scoreModal, setScoreModal] = useState({ open: false, driver: null, value: '' });
    const [licenseModal, setLicenseModal] = useState({ open: false, driver: null, number: '', expiry: '' });
    const [suspendDialog, setSuspendDialog] = useState({ open: false, driver: null });
    const [activateDialog, setActivateDialog] = useState({ open: false, driver: null });

    const loadDrivers = async () => {
        try {
            setLoading(true);
            const data = await safetyApi.getDrivers();
            setDrivers(data || []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            addToast({
                title: 'Error loading drivers',
                message: error.response?.data?.message || 'Could not fetch drivers list.',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    const handleUpdateScoreSubmit = async (e) => {
        e.preventDefault();
        const score = parseFloat(scoreModal.value);
        if (isNaN(score) || score < 0 || score > 100) {
            addToast({
                title: 'Invalid input',
                message: 'Safety score must be between 0 and 100.',
                variant: 'warning'
            });
            return;
        }

        try {
            await safetyApi.updateDriverSafetyScore(scoreModal.driver.id, score);
            addToast({
                title: 'Safety Score Updated',
                message: `Safety score for ${scoreModal.driver.name} is now ${score}%.`,
                variant: 'success'
            });
            setScoreModal({ open: false, driver: null, value: '' });
            loadDrivers();
        } catch (error) {
            addToast({
                title: 'Failed to update score',
                message: error.response?.data?.message || 'An error occurred.',
                variant: 'danger'
            });
        }
    };

    const handleUpdateLicenseSubmit = async (e) => {
        e.preventDefault();
        if (!licenseModal.number.trim()) {
            addToast({
                title: 'Invalid input',
                message: 'License number is required.',
                variant: 'warning'
            });
            return;
        }
        if (!licenseModal.expiry) {
            addToast({
                title: 'Invalid input',
                message: 'License expiry date is required.',
                variant: 'warning'
            });
            return;
        }

        const selectedDate = new Date(licenseModal.expiry);
        if (isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
            addToast({
                title: 'Invalid expiry date',
                message: 'License expiry date must be a valid future date.',
                variant: 'warning'
            });
            return;
        }

        try {
            await safetyApi.updateDriverLicense(licenseModal.driver.id, {
                licenseNumber: licenseModal.number,
                licenseExpiry: new Date(licenseModal.expiry).toISOString(),
            });
            addToast({
                title: 'License Info Updated',
                message: `License details updated successfully for ${licenseModal.driver.name}.`,
                variant: 'success'
            });
            setLicenseModal({ open: false, driver: null, number: '', expiry: '' });
            loadDrivers();
        } catch (error) {
            addToast({
                title: 'Failed to update license',
                message: error.response?.data?.message || 'An error occurred.',
                variant: 'danger'
            });
        }
    };

    const handleSuspendConfirm = async () => {
        try {
            await safetyApi.suspendDriver(suspendDialog.driver.id);
            addToast({
                title: 'Driver Suspended',
                message: `${suspendDialog.driver.name} has been suspended from service.`,
                variant: 'success'
            });
            setSuspendDialog({ open: false, driver: null });
            loadDrivers();
        } catch (error) {
            addToast({
                title: 'Action failed',
                message: error.response?.data?.message || 'Could not suspend driver.',
                variant: 'danger'
            });
        }
    };

    const handleActivateConfirm = async () => {
        try {
            await safetyApi.activateDriver(activateDialog.driver.id);
            addToast({
                title: 'Driver Activated',
                message: `${activateDialog.driver.name} is now active and available for trips.`,
                variant: 'success'
            });
            setActivateDialog({ open: false, driver: null });
            loadDrivers();
        } catch (error) {
            addToast({
                title: 'Action failed',
                message: error.response?.data?.message || 'Could not activate driver.',
                variant: 'danger'
            });
        }
    };

    const columns = [
        { key: 'name', title: 'Driver Name', sortable: true },
        { key: 'email', title: 'Email Address' },
        { key: 'phone', title: 'Phone Number' },
        { key: 'licenseNumber', title: 'License Number' },
        {
            key: 'licenseExpiry',
            title: 'License Expiry',
            sortable: true,
            render: (row) => {
                const isExpired = new Date(row.licenseExpiry) < new Date();
                return (
                    <span style={{ color: isExpired ? 'var(--t-danger)' : 'inherit', fontWeight: isExpired ? 'bold' : 'normal' }}>
                        {new Date(row.licenseExpiry).toLocaleDateString()} {isExpired && ' (Expired)'}
                    </span>
                );
            }
        },
        {
            key: 'safetyScore',
            title: 'Safety Score',
            sortable: true,
            render: (row) => {
                const score = parseFloat(row.safetyScore);
                const variant = score >= 90 ? 'success' : score >= 80 ? 'warning' : 'danger';
                return <Badge variant={variant}>{score}%</Badge>;
            }
        },
        {
            key: 'availabilityStatus',
            title: 'Status',
            render: (row) => {
                const status = row.availabilityStatus;
                const variant = status === 'AVAILABLE' ? 'success' : status === 'SUSPENDED' ? 'danger' : 'neutral';
                return <Badge variant={variant}>{status}</Badge>;
            }
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: 'var(--t-space-2)' }}>
                    <Button
                        size="sm"
                        variant="secondary"
                        title="Update Safety Score"
                        onClick={() => setScoreModal({ open: true, driver: row, value: row.safetyScore })}
                    >
                        <i className="ri-shield-flash-line"></i> Score
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        title="Update License"
                        onClick={() => setLicenseModal({
                            open: true,
                            driver: row,
                            number: row.licenseNumber || '',
                            expiry: row.licenseExpiry ? row.licenseExpiry.substring(0, 10) : ''
                        })}
                    >
                        <i className="ri-key-line"></i> License
                    </Button>
                    {row.availabilityStatus === 'SUSPENDED' ? (
                        <Button
                            size="sm"
                            variant="success"
                            title="Reactivate Driver"
                            onClick={() => setActivateDialog({ open: true, driver: row })}
                        >
                            <i className="ri-user-shared-line"></i> Activate
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="danger"
                            title="Suspend Driver"
                            onClick={() => setSuspendDialog({ open: true, driver: row })}
                        >
                            <i className="ri-user-unfollow-line"></i> Suspend
                        </Button>
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--t-text-muted)' }}>
                <i className="ri-loader-4-line ri-spin" style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}></i>
                <span>Loading Drivers Compliance List...</span>
            </div>
        );
    }

    return (
        <div className="t-dash-page">
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                    <h1 className="t-dash-page__heading">Driver Safety Compliance</h1>
                    <p className="t-dash-page__subtitle">View and audit driver credentials, license expirations, safety ratings, and availability status.</p>
                </div>
            </div>

            <Card padding="none">
                <DataTable
                    columns={columns}
                    data={drivers}
                    searchable
                    paginated
                    pageSize={10}
                />
            </Card>

            {/* Modal: Update Safety Score */}
            <Modal
                open={scoreModal.open}
                onClose={() => setScoreModal({ open: false, driver: null, value: '' })}
                title={`Update Safety Score — ${scoreModal.driver?.name}`}
            >
                <form onSubmit={handleUpdateScoreSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', padding: 'var(--t-space-4)' }}>
                        <Input
                            label="New Safety Score (%)"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            required
                            value={scoreModal.value}
                            onChange={(e) => setScoreModal(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Enter score (0 - 100)"
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                            <Button variant="secondary" type="button" onClick={() => setScoreModal({ open: false, driver: null, value: '' })}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Score
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Modal: Update License Details */}
            <Modal
                open={licenseModal.open}
                onClose={() => setLicenseModal({ open: false, driver: null, number: '', expiry: '' })}
                title={`Update License Info — ${licenseModal.driver?.name}`}
            >
                <form onSubmit={handleUpdateLicenseSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', padding: 'var(--t-space-4)' }}>
                        <Input
                            label="License Number"
                            type="text"
                            required
                            value={licenseModal.number}
                            onChange={(e) => setLicenseModal(prev => ({ ...prev, number: e.target.value }))}
                            placeholder="Enter license number"
                        />
                        <DatePicker
                            label="License Expiry Date"
                            required
                            value={licenseModal.expiry}
                            onChange={(val) => setLicenseModal(prev => ({ ...prev, expiry: val }))}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                            <Button variant="secondary" type="button" onClick={() => setLicenseModal({ open: false, driver: null, number: '', expiry: '' })}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Update License
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Confirm Dialog: Suspend Driver */}
            <ConfirmDialog
                open={suspendDialog.open}
                onClose={() => setSuspendDialog({ open: false, driver: null })}
                onConfirm={handleSuspendConfirm}
                title="Suspend Driver?"
                message={`Are you sure you want to suspend driver ${suspendDialog.driver?.name}? Suspended drivers cannot be assigned to any future transit trips.`}
                confirmText="Suspend Driver"
                variant="danger"
            />

            {/* Confirm Dialog: Reactivate Driver */}
            <ConfirmDialog
                open={activateDialog.open}
                onClose={() => setActivateDialog({ open: false, driver: null })}
                onConfirm={handleActivateConfirm}
                title="Reactivate Driver?"
                message={`Are you sure you want to reactivate driver ${activateDialog.driver?.name}? This will restore their status to AVAILABLE.`}
                confirmText="Reactivate"
                variant="success"
            />
        </div>
    );
};

export default SafetyDriversPage;
