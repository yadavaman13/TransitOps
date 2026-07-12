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
    useToast
} from '../../template';
import '../../template/styles/index.scss';
import * as fleetApi from '../service/fleet.api';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Trips' }];

const STATUS_VARIANTS = {
    DRAFT: 'neutral',
    DISPATCHED: 'info',
    STARTED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger',
};

const EMPTY_TRIP_FORM = {
    vehicleId: '',
    driverId: '',
    source: '',
    destination: '',
    cargoName: '',
    cargoWeight: '',
    distanceKm: '',
    plannedStart: new Date().toISOString().split('T')[0],
    plannedEnd: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
    remarks: '',
};

const TripsPage = () => {
    const { showToast } = useToast();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Available resources lists
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);

    // Modal & Form State
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState(EMPTY_TRIP_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    // Timeline Modal State
    const [timelineModalOpen, setTimelineModalOpen] = useState(false);
    const [timelineTrip, setTimelineTrip] = useState(null);
    const [timelineEvents, setTimelineEvents] = useState(null);

    // Complete Trip Modal State
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [completeTripTarget, setCompleteTripTarget] = useState(null);
    const [completeData, setCompleteData] = useState({
        actualDistance: '',
        actualEnd: new Date().toISOString().split('T')[0],
        remarks: ''
    });
    const [completeFormErrors, setCompleteFormErrors] = useState({});

    // Cancel Confirm State
    const [cancelTarget, setCancelTarget] = useState(null);

    const loadTrips = async () => {
        setLoading(true);
        try {
            const res = await fleetApi.listTrips();
            if (res?.success) {
                setTrips(res.data);
            }
        } catch (err) {
            showToast('Failed to load trips log.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableResources = async () => {
        try {
            const [vRes, dRes] = await Promise.all([
                fleetApi.getAvailableVehicles(),
                fleetApi.getAvailableDrivers()
            ]);
            if (vRes?.success) setAvailableVehicles(vRes.data);
            if (dRes?.success) setAvailableDrivers(dRes.data);
        } catch (err) {
            console.error('Failed to query available resources.', err);
        }
    };

    useEffect(() => {
        loadTrips();
    }, []);

    useEffect(() => {
        if (createModalOpen) {
            loadAvailableResources();
        }
    }, [createModalOpen]);

    const handleFieldChange = (key) => (e) => {
        setFormData(prev => ({ ...prev, [key]: e.target.value }));
        if (formErrors[key]) {
            setFormErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.source.trim()) errors.source = 'Source location is required';
        if (!formData.destination.trim()) errors.destination = 'Destination is required';
        if (!formData.cargoName.trim()) errors.cargoName = 'Cargo name is required';
        if (!formData.vehicleId) errors.vehicleId = 'Please select a vehicle';
        if (!formData.driverId) errors.driverId = 'Please select a driver';

        const weight = Number(formData.cargoWeight);
        if (isNaN(weight) || weight <= 0) {
            errors.cargoWeight = 'Weight must be greater than 0';
        } else {
            const selectedVehicleObj = availableVehicles.find(v => v.id === formData.vehicleId);
            if (selectedVehicleObj && weight > Number(selectedVehicleObj.capacityKg)) {
                errors.cargoWeight = `Cargo weight exceeds vehicle capacity of ${selectedVehicleObj.capacityKg} kg`;
            }
        }

        const dist = Number(formData.distanceKm);
        if (isNaN(dist) || dist <= 0) {
            errors.distanceKm = 'Distance must be greater than 0';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateTrip = async () => {
        if (!validateForm()) {
            showToast('Please correct validation errors.', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            const res = await fleetApi.createTrip({
                ...formData,
                cargoWeight: formData.cargoWeight.toString(),
                distanceKm: formData.distanceKm.toString()
            });

            if (res.success) {
                showToast('Trip schedule created in DRAFT successfully!', 'success');
                setCreateModalOpen(false);
                setFormData(EMPTY_TRIP_FORM);
                loadTrips();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to schedule trip.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDispatch = async (trip) => {
        try {
            const res = await fleetApi.dispatchTrip(trip.id);
            if (res.success) {
                showToast(`Trip ${trip.tripNumber} dispatched successfully!`, 'success');
                loadTrips();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to dispatch trip.';
            showToast(msg, 'error');
        }
    };

    const handleStartTrip = async (trip) => {
        try {
            const res = await fleetApi.startTrip(trip.id);
            if (res.success) {
                showToast(`Trip ${trip.tripNumber} is now running (STARTED).`, 'success');
                loadTrips();
            }
        } catch (err) {
            showToast('Failed to start trip.', 'error');
        }
    };

    const openCompleteModal = (trip) => {
        setCompleteTripTarget(trip);
        setCompleteData({
            actualDistance: trip.distanceKm,
            actualEnd: new Date().toISOString().split('T')[0],
            remarks: ''
        });
        setCompleteFormErrors({});
        setCompleteModalOpen(true);
    };

    const handleCompleteTrip = async () => {
        const errors = {};
        const dist = Number(completeData.actualDistance);
        if (isNaN(dist) || dist <= 0) {
            errors.actualDistance = 'Actual distance must be greater than 0';
        }

        if (Object.keys(errors).length > 0) {
            setCompleteFormErrors(errors);
            return;
        }

        setSubmitLoading(true);
        try {
            const res = await fleetApi.completeTrip(completeTripTarget.id, {
                actualDistance: completeData.actualDistance.toString(),
                actualEnd: new Date(completeData.actualEnd),
                remarks: completeData.remarks
            });

            if (res.success) {
                showToast(`Trip ${completeTripTarget.tripNumber} completed successfully! Odometer and availability statuses updated.`, 'success');
                setCompleteModalOpen(false);
                loadTrips();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to complete trip.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancelTrip = async () => {
        if (!cancelTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.cancelTrip(cancelTarget.id);
            if (res.success) {
                showToast(`Trip ${cancelTarget.tripNumber} cancelled successfully.`, 'success');
                setCancelTarget(null);
                loadTrips();
            }
        } catch (err) {
            showToast('Failed to cancel trip.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const openTimeline = async (trip) => {
        setTimelineTrip(trip);
        setTimelineModalOpen(true);
        setTimelineEvents(null);
        try {
            const res = await fleetApi.getTripTimeline(trip.id);
            if (res?.success) {
                setTimelineEvents(res.data);
            }
        } catch (err) {
            showToast('Failed to fetch timeline details.', 'error');
        }
    };

    // Calculate metrics counts
    const countByStatus = (status) => trips.filter(t => t.status === status).length;

    const filteredTrips = trips.filter(t => {
        if (activeTab === 'all') return true;
        return t.status === activeTab.toUpperCase();
    });

    const columns = [
        { key: 'tripNumber', title: 'Trip Number', sortable: true },
        { key: 'vehicleRegistration', title: 'Vehicle', render: (row) => row.vehicle?.registrationNumber || 'Assigned' },
        { key: 'driverName', title: 'Driver', render: (row) => row.driver?.name || 'Assigned' },
        { key: 'source', title: 'Source' },
        { key: 'destination', title: 'Destination' },
        { key: 'cargoName', title: 'Cargo' },
        { key: 'distanceKm', title: 'Planned Dist.', render: (row) => `${row.distanceKm} km` },
        {
            key: 'status', title: 'Status', render: (row) => (
                <Badge variant={STATUS_VARIANTS[row.status] || 'neutral'}>
                    {row.status}
                </Badge>
            )
        },
        {
            key: '_actions', title: 'Actions', render: (row) => (
                <div style={{ display: 'flex', gap: 'var(--t-space-2)' }}>
                    <Button size="sm" variant="ghost" iconLeft="ri-history-line" onClick={() => openTimeline(row)}>
                        Timeline
                    </Button>
                    
                    {row.status === 'DRAFT' && (
                        <>
                            <Button size="sm" onClick={() => handleDispatch(row)}>
                                Dispatch
                            </Button>
                            <Button size="sm" variant="outline" iconLeft="ri-close-circle-line" onClick={() => setCancelTarget(row)}>
                                Cancel
                            </Button>
                        </>
                    )}

                    {row.status === 'DISPATCHED' && (
                        <>
                            <Button size="sm" variant="primary" onClick={() => handleStartTrip(row)}>
                                Start
                            </Button>
                            <Button size="sm" variant="outline" iconLeft="ri-close-circle-line" onClick={() => setCancelTarget(row)}>
                                Cancel
                            </Button>
                        </>
                    )}

                    {row.status === 'STARTED' && (
                        <>
                            <Button size="sm" variant="success" onClick={() => openCompleteModal(row)}>
                                Complete
                            </Button>
                            <Button size="sm" variant="outline" iconLeft="ri-close-circle-line" onClick={() => setCancelTarget(row)}>
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    // Running Trips for Dispatch Board
    const runningTrips = trips.filter(t => t.status === 'STARTED' || t.status === 'DISPATCHED');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Trip Dispatch Control Board
                    </h1>
                </div>
                <Button iconLeft="ri-send-plane-line" onClick={() => setCreateModalOpen(true)}>
                    Schedule Trip
                </Button>
            </div>

            {/* Quick KPI stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--t-space-4)' }}>
                <StatCard title="Draft Tasks" value={countByStatus('DRAFT')} icon="ri-file-edit-line" color="primary" />
                <StatCard title="Dispatched Pool" value={countByStatus('DISPATCHED')} icon="ri-ship-line" color="info" />
                <StatCard title="In-Transit Running" value={countByStatus('STARTED')} icon="ri-roadster-line" color="primary" />
                <StatCard title="Completed Runs" value={countByStatus('COMPLETED')} icon="ri-checkbox-circle-line" color="success" />
                <StatCard title="Cancelled Trips" value={countByStatus('CANCELLED')} icon="ri-close-circle-line" color="danger" />
            </div>

            {/* Live Dispatch Board */}
            {runningTrips.length > 0 && (
                <Card>
                    <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        📡 Live Dispatch Monitor
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--t-space-4)' }}>
                        {runningTrips.map(t => (
                            <Card key={t.id} style={{ border: '1px solid var(--t-border-strong)', backgroundColor: 'var(--t-bg-input)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--t-space-3)' }}>
                                    <span style={{ fontWeight: 'var(--t-font-weight-bold)', color: 'var(--t-primary)' }}>{t.tripNumber}</span>
                                    <Badge variant={STATUS_VARIANTS[t.status]}>{t.status}</Badge>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-2)', fontSize: 'var(--t-font-size-body-sm)' }}>
                                    <div>
                                        <i className="ri-map-pin-2-line" style={{ marginRight: '8px', color: 'var(--t-primary)' }}></i>
                                        <strong>Route:</strong> {t.source} → {t.destination}
                                    </div>
                                    <div>
                                        <i className="ri-steering-line" style={{ marginRight: '8px', color: 'var(--t-text-muted)' }}></i>
                                        <strong>Driver:</strong> {t.driver?.name || 'Assigned'}
                                    </div>
                                    <div>
                                        <i className="ri-bus-line" style={{ marginRight: '8px', color: 'var(--t-text-muted)' }}></i>
                                        <strong>Vehicle:</strong> {t.vehicle?.registrationNumber || 'Assigned'}
                                    </div>
                                    <div>
                                        <i className="ri-time-line" style={{ marginRight: '8px', color: 'var(--t-text-muted)' }}></i>
                                        <strong>ETA / Planned End:</strong> {new Date(t.plannedEnd).toLocaleString()}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}

            {/* List and Tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)' }}>
                    <Tabs
                        tabs={[
                            { key: 'all', label: 'All Scheduled', icon: 'ri-list-check' },
                            { key: 'draft', label: 'Draft', icon: 'ri-file-edit-line' },
                            { key: 'dispatched', label: 'Dispatched', icon: 'ri-ship-line' },
                            { key: 'started', label: 'Running', icon: 'ri-roadster-line' },
                            { key: 'completed', label: 'Completed', icon: 'ri-checkbox-circle-line' },
                            { key: 'cancelled', label: 'Cancelled', icon: 'ri-close-circle-line' },
                        ]}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
                <DataTable
                    columns={columns}
                    data={filteredTrips}
                    selectable
                    paginated
                    pageSize={10}
                    loading={loading}
                    emptyMessage="No scheduled trips found matching filter status."
                />
            </Card>

            {/* Create Trip Form Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => !submitLoading && setCreateModalOpen(false)}
                title="Schedule Transportation Route"
                size="lg"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                        <Button variant="ghost" onClick={() => setCreateModalOpen(false)} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button loading={submitLoading} onClick={handleCreateTrip}>
                            Plan Trip (Draft)
                        </Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Source Depot"
                            placeholder="Starting location"
                            value={formData.source}
                            onChange={handleFieldChange('source')}
                            required
                            error={formErrors.source}
                        />
                        <Input
                            label="Destination Location"
                            placeholder="Drop location"
                            value={formData.destination}
                            onChange={handleFieldChange('destination')}
                            required
                            error={formErrors.destination}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Select
                            label="Assign Vehicle (Available)"
                            value={formData.vehicleId}
                            onChange={handleFieldChange('vehicleId')}
                            required
                            options={[
                                { value: '', label: 'Select available asset' },
                                ...availableVehicles.map(v => ({ value: v.id, label: `${v.brand} ${v.model} (${v.registrationNumber} - Max: ${v.capacityKg} kg)` }))
                            ]}
                            error={formErrors.vehicleId}
                        />
                        <Select
                            label="Assign Driver (Available)"
                            value={formData.driverId}
                            onChange={handleFieldChange('driverId')}
                            required
                            options={[
                                { value: '', label: 'Select available driver' },
                                ...availableDrivers.map(d => ({ value: d.id, label: `${d.name} (${d.licenseNumber})` }))
                            ]}
                            error={formErrors.driverId}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Cargo Name"
                            placeholder="e.g. Industrial pipes"
                            value={formData.cargoName}
                            onChange={handleFieldChange('cargoName')}
                            required
                            error={formErrors.cargoName}
                        />
                        <Input
                            label="Cargo Weight (kg)"
                            type="number"
                            placeholder="Weight"
                            value={formData.cargoWeight}
                            onChange={handleFieldChange('cargoWeight')}
                            required
                            error={formErrors.cargoWeight}
                        />
                        <Input
                            label="Distance (km)"
                            type="number"
                            placeholder="Total distance"
                            value={formData.distanceKm}
                            onChange={handleFieldChange('distanceKm')}
                            required
                            error={formErrors.distanceKm}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <DatePicker
                            label="Planned Start Time"
                            value={formData.plannedStart}
                            onChange={handleFieldChange('plannedStart')}
                            required
                        />
                        <DatePicker
                            label="Estimated End Time"
                            value={formData.plannedEnd}
                            onChange={handleFieldChange('plannedEnd')}
                            required
                        />
                    </div>
                    <Input
                        label="Remarks / Transit notes"
                        placeholder="Any instruction guidelines..."
                        value={formData.remarks}
                        onChange={handleFieldChange('remarks')}
                    />
                </div>
            </Modal>

            {/* Complete Trip Modal */}
            <Modal
                isOpen={completeModalOpen}
                onClose={() => setCompleteModalOpen(false)}
                title={`Log Trip Completion — ${completeTripTarget?.tripNumber}`}
                size="md"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                        <Button variant="ghost" onClick={() => setCompleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button loading={submitLoading} onClick={handleCompleteTrip} variant="success">
                            Close & Complete Trip
                        </Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                    <p style={{ margin: 0, fontSize: 'var(--t-font-size-body-sm)', color: 'var(--t-text-muted)' }}>
                        Input the final distance traveled by driver to synchronize vehicle odometer:
                    </p>
                    <Input
                        label="Actual Distance Traveled (km)"
                        type="number"
                        value={completeData.actualDistance}
                        onChange={(e) => setCompleteData(prev => ({ ...prev, actualDistance: e.target.value }))}
                        required
                        error={completeFormErrors.actualDistance}
                    />
                    <DatePicker
                        label="Actual Completion Date"
                        value={completeData.actualEnd}
                        onChange={(e) => setCompleteData(prev => ({ ...prev, actualEnd: e.target.value }))}
                        required
                    />
                    <Input
                        label="Closing Remarks"
                        placeholder="Log any incidents or notes..."
                        value={completeData.remarks}
                        onChange={(e) => setCompleteData(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                </div>
            </Modal>

            {/* View Timeline Modal */}
            <Modal
                isOpen={timelineModalOpen}
                onClose={() => setTimelineModalOpen(false)}
                title={`Trip Execution Timeline — ${timelineTrip?.tripNumber}`}
                size="md"
            >
                {timelineTrip && (
                    <div style={{ padding: 'var(--t-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', position: 'relative', paddingLeft: 'var(--t-space-6)' }}>
                            <div style={{
                                position: 'absolute',
                                top: '8px', left: '7px', bottom: '8px',
                                width: '2px',
                                backgroundColor: 'var(--t-border-color)'
                            }} />

                            {/* Stage 1: Created */}
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '-29px', top: '2px',
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    backgroundColor: 'var(--t-success)', border: '2px solid white'
                                }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: 'var(--t-font-size-body-sm)', color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-semibold)' }}>Created (DRAFT)</h4>
                                    <p style={{ margin: '2px 0 0', fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Trip scheduled successfully.</p>
                                </div>
                            </div>

                            {/* Stage 2: Dispatched */}
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '-29px', top: '2px',
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    backgroundColor: ['DISPATCHED', 'STARTED', 'COMPLETED'].includes(timelineTrip.status) ? 'var(--t-success)' : 'var(--t-border-strong)',
                                    border: '2px solid white'
                                }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: 'var(--t-font-size-body-sm)', color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-semibold)' }}>Dispatched</h4>
                                    <p style={{ margin: '2px 0 0', fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>
                                        {['DISPATCHED', 'STARTED', 'COMPLETED'].includes(timelineTrip.status) ? 'Resources assigned & locked.' : 'Awaiting dispatch confirmation.'}
                                    </p>
                                </div>
                            </div>

                            {/* Stage 3: Started */}
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '-29px', top: '2px',
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    backgroundColor: ['STARTED', 'COMPLETED'].includes(timelineTrip.status) ? 'var(--t-success)' : 'var(--t-border-strong)',
                                    border: '2px solid white'
                                }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: 'var(--t-font-size-body-sm)', color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-semibold)' }}>In-Transit (STARTED)</h4>
                                    <p style={{ margin: '2px 0 0', fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>
                                        {['STARTED', 'COMPLETED'].includes(timelineTrip.status) ? 'Driver transit in progress.' : 'Awaiting transit start.'}
                                    </p>
                                </div>
                            </div>

                            {/* Stage 4: Completed */}
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '-29px', top: '2px',
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    backgroundColor: timelineTrip.status === 'COMPLETED' ? 'var(--t-success)' : 'var(--t-border-strong)',
                                    border: '2px solid white'
                                }} />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: 'var(--t-font-size-body-sm)', color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-semibold)' }}>Completed</h4>
                                    <p style={{ margin: '2px 0 0', fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>
                                        {timelineTrip.status === 'COMPLETED' ? `Arrived successfully. Final mileage logged.` : 'Pending arrival.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cost & logs associated with timeline */}
                        {timelineEvents && (
                            <div style={{ borderTop: '1px solid var(--t-border-color)', paddingTop: 'var(--t-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--t-space-3)' }}>
                                <h4 style={{ margin: 0, fontSize: 'var(--t-font-size-body-sm)', fontWeight: 'var(--t-font-weight-semibold)' }}>Expenses Posted During Trip</h4>
                                {timelineEvents.expenses?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-2)' }}>
                                        {timelineEvents.expenses.map(e => (
                                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--t-font-size-caption)' }}>
                                                <span>{e.category}: {e.description || 'Log'}</span>
                                                <span style={{ fontWeight: 'var(--t-font-weight-semibold)' }}>₹{e.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>No additional expense files recorded.</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Cancel Trip Confirm */}
            <ConfirmDialog
                isOpen={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={handleCancelTrip}
                title="Cancel Transportation Trip"
                message={`Are you sure you want to cancel trip assignment "${cancelTarget?.tripNumber}"? This will return the assigned driver and vehicle back to the available pool.`}
                confirmLabel="Cancel Trip"
                confirmVariant="danger"
                loading={submitLoading}
            />

        </div>
    );
};

export default TripsPage;
