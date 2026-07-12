import React, { useState, useEffect } from 'react';
import {
    Card,
    Badge,
    Breadcrumb,
    Button,
    useToast
} from '../../template';
import * as safetyApi from '../service/safety.api';

const BREADCRUMBS = [{ label: 'Home', href: '/safety-officer' }, { label: 'Maintenance' }];

const SafetyMaintenancePage = () => {
    const [loading, setLoading] = useState(true);
    const [maintenanceList, setMaintenanceList] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const { addToast } = useToast();

    const loadData = async () => {
        try {
            setLoading(true);
            const [maintData, vehiclesData] = await Promise.all([
                safetyApi.getMaintenance(),
                safetyApi.getVehicles()
            ]);
            setMaintenanceList(maintData || []);
            setVehicles(vehiclesData || []);
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
            addToast({
                title: 'Error loading maintenance logs',
                message: error.response?.data?.message || 'Could not fetch records.',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Create a local map from vehicle ID to registration number
    const vehicleMap = vehicles.reduce((acc, v) => {
        acc[v.id] = `${v.registrationNumber} (${v.brand} ${v.model})`;
        return acc;
    }, {});

    // Filter lists
    const upcoming = maintenanceList.filter(m => m.status === 'PENDING');
    const current = maintenanceList.filter(m => m.status === 'IN_PROGRESS');
    const completed = maintenanceList.filter(m => m.status === 'COMPLETED' || m.status === 'CANCELLED');

    const renderCard = (item) => {
        const cost = parseFloat(item.cost);
        const date = new Date(item.scheduledDate);
        const isPast = date < new Date() && item.status !== 'COMPLETED' && item.status !== 'CANCELLED';

        let badgeVariant = 'neutral';
        if (item.maintenanceType === 'Repair') badgeVariant = 'danger';
        else if (item.maintenanceType === 'General Service') badgeVariant = 'success';
        else if (item.maintenanceType === 'Oil Change') badgeVariant = 'primary';
        else badgeVariant = 'warning';

        return (
            <div key={item.id} style={{
                background: 'var(--t-bg-card)',
                border: `1px solid ${isPast ? 'var(--t-danger)' : 'var(--t-border-color)'}`,
                padding: 'var(--t-space-4)',
                borderRadius: 'var(--t-rounded-sm)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--t-space-2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: '700', color: 'var(--t-text-main)', fontSize: '0.925rem' }}>{item.title}</span>
                    <Badge variant={badgeVariant}>{item.maintenanceType}</Badge>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--t-text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span>
                        <i className="ri-truck-line" style={{ marginRight: '0.25rem' }}></i>
                        {vehicleMap[item.vehicleId] || 'Unknown Vehicle'}
                    </span>
                    <span>
                        <i className="ri-calendar-event-line" style={{ marginRight: '0.25rem' }}></i>
                        Scheduled: {date.toLocaleDateString()} {isPast && <span style={{ color: 'var(--t-danger)', fontWeight: 'bold' }}>(Overdue)</span>}
                    </span>
                    {item.completedDate && (
                        <span>
                            <i className="ri-calendar-check-line" style={{ marginRight: '0.25rem' }}></i>
                            Completed: {new Date(item.completedDate).toLocaleDateString()}
                        </span>
                    )}
                    {item.serviceCenter && (
                        <span>
                            <i className="ri-map-pin-line" style={{ marginRight: '0.25rem' }}></i>
                            Center: {item.serviceCenter}
                        </span>
                    )}
                    <span>
                        <i className="ri-money-dollar-circle-line" style={{ marginRight: '0.25rem' }}></i>
                        Cost: {isNaN(cost) ? 'N/A' : `₹${cost.toLocaleString('en-IN')}`}
                    </span>
                </div>

                {item.description && (
                    <p style={{
                        margin: 'var(--t-space-2) 0 0 0',
                        fontSize: '0.8125rem',
                        color: 'var(--t-text-muted)',
                        background: 'var(--t-bg-input)',
                        padding: 'var(--t-space-2)',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--t-primary)'
                    }}>
                        {item.description}
                    </p>
                )}

                {item.status === 'CANCELLED' && (
                    <Badge variant="neutral" style={{ alignSelf: 'flex-start', marginTop: 'var(--t-space-1)' }}>Cancelled</Badge>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--t-text-muted)' }}>
                <i className="ri-loader-4-line ri-spin" style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}></i>
                <span>Loading Maintenance Records...</span>
            </div>
        );
    }

    return (
        <div className="t-dash-page">
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                    <h1 className="t-dash-page__heading">Fleet Maintenance Tracking</h1>
                    <p className="t-dash-page__subtitle">Track active vehicle breakdowns, routine servicings, workshop timelines, and past records.</p>
                </div>
                <div className="t-dash-page__actions">
                    <Button variant="secondary" onClick={loadData}>
                        <i className="ri-refresh-line"></i> Refresh
                    </Button>
                </div>
            </div>

            {/* Kanban Columns */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--t-space-5)',
                alignItems: 'start'
            }}>
                {/* Column 1: Upcoming */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--t-space-4)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--t-text-main)' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--t-primary)', borderRadius: '50%' }}></span>
                            Upcoming Tasks
                        </h3>
                        <Badge variant="primary">{upcoming.length}</Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', minHeight: '300px' }}>
                        {upcoming.length === 0 ? (
                            <div style={{ padding: 'var(--t-space-8)', textAlign: 'center', color: 'var(--t-text-muted)', border: '1px dashed var(--t-border-color)', borderRadius: 'var(--t-rounded-sm)' }}>
                                No upcoming maintenance tasks.
                            </div>
                        ) : (
                            upcoming.map(renderCard)
                        )}
                    </div>
                </Card>

                {/* Column 2: Current */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--t-space-4)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--t-text-main)' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--t-warning)', borderRadius: '50%' }}></span>
                            In Progress (Workshop)
                        </h3>
                        <Badge variant="warning">{current.length}</Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', minHeight: '300px' }}>
                        {current.length === 0 ? (
                            <div style={{ padding: 'var(--t-space-8)', textAlign: 'center', color: 'var(--t-text-muted)', border: '1px dashed var(--t-border-color)', borderRadius: 'var(--t-rounded-sm)' }}>
                                No vehicles currently in maintenance.
                            </div>
                        ) : (
                            current.map(renderCard)
                        )}
                    </div>
                </Card>

                {/* Column 3: Completed */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--t-space-4)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--t-text-main)' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--t-success)', borderRadius: '50%' }}></span>
                            Archived / Completed
                        </h3>
                        <Badge variant="success">{completed.length}</Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', minHeight: '300px' }}>
                        {completed.length === 0 ? (
                            <div style={{ padding: 'var(--t-space-8)', textAlign: 'center', color: 'var(--t-text-muted)', border: '1px dashed var(--t-border-color)', borderRadius: 'var(--t-rounded-sm)' }}>
                                No completed records.
                            </div>
                        ) : (
                            completed.map(renderCard)
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SafetyMaintenancePage;
