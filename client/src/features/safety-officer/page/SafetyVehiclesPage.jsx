import React, { useState, useEffect } from 'react';
import {
    Card,
    Badge,
    DataTable,
    Breadcrumb,
    Button,
    Modal,
    useToast
} from '../../template';
import * as safetyApi from '../service/safety.api';

const BREADCRUMBS = [{ label: 'Home', href: '/safety-officer' }, { label: 'Vehicles' }];

const SafetyVehiclesPage = () => {
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const { addToast } = useToast();

    // Documents audit modal state
    const [auditModal, setAuditModal] = useState({ open: false, vehicle: null, documents: [], loadingDocs: false });

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const data = await safetyApi.getVehicles();
            setVehicles(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            addToast({
                title: 'Error loading vehicles',
                message: error.response?.data?.message || 'Could not fetch vehicles list.',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const handleOpenAudit = async (vehicle) => {
        setAuditModal({ open: true, vehicle, documents: [], loadingDocs: true });
        try {
            const docs = await safetyApi.getVehicleDocuments(vehicle.id);
            setAuditModal(prev => ({ ...prev, documents: docs || [], loadingDocs: false }));
        } catch (error) {
            console.error('Error fetching documents:', error);
            addToast({
                title: 'Failed to load documents',
                message: error.response?.data?.message || 'Could not retrieve uploaded certificates.',
                variant: 'danger'
            });
            setAuditModal(prev => ({ ...prev, loadingDocs: false }));
        }
    };

    const handleDownloadDoc = (docId) => {
        // Trigger file download via backend route
        window.open(`/api/vehicle-documents/${docId}/download`, '_blank');
    };

    const columns = [
        { key: 'registrationNumber', title: 'Registration No', sortable: true },
        { key: 'vehicleNumber', title: 'Vehicle No' },
        { key: 'brand', title: 'Brand', sortable: true },
        { key: 'model', title: 'Model' },
        {
            key: 'currentOdometer',
            title: 'Odometer (km)',
            sortable: true,
            render: (row) => `${Number(row.currentOdometer).toLocaleString()} km`
        },
        {
            key: 'insuranceExpiry',
            title: 'Insurance Expiry',
            sortable: true,
            render: (row) => {
                const isExpired = new Date(row.insuranceExpiry) < new Date();
                return (
                    <span style={{ color: isExpired ? 'var(--t-danger)' : 'inherit', fontWeight: isExpired ? 'bold' : 'normal' }}>
                        {new Date(row.insuranceExpiry).toLocaleDateString()} {isExpired && ' (Expired)'}
                    </span>
                );
            }
        },
        {
            key: 'pollutionExpiry',
            title: 'PUC Expiry',
            sortable: true,
            render: (row) => {
                const isExpired = new Date(row.pollutionExpiry) < new Date();
                return (
                    <span style={{ color: isExpired ? 'var(--t-danger)' : 'inherit', fontWeight: isExpired ? 'bold' : 'normal' }}>
                        {new Date(row.pollutionExpiry).toLocaleDateString()} {isExpired && ' (Expired)'}
                    </span>
                );
            }
        },
        {
            key: 'status',
            title: 'Status',
            render: (row) => {
                const status = row.status;
                const variant = status === 'AVAILABLE' ? 'success' : status === 'MAINTENANCE' ? 'warning' : status === 'ON_TRIP' ? 'primary' : 'neutral';
                return <Badge variant={variant}>{status}</Badge>;
            }
        },
        {
            key: 'actions',
            title: 'Compliance Audit',
            render: (row) => (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenAudit(row)}
                >
                    <i className="ri-file-shield-line"></i> Audit Files
                </Button>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--t-text-muted)' }}>
                <i className="ri-loader-4-line ri-spin" style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}></i>
                <span>Loading Vehicles Fleet Data...</span>
            </div>
        );
    }

    return (
        <div className="t-dash-page">
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                    <h1 className="t-dash-page__heading">Vehicle Safety & Inspection Records</h1>
                    <p className="t-dash-page__subtitle">Monitor vehicle running states, insurance coverages, pollution compliance, and physical verification forms.</p>
                </div>
            </div>

            <Card padding="none">
                <DataTable
                    columns={columns}
                    data={vehicles}
                    searchable
                    paginated
                    pageSize={10}
                />
            </Card>

            {/* Modal: Document Auditing Drawer */}
            <Modal
                open={auditModal.open}
                onClose={() => setAuditModal({ open: false, vehicle: null, documents: [], loadingDocs: false })}
                title={`Compliance Verification — ${auditModal.vehicle?.registrationNumber} (${auditModal.vehicle?.brand} ${auditModal.vehicle?.model})`}
            >
                <div style={{ padding: 'var(--t-space-4)' }}>
                    <div style={{ marginBottom: 'var(--t-space-5)' }}>
                        <h4 style={{ margin: '0 0 var(--t-space-2) 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--t-text-muted)', letterSpacing: '0.05em' }}>
                            Mandatory Certifications
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                            <div style={{ padding: 'var(--t-space-3)', background: 'var(--t-bg-input)', borderRadius: 'var(--t-rounded-sm)', border: '1px solid var(--t-border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--t-text-muted)' }}>Insurance Expiry</span>
                                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                    {auditModal.vehicle?.insuranceExpiry ? new Date(auditModal.vehicle.insuranceExpiry).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div style={{ padding: 'var(--t-space-3)', background: 'var(--t-bg-input)', borderRadius: 'var(--t-rounded-sm)', border: '1px solid var(--t-border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--t-text-muted)' }}>PUC / Pollution Expiry</span>
                                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                    {auditModal.vehicle?.pollutionExpiry ? new Date(auditModal.vehicle.pollutionExpiry).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <h4 style={{ margin: '0 0 var(--t-space-3) 0', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--t-text-muted)', letterSpacing: '0.05em' }}>
                        Uploaded Documentation
                    </h4>

                    {auditModal.loadingDocs ? (
                        <div style={{ padding: 'var(--t-space-6)', textAlign: 'center', color: 'var(--t-text-muted)' }}>
                            <i className="ri-loader-4-line ri-spin" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}></i>
                            Fetching documents list...
                        </div>
                    ) : auditModal.documents.length === 0 ? (
                        <div style={{
                            padding: 'var(--t-space-8)',
                            textAlign: 'center',
                            color: 'var(--t-text-muted)',
                            background: 'var(--t-danger-bg)',
                            border: '1px dashed var(--t-danger)',
                            borderRadius: 'var(--t-rounded-sm)'
                        }}>
                            <i className="ri-file-warning-line" style={{ fontSize: '2rem', color: 'var(--t-danger)', display: 'block', marginBottom: 'var(--t-space-2)' }}></i>
                            No uploaded certification files found. Please instruct the Fleet Manager to upload registration, insurance, and PUC certificates.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-3)' }}>
                            {auditModal.documents.map(doc => {
                                const isDocExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                                return (
                                    <div key={doc.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--t-space-3)',
                                        border: '1px solid var(--t-border-color)',
                                        borderRadius: 'var(--t-rounded-sm)',
                                        background: 'var(--t-bg-card)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-3)' }}>
                                            <i className="ri-file-text-line" style={{ fontSize: '1.5rem', color: 'var(--t-primary)' }}></i>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                                    {doc.documentType} ({doc.fileName})
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--t-text-muted)' }}>
                                                    Size: {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}
                                                    {doc.expiryDate && ` | Expiration: ${new Date(doc.expiryDate).toLocaleDateString()}`}
                                                </span>
                                                {isDocExpired && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--t-danger)', fontWeight: 'bold' }}>
                                                        ⚠️ File Expiration Date is in the past!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => handleDownloadDoc(doc.id)}>
                                            <i className="ri-download-cloud-line"></i> Download
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--t-space-6)' }}>
                        <Button variant="secondary" onClick={() => setAuditModal({ open: false, vehicle: null, documents: [], loadingDocs: false })}>
                            Close Audit Window
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SafetyVehiclesPage;
