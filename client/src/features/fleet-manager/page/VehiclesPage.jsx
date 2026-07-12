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

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Vehicles' }];

const FUEL_TYPES = [
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Petrol', label: 'Petrol' },
    { value: 'CNG', label: 'CNG' },
    { value: 'EV', label: 'EV' },
];

const STATUS_VARIANTS = {
    AVAILABLE: 'success',
    ON_TRIP: 'primary',
    MAINTENANCE: 'warning',
    RETIRED: 'neutral',
};

const EMPTY_VEHICLE_FORM = {
    registrationNumber: '',
    vehicleNumber: '',
    brand: '',
    model: '',
    manufactureYear: new Date().getFullYear(),
    capacityKg: '',
    fuelType: 'Diesel',
    currentOdometer: '0',
    purchaseDate: new Date().toISOString().split('T')[0],
    insuranceExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    pollutionExpiry: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0],
};

const VehiclesPage = () => {
    const { showToast } = useToast();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFuel, setFilterFuel] = useState('');

    // Modal & Action states
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [formData, setFormData] = useState(EMPTY_VEHICLE_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    // Delete & Status confirm targets
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [retireTarget, setRetireTarget] = useState(null);
    const [restoreTarget, setRestoreTarget] = useState(null);

    // Details Drawer states
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [drawerTab, setDrawerTab] = useState('overview');
    const [drawerData, setDrawerData] = useState({
        trips: [],
        fuelLogs: [],
        maintenance: [],
        expenses: []
    });
    const [drawerLoading, setDrawerLoading] = useState(false);

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const res = await fleetApi.listVehicles();
            if (res?.success) {
                setVehicles(res.data);
            }
        } catch (err) {
            showToast('Failed to load fleet vehicles.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
        if (!formData.registrationNumber.trim()) errors.registrationNumber = 'Registration Number is required';
        if (!formData.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle Number (e.g. Asset ID) is required';
        if (!formData.brand.trim()) errors.brand = 'Brand is required';
        if (!formData.model.trim()) errors.model = 'Model is required';
        
        const year = Number(formData.manufactureYear);
        if (isNaN(year) || year < 1900 || year > 2100) {
            errors.manufactureYear = 'Manufacture year must be between 1900 and 2100';
        }

        const capacity = Number(formData.capacityKg);
        if (isNaN(capacity) || capacity <= 0) {
            errors.capacityKg = 'Capacity must be greater than 0';
        }

        const odometer = Number(formData.currentOdometer);
        if (isNaN(odometer) || odometer < 0) {
            errors.currentOdometer = 'Odometer reading cannot be negative';
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
            const dataToSubmit = {
                ...formData,
                manufactureYear: Number(formData.manufactureYear),
                capacityKg: formData.capacityKg.toString(),
                currentOdometer: formData.currentOdometer.toString(),
            };

            let res;
            if (editTarget) {
                res = await fleetApi.updateVehicle(editTarget.id, dataToSubmit);
            } else {
                res = await fleetApi.registerVehicle(dataToSubmit);
            }

            if (res.success) {
                showToast(`Vehicle ${editTarget ? 'updated' : 'registered'} successfully!`, 'success');
                setModalOpen(false);
                loadVehicles();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error occurred during processing.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.deleteVehicle(deleteTarget.id);
            if (res.success) {
                showToast('Vehicle asset deleted successfully.', 'success');
                setDeleteTarget(null);
                loadVehicles();
                if (selectedVehicle?.id === deleteTarget.id) {
                    setDrawerOpen(false);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Cannot delete vehicle with active schedules.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleRetire = async () => {
        if (!retireTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.retireVehicle(retireTarget.id);
            if (res.success) {
                showToast('Vehicle retired from active transport dispatch pools.', 'success');
                setRetireTarget(null);
                loadVehicles();
                if (selectedVehicle?.id === retireTarget.id) {
                    setSelectedVehicle(prev => ({ ...prev, status: 'RETIRED' }));
                }
            }
        } catch (err) {
            showToast('Failed to retire vehicle.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!restoreTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.restoreVehicle(restoreTarget.id);
            if (res.success) {
                showToast('Vehicle restored back to active service.', 'success');
                setRestoreTarget(null);
                loadVehicles();
                if (selectedVehicle?.id === restoreTarget.id) {
                    setSelectedVehicle(prev => ({ ...prev, status: 'AVAILABLE' }));
                }
            }
        } catch (err) {
            showToast('Failed to restore vehicle.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const openCreate = () => {
        setEditTarget(null);
        setFormData(EMPTY_VEHICLE_FORM);
        setFormErrors({});
        setModalOpen(true);
    };

    const openEdit = (vehicle) => {
        setEditTarget(vehicle);
        setFormData({
            registrationNumber: vehicle.registrationNumber,
            vehicleNumber: vehicle.vehicleNumber,
            brand: vehicle.brand,
            model: vehicle.model,
            manufactureYear: vehicle.manufactureYear,
            capacityKg: vehicle.capacityKg,
            fuelType: vehicle.fuelType,
            currentOdometer: vehicle.currentOdometer,
            purchaseDate: new Date(vehicle.purchaseDate).toISOString().split('T')[0],
            insuranceExpiry: new Date(vehicle.insuranceExpiry).toISOString().split('T')[0],
            pollutionExpiry: new Date(vehicle.pollutionExpiry).toISOString().split('T')[0],
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const openDetailsDrawer = async (vehicle) => {
        setSelectedVehicle(vehicle);
        setDrawerTab('overview');
        setDrawerOpen(true);
        setDrawerLoading(true);
        try {
            const [tRes, fRes, mRes, eRes] = await Promise.all([
                fleetApi.getVehicleTrips(vehicle.id),
                fleetApi.getVehicleFuelLogs(vehicle.id),
                fleetApi.getVehicleMaintenance(vehicle.id),
                fleetApi.getVehicleExpenses(vehicle.id)
            ]);

            setDrawerData({
                trips: tRes?.success ? tRes.data : [],
                fuelLogs: fRes?.success ? fRes.data : [],
                maintenance: mRes?.success ? mRes.data : [],
                expenses: eRes?.success ? eRes.data : []
            });
        } catch (err) {
            showToast('Failed to query drawer details.', 'error');
        } finally {
            setDrawerLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const query = search.toLowerCase();
        const matchesSearch = !search ||
            v.registrationNumber.toLowerCase().includes(query) ||
            v.brand.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            v.vehicleNumber.toLowerCase().includes(query);
        const matchesStatus = !filterStatus || v.status === filterStatus;
        const matchesFuel = !filterFuel || v.fuelType === filterFuel;
        return matchesSearch && matchesStatus && matchesFuel;
    });

    const columns = [
        { key: 'registrationNumber', title: 'Reg. Number', sortable: true },
        { key: 'name', title: 'Vehicle Name', render: (row) => `${row.brand} ${row.model}`, sortable: true },
        { key: 'vehicleNumber', title: 'Asset Code' },
        { key: 'capacityKg', title: 'Capacity', render: (row) => `${row.capacityKg} kg`, sortable: true },
        { key: 'fuelType', title: 'Fuel Type' },
        { key: 'currentOdometer', title: 'Odometer', render: (row) => `${Number(row.currentOdometer).toLocaleString()} km`, sortable: true },
        {
            key: 'status', title: 'Status', render: (row) => (
                <Badge variant={STATUS_VARIANTS[row.status] || 'neutral'}>
                    {row.status}
                </Badge>
            )
        },
        {
            key: '_actions', title: '', render: (row) => {
                const dropdownItems = [
                    { label: 'View Details', icon: 'ri-eye-line', onClick: () => openDetailsDrawer(row) },
                    { label: 'Edit Asset', icon: 'ri-pencil-line', onClick: () => openEdit(row) },
                    row.status !== 'RETIRED'
                        ? { label: 'Retire Vehicle', icon: 'ri-archive-line', onClick: () => setRetireTarget(row) }
                        : { label: 'Restore Vehicle', icon: 'ri-checkbox-circle-line', onClick: () => setRestoreTarget(row) },
                    { label: 'Delete Asset', icon: 'ri-delete-bin-line', danger: true, onClick: () => setDeleteTarget(row) }
                ];
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
                        Vehicle Fleet Registry
                    </h1>
                </div>
                <Button iconLeft="ri-add-line" onClick={openCreate}>
                    Add Vehicle
                </Button>
            </div>

            {/* Table filters */}
            <Card>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                    <div style={{ minWidth: '240px', flex: 1 }}>
                        <Input
                            placeholder="Search registration, brand, model..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'AVAILABLE', label: 'Available' },
                                { value: 'ON_TRIP', label: 'On Trip' },
                                { value: 'MAINTENANCE', label: 'Maintenance' },
                                { value: 'RETIRED', label: 'Retired' },
                            ]}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <Select
                            value={filterFuel}
                            onChange={(e) => setFilterFuel(e.target.value)}
                            options={[
                                { value: '', label: 'All Fuels' },
                                ...FUEL_TYPES
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Fleet Table */}
            <Card padding="none">
                <DataTable
                    columns={columns}
                    data={filteredVehicles}
                    selectable
                    paginated
                    pageSize={10}
                    loading={loading}
                    emptyMessage="No vehicles matching criteria found."
                />
            </Card>

            {/* Add / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => !submitLoading && setModalOpen(false)}
                title={editTarget ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
                size="lg"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                        <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button loading={submitLoading} onClick={handleSubmit}>
                            {editTarget ? 'Save changes' : 'Register Asset'}
                        </Button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Registration Number"
                            placeholder="e.g. MH-12-AB-1234"
                            value={formData.registrationNumber}
                            onChange={handleFieldChange('registrationNumber')}
                            required
                            error={formErrors.registrationNumber}
                        />
                        <Input
                            label="Asset Code / ID"
                            placeholder="e.g. TRK-01"
                            value={formData.vehicleNumber}
                            onChange={handleFieldChange('vehicleNumber')}
                            required
                            error={formErrors.vehicleNumber}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Manufacturer Brand"
                            placeholder="e.g. Tata"
                            value={formData.brand}
                            onChange={handleFieldChange('brand')}
                            required
                            error={formErrors.brand}
                        />
                        <Input
                            label="Model Name"
                            placeholder="e.g. Starbus"
                            value={formData.model}
                            onChange={handleFieldChange('model')}
                            required
                            error={formErrors.model}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Manufacture Year"
                            type="number"
                            placeholder="e.g. 2024"
                            value={formData.manufactureYear}
                            onChange={handleFieldChange('manufactureYear')}
                            required
                            error={formErrors.manufactureYear}
                        />
                        <Input
                            label="Cargo Capacity (kg)"
                            type="number"
                            placeholder="e.g. 5000"
                            value={formData.capacityKg}
                            onChange={handleFieldChange('capacityKg')}
                            required
                            error={formErrors.capacityKg}
                        />
                        <Select
                            label="Fuel Classification"
                            value={formData.fuelType}
                            onChange={handleFieldChange('fuelType')}
                            options={FUEL_TYPES}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Current Odometer (km)"
                            type="number"
                            placeholder="Odometer reading"
                            value={formData.currentOdometer}
                            onChange={handleFieldChange('currentOdometer')}
                            required
                            error={formErrors.currentOdometer}
                        />
                        <DatePicker
                            label="Purchase Date"
                            value={formData.purchaseDate}
                            onChange={handleFieldChange('purchaseDate')}
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                        <DatePicker
                            label="Insurance Expiry Date"
                            value={formData.insuranceExpiry}
                            onChange={handleFieldChange('insuranceExpiry')}
                            required
                        />
                        <DatePicker
                            label="Pollution (PUCC) Expiry Date"
                            value={formData.pollutionExpiry}
                            onChange={handleFieldChange('pollutionExpiry')}
                            required
                        />
                    </div>
                </div>
            </Modal>

            {/* View Details Drawer Overlay */}
            {drawerOpen && selectedVehicle && (
                <div style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0,
                    width: 'min(600px, 100vw)',
                    backgroundColor: 'var(--t-bg-sidebar)',
                    boxShadow: 'var(--t-shadow-lg)',
                    zIndex: 99,
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: '1px solid var(--t-border-color)',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}</style>
                    
                    {/* Drawer Header */}
                    <div style={{ padding: 'var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                                {selectedVehicle.brand} {selectedVehicle.model}
                            </h2>
                            <p style={{ margin: 'var(--t-space-1) 0 0', color: 'var(--t-text-muted)', fontSize: 'var(--t-font-size-body-sm)' }}>
                                {selectedVehicle.registrationNumber} (ID: {selectedVehicle.vehicleNumber})
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-2)' }}>
                            <Badge variant={STATUS_VARIANTS[selectedVehicle.status] || 'neutral'}>
                                {selectedVehicle.status}
                            </Badge>
                            <Button size="sm" variant="ghost" iconLeft="ri-close-line" onClick={() => setDrawerOpen(false)} />
                        </div>
                    </div>

                    {/* Drawer Sub-Tabs selector */}
                    <div style={{ padding: '0 var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)' }}>
                        <Tabs
                            tabs={[
                                { key: 'overview', label: 'Overview', icon: 'ri-file-info-line' },
                                { key: 'trips', label: 'Trip History', icon: 'ri-route-line' },
                                { key: 'fuel', label: 'Fuel Logs', icon: 'ri-gas-station-line' },
                                { key: 'maintenance', label: 'Maintenance', icon: 'ri-tools-line' },
                                { key: 'expenses', label: 'Expenses', icon: 'ri-money-dollar-circle-line' },
                            ]}
                            activeTab={drawerTab}
                            onChange={setDrawerTab}
                        />
                    </div>

                    {/* Drawer Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--t-space-5)' }}>
                        {drawerLoading ? (
                            <div style={{ textAlign: 'center', padding: 'var(--t-space-8)', color: 'var(--t-text-muted)' }}>
                                Loading details logs...
                            </div>
                        ) : (
                            <>
                                {drawerTab === 'overview' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Manufacture Year</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedVehicle.manufactureYear}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Fuel Classification</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedVehicle.fuelType}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Load Capacity Limit</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedVehicle.capacityKg} kg</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Current Odometer</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{Number(selectedVehicle.currentOdometer).toLocaleString()} km</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Purchase Date</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{new Date(selectedVehicle.purchaseDate).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <hr style={{ border: 0, borderTop: '1px solid var(--t-border-color)', margin: 'var(--t-space-2) 0' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-3)' }}>
                                            <h4 style={{ margin: 0, fontSize: 'var(--t-font-size-body-sm)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>Compliance & Certifications</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Insurance Expiry:</span>
                                                <span style={{ fontWeight: 'var(--t-font-weight-medium)', color: new Date(selectedVehicle.insuranceExpiry) <= new Date() ? 'var(--t-danger-dark)' : 'var(--t-text-main)' }}>
                                                    {new Date(selectedVehicle.insuranceExpiry).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Pollution Certificate Expiry:</span>
                                                <span style={{ fontWeight: 'var(--t-font-weight-medium)', color: new Date(selectedVehicle.pollutionExpiry) <= new Date() ? 'var(--t-danger-dark)' : 'var(--t-text-main)' }}>
                                                    {new Date(selectedVehicle.pollutionExpiry).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {drawerTab === 'trips' && (
                                    <DataTable
                                        columns={[
                                            { key: 'tripNumber', title: 'Trip No' },
                                            { key: 'destination', title: 'Destination' },
                                            { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'COMPLETED' ? 'success' : 'neutral'}>{r.status}</Badge> }
                                        ]}
                                        data={drawerData.trips}
                                        paginated
                                        pageSize={5}
                                        emptyMessage="No trip assignment history found."
                                    />
                                )}

                                {drawerTab === 'fuel' && (
                                    <DataTable
                                        columns={[
                                            { key: 'date', title: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
                                            { key: 'litres', title: 'Litres', render: (r) => `${r.litres} L` },
                                            { key: 'totalCost', title: 'Cost', render: (r) => `₹${r.totalCost}` }
                                        ]}
                                        data={drawerData.fuelLogs}
                                        paginated
                                        pageSize={5}
                                        emptyMessage="No fuel log activities recorded."
                                    />
                                )}

                                {drawerTab === 'maintenance' && (
                                    <DataTable
                                        columns={[
                                            { key: 'scheduledDate', title: 'Date', render: (r) => new Date(r.scheduledDate).toLocaleDateString() },
                                            { key: 'maintenanceType', title: 'Service' },
                                            { key: 'cost', title: 'Cost', render: (r) => `₹${r.cost}` },
                                            { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'}>{r.status}</Badge> }
                                        ]}
                                        data={drawerData.maintenance}
                                        paginated
                                        pageSize={5}
                                        emptyMessage="No maintenance histories scheduled."
                                    />
                                )}

                                {drawerTab === 'expenses' && (
                                    <DataTable
                                        columns={[
                                            { key: 'createdAt', title: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
                                            { key: 'category', title: 'Category' },
                                            { key: 'amount', title: 'Amount', render: (r) => `₹${r.amount}` }
                                        ]}
                                        data={drawerData.expenses}
                                        paginated
                                        pageSize={5}
                                        emptyMessage="No expense files posted."
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Confirm Dialogs */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Asset Profile"
                message={`Are you sure you want to delete vehicle registry "${deleteTarget?.brand} ${deleteTarget?.model}"? This action is permanent.`}
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={submitLoading}
            />

            <ConfirmDialog
                isOpen={!!retireTarget}
                onClose={() => setRetireTarget(null)}
                onConfirm={handleRetire}
                title="Retire Fleet Asset"
                message={`Are you sure you want to retire "${retireTarget?.brand} ${retireTarget?.model}"? Retired assets are excluded from active trip dispatcher scheduling pools.`}
                confirmLabel="Retire"
                confirmVariant="danger"
                loading={submitLoading}
            />

            <ConfirmDialog
                isOpen={!!restoreTarget}
                onClose={() => setRestoreTarget(null)}
                onConfirm={handleRestore}
                title="Restore Retired Asset"
                message={`Restore "${restoreTarget?.brand} ${restoreTarget?.model}" back to active duty?`}
                confirmLabel="Restore"
                confirmVariant="success"
                loading={submitLoading}
            />

        </div>
    );
};

export default VehiclesPage;
