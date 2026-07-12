// client/src/features/template/pages/CrudTemplatePage/CrudTemplatePage.jsx
import React, { useState } from 'react';
import Button        from '../../components/ui/Button/index.js';
import Badge         from '../../components/ui/Badge/index.js';
import Card          from '../../components/ui/Card/index.js';
import DataTable     from '../../components/data-display/DataTable/index.js';
import SearchBar     from '../../components/navigation/SearchBar/index.js';
import Modal         from '../../components/overlays/Modal/index.js';
import ConfirmDialog from '../../components/overlays/ConfirmDialog/index.js';
import Form, { FormSection, FormRow, FormActions } from '../../components/forms/Form/index.js';
import Input         from '../../components/forms/Input/index.js';
import Select        from '../../components/forms/Select/index.js';
import DatePicker    from '../../components/forms/DatePicker/index.js';
import Breadcrumb    from '../../components/navigation/Breadcrumb/index.js';
import Dropdown      from '../../components/ui/Dropdown/index.js';
import FilterPanel   from '../../components/dashboard/FilterPanel/index.js';
import { useToast }  from '../../components/feedback/Toast/index.js';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Records' }];

const STATUS_OPTIONS = [
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const FILTER_STATUS_OPTIONS = [
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const FILTER_ROLE_OPTIONS = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Staff', label: 'Staff' },
];

const FILTERS = [
    { key: 'status', label: 'Status', options: FILTER_STATUS_OPTIONS },
    { key: 'role',   label: 'Role',   options: FILTER_ROLE_OPTIONS },
];

const buildColumns = (onEdit, onDelete) => [
    { key: 'name',   title: 'Name',   sortable: true },
    { key: 'email',  title: 'Email',  sortable: true },
    { key: 'role',   title: 'Role' },
    { key: 'joinedDate', title: 'Joined Date', sortable: true },
    { key: 'status', title: 'Status', render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
            {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
    )},
    { key: '_actions', title: '', render: (row) => {
        const dropdownItems = [
            { label: 'Edit Record', icon: 'ri-pencil-line', onClick: () => onEdit(row) },
            { label: 'Delete Record', icon: 'ri-delete-bin-line', danger: true, onClick: () => onDelete(row) }
        ];
        return (
            <Dropdown
                trigger={<Button size="sm" variant="ghost" iconLeft="ri-more-2-fill" />}
                items={dropdownItems}
                align="right"
            />
        );
    }},
];

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
    name: '',
    email: '',
    role: '',
    status: 'active',
    joinedDate: getTodayDateString()
};

