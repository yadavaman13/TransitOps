import React, { useState, useEffect } from 'react';
import {
    StatCard,
    Card,
    Badge,
    DataTable,
    Breadcrumb,
    Button,
    useToast,
    Tabs
} from '../../template';
import * as safetyApi from '../service/safety.api';
import '../../template/styles/index.scss';
import '../../template/pages/DashboardTemplatePage/DashboardTemplatePage.scss';
import './SafetyOfficerDashboard.css';

const BREADCRUMBS = [{ label: 'Home' }, { label: 'Safety Dashboard' }];

const TABS = [
    { key: 'incidents', label: 'Incident Log', icon: 'ri-alarm-warning-line' },
    { key: 'audits', label: 'Driver Audits', icon: 'ri-file-user-line' },
];

const COLUMNS = [
    { key: 'driver', title: 'Driver Name', sortable: true },
    { key: 'vehicle', title: 'Vehicle' },
    { key: 'type', title: 'Incident Type' },
    { key: 'severity', title: 'Severity', render: (row) => (
        <Badge variant={row.severity === 'High' ? 'danger' : row.severity === 'Medium' ? 'warning' : 'neutral'}>
            {row.severity}
        </Badge>
    )},
    { key: 'date', title: 'Date', sortable: true },
];

const SAMPLE_INCIDENTS = [
    { id: 1, driver: 'Suresh Patel', vehicle: 'Eicher Pro (MH-12-XY-9876)', type: 'Over-speeding (>80 km/h)', severity: 'Medium', date: '2026-07-12' },
    { id: 2, driver: 'Vikram Singh', vehicle: 'Tata Winger (MH-14-RT-5678)', type: 'Harsh Braking', severity: 'Low', date: '2026-07-11' },
    { id: 3, driver: 'Ramesh Kumar', vehicle: 'Tata Starbus (MH-12-PQ-4567)', type: 'Route Deviation Alert', severity: 'Low', date: '2026-07-10' },
];

const SafetyOfficerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incidents');
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const { addToast } = useToast();

    const [stats, setStats] = useState({
        expiredLicenses: 0,
        expiringLicenses: 0,
        vehiclesInMaintenance: 0,
        suspendedDrivers: 0,
        avgSafetyScore: 0,
    });

    const [distribution, setDistribution] = useState({
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [driversData, expiringData, vehiclesData, notificationsData] = await Promise.all([
                safetyApi.getDrivers(),
                safetyApi.getExpiringLicenses(),
                safetyApi.getVehicles(),
                safetyApi.getNotifications()
            ]);

            setDrivers(driversData || []);
            setVehicles(vehiclesData || []);
            setNotifications(notificationsData?.notifications || notificationsData || []);

            const now = new Date();
            let totalSafetyScore = 0;
            let driversWithScoreCount = 0;
            let expired = 0;
            let suspended = 0;

            const dist = { excellent: 0, good: 0, average: 0, poor: 0 };

            (driversData || []).forEach(d => {
                const expiry = new Date(d.licenseExpiry);
                if (expiry < now) expired++;
                if (d.availabilityStatus === 'SUSPENDED') suspended++;

                const score = parseFloat(d.safetyScore);
                if (!isNaN(score)) {
                    totalSafetyScore += score;
                    driversWithScoreCount++;

                    if (score >= 90) dist.excellent++;
                    else if (score >= 80) dist.good++;
                    else if (score >= 70) dist.average++;
                    else dist.poor++;
                }
            });

            const inMaint = (vehiclesData || []).filter(v => v.status === 'MAINTENANCE').length;
            const avgScore = driversWithScoreCount > 0
                ? (totalSafetyScore / driversWithScoreCount).toFixed(1)
                : 100;

            setStats({
                expiredLicenses: expired,
                expiringLicenses: expiringData?.length || 0,
                vehiclesInMaintenance: inMaint,
                suspendedDrivers: suspended,
                avgSafetyScore: avgScore,
            });

            setDistribution(dist);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            addToast({
                title: 'Error loading data',
                message: error.response?.data?.message || 'Could not connect to the backend server.',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await safetyApi.markNotificationAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            addToast({ title: 'Alert resolved', message: 'Notification marked as read.', variant: 'success' });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await safetyApi.markAllNotificationsAsRead();
            setNotifications([]);
            addToast({ title: 'All notifications cleared', message: 'Marked all notifications as read.', variant: 'success' });
        } catch (error) {
            console.error('Error clearing alerts:', error);
        }
    };

    if (loading) {
        return (
            <div className="sod-loading">
                <i className="ri-loader-4-line ri-spin sod-loading__icon" />
                <span>Loading dashboard…</span>
            </div>
        );
    }

    const driverColumns = [
        { key: 'name', title: 'Driver Name', sortable: true },
        { key: 'licenseNumber', title: 'License No.' },
        {
            key: 'licenseExpiry',
            title: 'Expiry Date',
            render: (row) => {
                const isExpired = new Date(row.licenseExpiry) < new Date();
                return (
                    <span className={isExpired ? 'sod-expired-date' : ''}>
                        {new Date(row.licenseExpiry).toLocaleDateString()}
                        {isExpired && <Badge variant="danger" style={{ marginLeft: '0.5rem' }}>Expired</Badge>}
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
                const variant =
                    row.availabilityStatus === 'SUSPENDED' ? 'danger' :
                    row.availabilityStatus === 'AVAILABLE' ? 'success' : 'neutral';
                return <Badge variant={variant}>{row.availabilityStatus}</Badge>;
            }
        }
    ];

    const totalDistDrivers = distribution.excellent + distribution.good + distribution.average + distribution.poor;
    const getPercent = (val) => totalDistDrivers === 0 ? 0 : ((val / totalDistDrivers) * 100).toFixed(0);

    const scoreBands = [
        { label: 'Excellent', range: '90–100', key: 'excellent', color: 'var(--t-success)' },
        { label: 'Good',      range: '80–89',  key: 'good',      color: 'var(--t-primary)' },
        { label: 'Average',   range: '70–79',  key: 'average',   color: '#f59e0b' },
        { label: 'Needs Focus', range: '<70',  key: 'poor',      color: 'var(--t-danger)' },
    ];

    return (
        <div className="t-dash-page">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                    <h1 className="t-dash-page__heading">Safety & Compliance</h1>
                    <p className="t-dash-page__subtitle">
                        Fleet safety ratings, licensing status, and active compliance alerts.
                    </p>
                </div>
                <div className="t-dash-page__actions">
                    <Button variant="secondary" onClick={fetchData}>
                        <i className="ri-refresh-line" /> Refresh
                    </Button>
                </div>
            </div>

            {/* ── KPI Row ─────────────────────────────────────────────── */}
            <div className="t-dash-page__stats">
                <StatCard
                    title="Avg Safety Score"
                    value={`${stats.avgSafetyScore}%`}
                    icon="ri-shield-check-fill"
                    color={stats.avgSafetyScore >= 90 ? 'success' : stats.avgSafetyScore >= 80 ? 'warning' : 'danger'}
                    subtitle="Target: >90% compliance"
                />
                <StatCard
                    title="Expired Licenses"
                    value={stats.expiredLicenses}
                    icon="ri-close-circle-fill"
                    color={stats.expiredLicenses > 0 ? 'danger' : 'success'}
                    subtitle="Require urgent renewal"
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats.expiringLicenses}
                    icon="ri-error-warning-fill"
                    color={stats.expiringLicenses > 0 ? 'warning' : 'primary'}
                    subtitle="Within next 30 days"
                />
                <StatCard
                    title="In Maintenance"
                    value={stats.vehiclesInMaintenance}
                    icon="ri-tools-fill"
                    color="primary"
                    subtitle="Vehicles off the road"
                />
                <StatCard
                    title="Suspended Drivers"
                    value={stats.suspendedDrivers}
                    icon="ri-user-unfollow-fill"
                    color={stats.suspendedDrivers > 0 ? 'danger' : 'success'}
                    subtitle="Removed from service"
                />
            </div>

            {/* ── Mid Row: Score Distribution + Alerts ────────────────── */}
            <div className="sod-mid-grid">

                {/* Safety Score Distribution */}
                <Card>
                    <div className="sod-card-header">
                        <div className="sod-card-header__title">
                            <i className="ri-bar-chart-2-line sod-card-header__icon" />
                            <span>Safety Score Distribution</span>
                        </div>
                        <span className="sod-card-header__meta">{totalDistDrivers} drivers</span>
                    </div>

                    <div className="sod-dist-list">
                        {scoreBands.map(band => {
                            const count = distribution[band.key];
                            const pct = getPercent(count);
                            return (
                                <div key={band.key} className="sod-dist-row">
                                    <div className="sod-dist-row__labels">
                                        <span className="sod-dist-row__label">{band.label}</span>
                                        <span className="sod-dist-row__range">{band.range}</span>
                                        <span className="sod-dist-row__count">{count} ({pct}%)</span>
                                    </div>
                                    <div className="sod-dist-row__track">
                                        <div
                                            className="sod-dist-row__fill"
                                            style={{ width: `${pct}%`, background: band.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Active Alerts */}
                <Card>
                    <div className="sod-card-header">
                        <div className="sod-card-header__title">
                            <i className="ri-alarm-warning-line sod-card-header__icon sod-card-header__icon--danger" />
                            <span>Active Alerts</span>
                        </div>
                        {notifications.length > 0 && (
                            <div className="sod-card-header__right">
                                <span className="sod-alert-count">{notifications.length}</span>
                                <Button variant="text" onClick={handleMarkAllRead} size="sm">
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="sod-alerts-list">
                        {notifications.length === 0 ? (
                            <div className="sod-alerts-empty">
                                <i className="ri-checkbox-circle-line sod-alerts-empty__icon" />
                                <p>All clear — no active alerts</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const isCritical = n.title.includes('Expired') || n.title.includes('Overdue') || n.title.includes('⚠️');
                                return (
                                    <div key={n.id} className={`sod-alert-item ${isCritical ? 'sod-alert-item--critical' : ''}`}>
                                        <div className="sod-alert-item__dot" />
                                        <div className="sod-alert-item__body">
                                            <span className="sod-alert-item__title">{n.title}</span>
                                            <span className="sod-alert-item__message">{n.message}</span>
                                            <span className="sod-alert-item__time">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            className="sod-alert-item__resolve"
                                            onClick={() => handleMarkAsRead(n.id)}
                                            title="Resolve"
                                            aria-label="Resolve alert"
                                        >
                                            <i className="ri-check-line" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>

            {/* Content card with tabs */}
            <Card padding="none">
                <div style={{ padding: '0 var(--t-space-5)' }}>
                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
                </div>
                {activeTab === 'incidents' && (
                    <DataTable
                        columns={COLUMNS}
                        data={SAMPLE_INCIDENTS}
                        searchable
                        selectable
                        paginated
                        pageSize={10}
                    />
                )}
                {activeTab === 'audits' && (
                    <div style={{ padding: 'var(--t-space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--t-text-muted)' }}>
                        <i className="ri-checkbox-circle-line" style={{ color: 'var(--t-color-success, #22c55e)', fontSize: '18px' }} />
                        All 18 driver background verification and medical audits completed successfully. 2 pending.
                    </div>
                )}
            </Card>

            {/* ── Drivers Table ────────────────────────────────────────── */}
            <Card title="Driver Overview">
                <DataTable
                    columns={driverColumns}
                    data={drivers}
                    searchable
                    paginated
                    pageSize={8}
                />
            </Card>
        </div>
    );
};

export default SafetyOfficerDashboard;
