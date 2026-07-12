import React, { useState, useEffect } from 'react';
import {
    Card,
    Badge,
    DataTable,
    Breadcrumb,
    Button,
    Modal,
    Input,
    Select,
    ConfirmDialog,
    Dropdown,
    useToast
} from '../../template';
import '../../template/styles/index.scss';
import * as fleetApi from '../service/fleet.api';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Users Management' }];

const ROLE_LABELS = {
    FLEET_MANAGER: 'Fleet Manager',
    DRIVER: 'Driver',
    SAFETY_OFFICER: 'Safety Officer',
    FINANCIAL_ANALYST: 'Financial Analyst',
};

const ROLE_VARIANTS = {
    FLEET_MANAGER: 'primary',
    DRIVER: 'info',
    SAFETY_OFFICER: 'warning',
    FINANCIAL_ANALYST: 'success',
};

const UsersPage = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');

    // Modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'SAFETY_OFFICER' });
    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    // Delete target
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await fleetApi.listUsers();
            if (res?.success) {
                setUsers(res.data.users || []);
            }
        } catch (err) {
            showToast('Failed to load user accounts list.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreateUser = async () => {
        const errors = {};
        if (!newUserData.name.trim()) errors.name = 'Name is required';
        if (!newUserData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setSubmitLoading(true);
        setFormErrors({});
        try {
            let res;
            if (newUserData.role === 'SAFETY_OFFICER') {
                res = await fleetApi.createSafetyOfficer({ name: newUserData.name, email: newUserData.email });
            } else {
                res = await fleetApi.createFinancialAnalyst({ name: newUserData.name, email: newUserData.email });
            }

            if (res.success) {
                showToast(`${ROLE_LABELS[newUserData.role]} registered successfully!`, 'success');
                setCreatedCredentials(res.data.credentials);
                loadUsers();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to register account.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteTarget) return;
        setSubmitLoading(true);
        try {
            const res = await fleetApi.deleteUser(deleteTarget.id);
            if (res.success) {
                showToast('User account deleted successfully.', 'success');
                setDeleteTarget(null);
                loadUsers();
            }
        } catch (err) {
            showToast('Failed to delete user account.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const closeCreateModal = () => {
        setCreateModalOpen(false);
        setCreatedCredentials(null);
        setNewUserData({ name: '', email: '', role: 'SAFETY_OFFICER' });
        setFormErrors({});
    };

    const filteredUsers = users.filter(u => {
        const query = search.toLowerCase();
        const matchesSearch = !search ||
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.phone && u.phone.includes(search));
        const matchesRole = !filterRole || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const columns = [
        { key: 'name', title: 'Name', sortable: true },
        {
            key: 'role', title: 'Role', render: (row) => (
                <Badge variant={ROLE_VARIANTS[row.role] || 'neutral'}>
                    {ROLE_LABELS[row.role] || row.role}
                </Badge>
            ),
            sortable: true
        },
        { key: 'email', title: 'Email Address', sortable: true },
        { key: 'phone', title: 'Phone Number', render: (row) => row.phone || 'N/A' },
        {
            key: '_actions', title: '', render: (row) => {
                // Prevent self-deletion
                const isSelf = row.role === 'FLEET_MANAGER';
                return (
                    <Dropdown
                        trigger={<Button size="sm" variant="ghost" iconLeft="ri-more-2-fill" />}
                        items={[
                            {
                                label: 'Delete Account',
                                icon: 'ri-delete-bin-line',
                                danger: true,
                                disabled: isSelf,
                                onClick: () => setDeleteTarget(row)
                            }
                        ]}
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
                        User Accounts Management
                    </h1>
                </div>
                <Button iconLeft="ri-user-add-line" onClick={() => setCreateModalOpen(true)}>
                    Create User
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                    <div style={{ minWidth: '240px', flex: 1 }}>
                        <Input
                            placeholder="Search accounts name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '200px' }}>
                        <Select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'FLEET_MANAGER', label: 'Fleet Managers' },
                                { value: 'DRIVER', label: 'Drivers' },
                                { value: 'SAFETY_OFFICER', label: 'Safety Officers' },
                                { value: 'FINANCIAL_ANALYST', label: 'Financial Analysts' },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card padding="none">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    selectable
                    paginated
                    pageSize={10}
                    loading={loading}
                    emptyMessage="No matching user profiles found."
                />
            </Card>

            {/* Create User Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => !submitLoading && closeCreateModal()}
                title="Create User Account"
                size="md"
                footer={
                    !createdCredentials && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                            <Button variant="ghost" onClick={closeCreateModal} disabled={submitLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateUser} loading={submitLoading}>
                                Register Account
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
                                <h4 style={{ margin: 0, fontWeight: 'var(--t-font-weight-semibold)' }}>User Created Successfully</h4>
                                <p style={{ margin: 'var(--t-space-1) 0 0', fontSize: 'var(--t-font-size-caption)' }}>An activation email has been dispatched with their login details.</p>
                            </div>
                        </div>
                        <div style={{ border: '1px solid var(--t-border-color)', borderRadius: 'var(--t-rounded-md)', padding: 'var(--t-space-4)', backgroundColor: 'var(--t-bg-input)' }}>
                            <h4 style={{ margin: '0 0 var(--t-space-3)', fontSize: 'var(--t-font-size-body-sm)', color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-semibold)' }}>Copy Temporary Credentials:</h4>
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
                        <Button style={{ marginTop: 'var(--t-space-2)' }} onClick={closeCreateModal}>Done</Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Full Name"
                            placeholder="Enter full name"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            error={formErrors.name}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="user@transitops.com"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            error={formErrors.email}
                        />
                        <Select
                            label="System Role"
                            value={newUserData.role}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                            options={[
                                { value: 'SAFETY_OFFICER', label: 'Safety Officer' },
                                { value: 'FINANCIAL_ANALYST', label: 'Financial Analyst' },
                            ]}
                        />
                    </div>
                )}
            </Modal>

            {/* Confirm Delete User */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteUser}
                title="Delete User Account"
                message={`Are you sure you want to permanently delete the user account of "${deleteTarget?.name}"?`}
                confirmLabel="Delete Account"
                confirmVariant="danger"
                loading={submitLoading}
            />

        </div>
    );
};

export default UsersPage;