const CrudTemplatePage = () => {
    const { showToast } = useToast();
    const [records, setRecords] = useState([
        { id: 1, name: 'Alice Johnson', email: 'alice@erp.com', role: 'Admin',  status: 'active',   joinedDate: '2026-01-15' },
        { id: 2, name: 'Bob Smith',     email: 'bob@erp.com',   role: 'Staff',  status: 'inactive', joinedDate: '2026-03-22' },
        { id: 3, name: 'Carol White',   email: 'carol@erp.com', role: 'Staff',  status: 'active',   joinedDate: '2026-05-10' },
    ]);

    const [search,       setSearch]       = useState('');
    const [filterValues, setFilterValues] = useState({ status: '', role: '' });
    const [formOpen,     setFormOpen]     = useState(false);
    const [editTarget,   setEditTarget]   = useState(null);
    const [formData,     setFormData]     = useState(EMPTY_FORM);
    const [formErrors,   setFormErrors]   = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading,      setLoading]      = useState(false);

    const handleFilterChange = (key, value) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleResetFilters = () => {
        setFilterValues({ status: '', role: '' });
    };

    const filtered = records.filter((r) => {
        const matchesSearch = !search ||
            [r.name, r.email, r.role].some((v) =>
                String(v).toLowerCase().includes(search.toLowerCase())
            );
        const matchesStatus = !filterValues.status || r.status === filterValues.status;
        const matchesRole = !filterValues.role || r.role === filterValues.role;

        return matchesSearch && matchesStatus && matchesRole;
    });

    const openCreate = () => {
        setEditTarget(null);
        setFormData(EMPTY_FORM);
        setFormErrors({});
        setFormOpen(true);
    };

    const openEdit = (row) => {
        setEditTarget(row);
        setFormData({
            name: row.name,
            email: row.email,
            role: row.role,
            status: row.status,
            joinedDate: row.joinedDate || getTodayDateString()
        });
        setFormErrors({});
        setFormOpen(true);
    };

    const handleField = (key) => (e) => {
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));
        if (formErrors[key]) {
            setFormErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name || !formData.name.trim()) {
            errors.name = 'Full Name is required';
        }
        if (!formData.email || !formData.email.trim()) {
            errors.email = 'Email Address is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Please enter a valid email address';
            }
        }
        if (!formData.joinedDate) {
            errors.joinedDate = 'Joined Date is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            showToast('Please correct the errors in the form.', 'error');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            if (editTarget) {
                setRecords((prev) =>
                    prev.map((r) => r.id === editTarget.id ? { ...r, ...formData } : r)
                );
                showToast(`Record for "${formData.name}" updated successfully!`, 'success');
            } else {
                setRecords((prev) => [...prev, { id: Date.now(), ...formData }]);
                showToast(`Record for "${formData.name}" created successfully!`, 'success');
            }
            setFormOpen(false);
            setLoading(false);
        }, 600);
    };

    const handleDelete = () => {
        setLoading(true);
        setTimeout(() => {
            setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            showToast(`Record for "${deleteTarget.name}" deleted successfully!`, 'success');
            setDeleteTarget(null);
            setLoading(false);
        }, 600);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            {/* Page header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <Breadcrumb items={BREADCRUMBS} />
                    <h1 style={{ margin: 'var(--t-space-1) 0 0', fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Records
                    </h1>
                </div>
                <Button iconLeft="ri-add-line" onClick={openCreate}>
                    New Record
                </Button>
            </div>

            {/* Table card */}
            <Card padding="none">
                <div style={{
                    padding: 'var(--t-space-4) var(--t-space-5)',
                    borderBottom: '1px solid var(--t-border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--t-space-4)'
                }}>
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search records..."
                    />
                    
                    <FilterPanel
                        filters={FILTERS}
                        values={filterValues}
                        onChange={handleFilterChange}
                        onReset={handleResetFilters}
                        inline
                    />
                </div>
                <DataTable
                    columns={buildColumns(openEdit, setDeleteTarget)}
                    data={filtered}
                    selectable
                    paginated
                    pageSize={10}
                    emptyMessage="No records found matching filters."
                />
            </Card>

            {/* Create / Edit modal */}
            <Modal
                isOpen={formOpen}
                onClose={() => !loading && setFormOpen(false)}
                title={editTarget ? 'Edit Record' : 'New Record'}
                size="md"
                footer={
                    <FormActions>
                        <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button loading={loading} onClick={handleSubmit}>
                            {editTarget ? 'Save Changes' : 'Create'}
                        </Button>
                    </FormActions>
                }
            >
                <Form onSubmit={handleSubmit}>
                    <FormSection>
                        <FormRow cols={2}>
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleField('name')}
                                required
                                error={formErrors.name}
                            />
                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="john@company.com"
                                value={formData.email}
                                onChange={handleField('email')}
                                required
                                error={formErrors.email}
                            />
                        </FormRow>
                        <FormRow cols={2}>
                            <Input
                                label="Role"
                                placeholder="e.g. Admin, Staff"
                                value={formData.role}
                                onChange={handleField('role')}
                            />
                            <Select
                                label="Status"
                                options={STATUS_OPTIONS}
                                value={formData.status}
                                onChange={handleField('status')}
                            />
                        </FormRow>
                        <FormRow cols={2}>
                            <DatePicker
                                label="Joined Date"
                                value={formData.joinedDate}
                                onChange={handleField('joinedDate')}
                                required
                                error={formErrors.joinedDate}
                            />
                        </FormRow>
                    </FormSection>
                </Form>
            </Modal>

            {/* Delete confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Record"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={loading}
            />
        </div>
    );
};

export default CrudTemplatePage;
