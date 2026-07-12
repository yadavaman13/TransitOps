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

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Drivers' }];

const STATUS_VARIANTS = {
    AVAILABLE: 'success',
    ON_TRIP: 'primary',
    ON_LEAVE: 'warning',
    SUSPENDED: 'danger',
};

const EMPTY_DRIVER_FORM = {
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseCategory: 'Heavy Motor Vehicle (HMV)',
    licenseExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    experienceYears: '3',
    emergencyContact: '',
    bloodGroup: 'O+',
};

const DriversPage = () => {
    const { showToast } = useToast();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Modal & Form state
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [formData, setFormData] = useState(EMPTY_DRIVER_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    // Delete / Action targets
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [suspendTarget, setSuspendTarget] = useState(null);
    const [activateTarget, setActivateTarget] = useState(null);

    // Details Drawer target
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [drawerTab, setDrawerTab] = useState('profile');
    const [drawerData, setDrawerData] = useState({ trips: [] });
    const [drawerLoading, setDrawerLoading] = useState(false);

    const loadDrivers = async () => {
        setLoading(true);
        try {
            const res = await fleetApi.listDrivers();
            if (res?.success) {
                setDrivers(res.data);
            }
        } catch (err) {
            showToast('Failed to retrieve driver listings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    const handleFieldChange = (key) => (e) => {
        setFormData(prev => ({ ...prev, [key]: e.target.value }));
        if (formErrors[key]) {
            setFormErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Full Name is required';
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            errors.phone = 'Phone number must be a 10-digit number';
        }

        if (!formData.licenseNumber.trim()) {
            errors.licenseNumber = 'License Number is required';
        } else if (formData.licenseNumber.trim().length < 5) {
            errors.licenseNumber = 'License Number must be at least 5 characters';
        }

        const exp = Number(formData.experienceYears);
        if (isNaN(exp) || exp < 0) {
            errors.experienceYears = 'Experience must be a positive integer';
        }

        if (!formData.emergencyContact.trim()) {
            errors.emergencyContact = 'Emergency Contact is required';
        } else if (!/^[0-9]{10}$/.test(formData.emergencyContact)) {
            errors.emergencyContact = 'Emergency Contact must be a valid 10-digit number';
        }

        const expiry = new Date(formData.licenseExpiry);
        if (expiry <= new Date()) {
            errors.licenseExpiry = 'License is expired and cannot be registered';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showToast('Please correct the validation errors.', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = {
                ...formData,
                experienceYears: Number(formData.experienceYears),
            };

            let res;
            if (editTarget) {
                res = await fleetApi.updateDriver(editTarget.id, payload);
            } else {
                res = await fleetApi.registerDriver(payload);
            }

            if (res.success) {
                showToast(`Driver ${editTarget ? 'updated' : 'registered'} successfully!`, 'success');
                if (res.data?.credentials) {
                    setCreatedCredentials(res.data.credentials);
                } else {
                    setModalOpen(false);
                }
                loadDrivers();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to complete registration.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.deleteDriver(deleteTarget.id);
            if (res.success) {
                showToast('Driver deleted from system successfully.', 'success');
                setDeleteTarget(null);
                loadDrivers();
                if (selectedDriver?.id === deleteTarget.id) {
                    setDrawerOpen(false);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Cannot delete driver currently assigned to active trip workflows.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!suspendTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.suspendDriver(suspendTarget.id);
            if (res.success) {
                showToast('Driver suspended from active vehicle dispatch pools.', 'success');
                setSuspendTarget(null);
                loadDrivers();
                if (selectedDriver?.id === suspendTarget.id) {
                    setSelectedDriver(prev => ({ ...prev, availabilityStatus: 'SUSPENDED' }));
                }
            }
        } catch (err) {
            showToast('Failed to suspend driver.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleActivate = async () => {
        if (!activateTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.activateDriver(activateTarget.id);
            if (res.success) {
                showToast('Driver status restored back to Available.', 'success');
                setActivateTarget(null);
                loadDrivers();
                if (selectedDriver?.id === activateTarget.id) {
                    setSelectedDriver(prev => ({ ...prev, availabilityStatus: 'AVAILABLE' }));
                }
            }
        } catch (err) {
            showToast('Failed to activate driver.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const openCreate = () => {
        setEditTarget(null);
        setFormData(EMPTY_DRIVER_FORM);
        setFormErrors({});
        setCreatedCredentials(null);
        setModalOpen(true);
    };

    const openEdit = (driver) => {
        setEditTarget(driver);
        setFormData({
            name: driver.name,
            email: driver.email,
            phone: driver.phone || '',
            licenseNumber: driver.licenseNumber || '',
            licenseCategory: driver.licenseCategory || 'Heavy Motor Vehicle (HMV)',
            licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
            experienceYears: driver.experienceYears?.toString() || '3',
            emergencyContact: driver.emergencyContact || '',
            bloodGroup: driver.bloodGroup || 'O+',
        });
        setFormErrors({});
        setCreatedCredentials(null);
        setModalOpen(true);
    };

    const openDetailsDrawer = async (driver) => {
        setSelectedDriver(driver);
        setDrawerTab('profile');
        setDrawerOpen(true);
        setDrawerLoading(true);
        try {
            const res = await fleetApi.getDriverTrips(driver.id);
            if (res?.success) {
                setDrawerData({ trips: res.data });
            }
        } catch (err) {
            showToast('Failed to query driver trips.', 'error');
        } finally {
            setDrawerLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(d => {
        const query = search.toLowerCase();
        const matchesSearch = !search ||
            d.name.toLowerCase().includes(query) ||
            d.email.toLowerCase().includes(query) ||
            (d.phone && d.phone.includes(search)) ||
            (d.licenseNumber && d.licenseNumber.toLowerCase().includes(query));
        const matchesStatus = !filterStatus || d.availabilityStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        { key: 'name', title: 'Driver Name', sortable: true },
        { key: 'licenseNumber', title: 'License No.' },
        { key: 'licenseExpiry', title: 'License Expiry', render: (row) => new Date(row.licenseExpiry).toLocaleDateString(), sortable: true },
        { key: 'phone', title: 'Phone Number' },
        { key: 'safetyScore', title: 'Safety Score', render: (row) => `${Number(row.safetyScore).toFixed(0)}/100`, sortable: true },
        {
            key: 'availabilityStatus', title: 'Status', render: (row) => (
                <Badge variant={STATUS_VARIANTS[row.availabilityStatus] || 'neutral'}>
                    {row.availabilityStatus}
                </Badge>
            )
        },
        {
            key: '_actions', title: '', render: (row) => {
                const dropdownItems = [
                    { label: 'View Details', icon: 'ri-eye-line', onClick: () => openDetailsDrawer(row) },
                    { label: 'Edit Profile', icon: 'ri-pencil-line', onClick: () => openEdit(row) },
                    row.availabilityStatus !== 'SUSPENDED'
                        ? { label: 'Suspend Driver', icon: 'ri-alert-line', onClick: () => setSuspendTarget(row) }
                        : { label: 'Activate Driver', icon: 'ri-checkbox-circle-line', onClick: () => setActivateTarget(row) },
                    { label: 'Delete Profile', icon: 'ri-delete-bin-line', danger: true, onClick: () => setDeleteTarget(row) }
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

    const closeRegisterModal = () => {
        setModalOpen(false);
        setCreatedCredentials(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Company Driver Registry
                    </h1>
                </div>
                <Button iconLeft="ri-user-add-line" onClick={openCreate}>
                    Add Driver
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                    <div style={{ minWidth: '240px', flex: 1 }}>
                        <Input
                            placeholder="Search name, phone, email, license number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '180px' }}>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'AVAILABLE', label: 'Available' },
                                { value: 'ON_TRIP', label: 'On Trip' },
                                { value: 'ON_LEAVE', label: 'On Leave' },
                                { value: 'SUSPENDED', label: 'Suspended' },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card padding="none">
                <DataTable
                    columns={columns}
                    data={filteredDrivers}
                    selectable
                    paginated
                    pageSize={10}
                    loading={loading}
                    emptyMessage="No drivers matching search criteria found."
                />
            </Card>

            {/* Add / Edit Driver Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => !submitLoading && closeRegisterModal()}
                title={editTarget ? 'Edit Driver Profile' : 'Register New Driver'}
                size="lg"
                footer={
                    !createdCredentials && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                            <Button variant="ghost" onClick={closeRegisterModal} disabled={submitLoading}>
                                Cancel
                            </Button>
                            <Button loading={submitLoading} onClick={handleSubmit}>
                                {editTarget ? 'Save Changes' : 'Register Driver'}
                            </Button>
                        </div>
                    )
                }
            >
                {createdCredentials ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', padding: 'var(--t-space-3)' }}>
                        <div style={{ backgroundColor: 'var(--t-success-bg)', color: 'var(--t-success-text)', padding: 'var(--t-space-4)', borderRadius: 'var(--t-rounded-md)', display: 'flex', alignItems: 'center', gap: 'var(--t-space-3)' }}>
                            <i className="ri-checkbox-circle-fill" style={{ fontSize: '24px' }}></i>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 'var(--t-font-weight-semibold)' }}>Driver Registered Successfully</h4>
                                <p style={{ margin: 'var(--t-space-1) 0 0', fontSize: 'var(--t-font-size-caption)' }}>An email containing these temporary credentials has been dispatched.</p>
                            </div>
                        </div>
                        <div style={{ border: '1px solid var(--t-border-color)', borderRadius: 'var(--t-rounded-md)', padding: 'var(--t-space-4)', backgroundColor: 'var(--t-bg-input)' }}>
                            <h4 style={{ margin: '0 0 var(--t-space-3)', fontSize: 'var(--t-font-size-body-sm)', color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-semibold)' }}>Copy Credentials:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-2)' }}>
                                <div>
                                    <strong style={{ display: 'inline-block', width: '100px', fontSize: 'var(--t-font-size-body-sm)' }}>Email:</strong>
                                    <code style={{ fontSize: 'var(--t-font-size-body-sm)' }}>{createdCredentials.email}</code>
                                </div>
                                <div>
                                    <strong style={{ display: 'inline-block', width: '100px', fontSize: 'var(--t-font-size-body-sm)' }}>Password:</strong>
                                    <code style={{ fontSize: 'var(--t-font-size-body-sm)' }}>{createdCredentials.password}</code>
                                </div>
                            </div>
                        </div>
                        <Button style={{ marginTop: 'var(--t-space-2)' }} onClick={closeRegisterModal}>Done</Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                            <Input
                                label="Driver Full Name"
                                placeholder="e.g. Ramesh Kumar"
                                value={formData.name}
                                onChange={handleFieldChange('name')}
                                required
                                error={formErrors.name}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="ramesh@transitops.com"
                                value={formData.email}
                                onChange={handleFieldChange('email')}
                                required
                                error={formErrors.email}
                                disabled={!!editTarget}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                            <Input
                                label="Phone Number"
                                placeholder="10-digit phone"
                                value={formData.phone}
                                onChange={handleFieldChange('phone')}
                                required
                                error={formErrors.phone}
                            />
                            <Input
                                label="License Number"
                                placeholder="e.g. DL-12345678"
                                value={formData.licenseNumber}
                                onChange={handleFieldChange('licenseNumber')}
                                required
                                error={formErrors.licenseNumber}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--t-space-4)' }}>
                            <Select
                                label="License Category"
                                value={formData.licenseCategory}
                                onChange={handleFieldChange('licenseCategory')}
                                options={[
                                    { value: 'Light Motor Vehicle (LMV)', label: 'LMV (Light)' },
                                    { value: 'Heavy Motor Vehicle (HMV)', label: 'HMV (Heavy)' },
                                ]}
                            />
                            <DatePicker
                                label="License Expiry"
                                value={formData.licenseExpiry}
                                onChange={handleFieldChange('licenseExpiry')}
                                required
                                error={formErrors.licenseExpiry}
                            />
                            <Input
                                label="Experience (Years)"
                                type="number"
                                value={formData.experienceYears}
                                onChange={handleFieldChange('experienceYears')}
                                required
                                error={formErrors.experienceYears}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                            <Input
                                label="Emergency Contact (Phone)"
                                placeholder="10-digit phone"
                                value={formData.emergencyContact}
                                onChange={handleFieldChange('emergencyContact')}
                                required
                                error={formErrors.emergencyContact}
                            />
                            <Select
                                label="Blood Group"
                                value={formData.bloodGroup}
                                onChange={handleFieldChange('bloodGroup')}
                                options={[
                                    { value: 'A+', label: 'A+' },
                                    { value: 'A-', label: 'A-' },
                                    { value: 'B+', label: 'B+' },
                                    { value: 'B-', label: 'B-' },
                                    { value: 'AB+', label: 'AB+' },
                                    { value: 'AB-', label: 'AB-' },
                                    { value: 'O+', label: 'O+' },
                                    { value: 'O-', label: 'O-' },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* View Details Drawer Overlay */}
            {drawerOpen && selectedDriver && (
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
                    animation: 'slideIn 0.3s ease-out',
                    fontFamily: 'var(--t-font-family)'
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
                                {selectedDriver.name}
                            </h2>
                            <p style={{ margin: 'var(--t-space-1) 0 0', color: 'var(--t-text-muted)', fontSize: 'var(--t-font-size-body-sm)' }}>
                                {selectedDriver.email}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-2)' }}>
                            <Badge variant={STATUS_VARIANTS[selectedDriver.availabilityStatus] || 'neutral'}>
                                {selectedDriver.availabilityStatus}
                            </Badge>
                            <Button size="sm" variant="ghost" iconLeft="ri-close-line" onClick={() => setDrawerOpen(false)} />
                        </div>
                    </div>

                    {/* Drawer Tabs */}
                    <div style={{ padding: '0 var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)' }}>
                        <Tabs
                            tabs={[
                                { key: 'profile', label: 'Profile Details', icon: 'ri-user-line' },
                                { key: 'trips', label: 'Trips Assigned', icon: 'ri-route-line' },
                                { key: 'safety', label: 'Safety Index', icon: 'ri-shield-check-line' },
                                { key: 'license', label: 'License Verification', icon: 'ri-bank-card-2-line' },
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
                                {drawerTab === 'profile' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Contact Phone</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedDriver.phone || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Emergency Contact</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedDriver.emergencyContact || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Experience</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedDriver.experienceYears || '0'} Years</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Blood Group</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedDriver.bloodGroup || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>Joining Date</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>
                                                    {selectedDriver.joiningDate ? new Date(selectedDriver.joiningDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {drawerTab === 'trips' && (
                                    <DataTable
                                        columns={[
                                            { key: 'tripNumber', title: 'Trip No' },
                                            { key: 'source', title: 'Source' },
                                            { key: 'destination', title: 'Destination' },
                                            { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'COMPLETED' ? 'success' : 'neutral'}>{r.status}</Badge> }
                                        ]}
                                        data={drawerData.trips}
                                        paginated
                                        pageSize={5}
                                        emptyMessage="No trip assignment history found."
                                    />
                                )}

                                {drawerTab === 'safety' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                                        <div style={{ backgroundColor: 'var(--t-bg-app)', padding: 'var(--t-space-5)', borderRadius: 'var(--t-rounded-md)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)', marginBottom: 'var(--t-space-2)' }}>Safety Index Rating</div>
                                            <div style={{ fontSize: '32px', fontWeight: 'var(--t-font-weight-bold)', color: Number(selectedDriver.safetyScore) >= 80 ? 'var(--t-success-text)' : 'var(--t-warning)' }}>
                                                {Number(selectedDriver.safetyScore).toFixed(0)}/100
                                            </div>
                                            <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)', marginTop: 'var(--t-space-1)' }}>Calculated dynamically based on overspeeding/braking logs.</div>
                                        </div>
                                    </div>
                                )}

                                {drawerTab === 'license' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                                        {new Date(selectedDriver.licenseExpiry) <= new Date() && (
                                            <div style={{ backgroundColor: 'var(--t-danger-bg)', color: 'var(--t-danger-dark)', padding: 'var(--t-space-4)', borderRadius: 'var(--t-rounded-md)', display: 'flex', alignItems: 'center', gap: 'var(--t-space-3)' }}>
                                                <i className="ri-error-warning-fill" style={{ fontSize: '20px' }}></i>
                                                <div>
                                                    <h4 style={{ margin: 0, fontWeight: 'var(--t-font-weight-semibold)' }}>Driving License Expired!</h4>
                                                    <p style={{ margin: 0, fontSize: 'var(--t-font-size-caption)' }}>This driver must update their credentials before being assigned new trips.</p>
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>License Number</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedDriver.licenseNumber || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>License Category</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>{selectedDriver.licenseCategory || 'Heavy Motor Vehicle (HMV)'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>License Expiry Date</div>
                                                <div style={{ fontWeight: 'var(--t-font-weight-medium)', color: 'var(--t-text-main)' }}>
                                                    {selectedDriver.licenseExpiry ? new Date(selectedDriver.licenseExpiry).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Confirm Actions Dialog */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Driver Profile"
                message={`Are you sure you want to delete the driver registry of "${deleteTarget?.name}"?`}
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={submitLoading}
            />

            <ConfirmDialog
                isOpen={!!suspendTarget}
                onClose={() => setSuspendTarget(null)}
                onConfirm={handleSuspend}
                title="Suspend Driver Profile"
                message={`Are you sure you want to suspend "${suspendTarget?.name}"? Suspended drivers cannot be selected for active trip assignments.`}
                confirmLabel="Suspend"
                confirmVariant="danger"
                loading={submitLoading}
            />

            <ConfirmDialog
                isOpen={!!activateTarget}
                onClose={() => setActivateTarget(null)}
                onConfirm={handleActivate}
                title="Activate Driver Profile"
                message={`Restore active status for "${activateTarget?.name}"?`}
                confirmLabel="Activate"
                confirmVariant="success"
                loading={submitLoading}
            />

        </div>
    );
};

export default DriversPage;
