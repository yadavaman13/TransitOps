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
    useToast
} from '../../template';
import '../../template/styles/index.scss';
import '../../template/pages/DashboardTemplatePage/DashboardTemplatePage.scss';
import * as fleetApi from '../service/fleet.api';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Fleet Overview' }];

const VEHICLE_TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Van', label: 'Van' },
    { value: 'Bus', label: 'Bus' },
    { value: 'Car', label: 'Car' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ON_TRIP', label: 'On Trip' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'RETIRED', label: 'Retired' },
];

const REGION_OPTIONS = [
    { value: '', label: 'All Regions' },
    { value: 'North', label: 'North Region' },
    { value: 'South', label: 'South Region' },
    { value: 'East', label: 'East Region' },
    { value: 'West', label: 'West Region' },
];

// Helper to draw clean SVG Donut / Pie Chart segments
const SvgDonutChart = ({ data, size = 200, strokeWidth = 24 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    if (total === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: size }}>
                <span style={{ color: 'var(--t-text-muted)', fontSize: 'var(--t-font-size-body-sm)' }}>No data to display</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--t-space-4)' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((accumulatedAngle / 100) * circumference);
                        accumulatedAngle += percentage;

                        return (
                            <circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                            />
                        );
                    })}
                </svg>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    pointerEvents: 'none'
                }}>
                    <span style={{ fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        {total}
                    </span>
                    <span style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>
                        Total
                    </span>
                </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--t-space-3)', justifyContent: 'center' }}>
                {data.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-2)' }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                        <span style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>
                            {item.label}: {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper to draw clean SVG Bar Chart
const SvgBarChart = ({ data, height = 200, barColor = 'var(--t-primary)' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 10);
    const chartHeight = height - 40; // padding for labels

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: chartHeight, gap: '6%', borderBottom: '1px solid var(--t-border-color)', paddingBottom: '4px' }}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * (chartHeight - 20);
                    return (
                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--t-space-1)', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-semibold)' }}>
                                {item.value}
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    height: Math.max(barHeight, 4),
                                    backgroundColor: barColor,
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease-in-out'
                                }}
                                title={`${item.label}: ${item.value}`}
                            />
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: '6%' }}>
                {data.map((item, index) => (
                    <div key={index} style={{ flex: 1, textAlign: 'center', fontSize: 'var(--t-font-size-caption)', color: 'var(--t-text-muted)' }}>
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

const FleetManagerDashboard = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        totalVehicles: 0,
        availableVehicles: 0,
        totalDrivers: 0,
        activeTrips: 0,
        vehiclesInMaintenance: 0,
        totalFuelCost: 0,
        totalExpenses: 0
    });
    const [vehicleSummary, setVehicleSummary] = useState({ AVAILABLE: 0, ON_TRIP: 0, MAINTENANCE: 0, RETIRED: 0 });
    const [tripSummary, setTripSummary] = useState({ DRAFT: 0, DISPATCHED: 0, STARTED: 0, COMPLETED: 0, CANCELLED: 0 });
    const [recentTrips, setRecentTrips] = useState([]);
    const [maintenanceDue, setMaintenanceDue] = useState([]);

    // Filters State
    const [vehicleType, setVehicleType] = useState('');
    const [status, setStatus] = useState('');
    const [region, setRegion] = useState('');
    const [search, setSearch] = useState('');

    // Modal State for user creation
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'SAFETY_OFFICER' });
    const [userFormErrors, setUserFormErrors] = useState({});
    const [userSubmitting, setUserSubmitting] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const res = await fleetApi.getDashboardOverview();
            if (res?.success) {
                const { data } = res;
                if (data.kpis) setKpis(data.kpis);
                if (data.vehicleSummary) setVehicleSummary(data.vehicleSummary);
                if (data.tripSummary) setTripSummary(data.tripSummary);
                if (data.recentActivities?.trips) {
                    setRecentTrips(data.recentActivities.trips);
                }
            }

            // Fetch maintenance due
            const mRes = await fleetApi.listMaintenance({ status: 'PENDING' });
            if (mRes?.success) {
                setMaintenanceDue(mRes.data.slice(0, 5));
            }
        } catch (err) {
            console.error('Failed to load dashboard data', err);
            showToast('Failed to retrieve dashboard insights.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleCreateUser = async () => {
        const errors = {};
        if (!newUserData.name.trim()) errors.name = 'Name is required';
        if (!newUserData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserData.email)) {
            errors.email = 'Invalid email address';
        }

        if (Object.keys(errors).length > 0) {
            setUserFormErrors(errors);
            return;
        }

        setUserSubmitting(true);
        setUserFormErrors({});
        try {
            let res;
            if (newUserData.role === 'SAFETY_OFFICER') {
                res = await fleetApi.createSafetyOfficer({ name: newUserData.name, email: newUserData.email });
            } else {
                res = await fleetApi.createFinancialAnalyst({ name: newUserData.name, email: newUserData.email });
            }

            if (res.success) {
                showToast(`${newUserData.role === 'SAFETY_OFFICER' ? 'Safety Officer' : 'Financial Analyst'} registered successfully!`, 'success');
                setCreatedCredentials(res.data.credentials);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create user profile.';
            showToast(msg, 'error');
        } finally {
            setUserSubmitting(false);
        }
    };

    const closeUserModal = () => {
        setUserModalOpen(false);
        setCreatedCredentials(null);
        setNewUserData({ name: '', email: '', role: 'SAFETY_OFFICER' });
        setUserFormErrors({});
    };

    // Calculate dynamic helper stats
    const vehiclesOnTrip = kpis.totalVehicles - kpis.availableVehicles - kpis.vehiclesInMaintenance;
    const runningTrips = kpis.activeTrips;
    const utilizationRate = kpis.totalVehicles > 0 ? Math.round((vehiclesOnTrip / kpis.totalVehicles) * 100) : 0;

    // Filter Recent Trips based on filters
    const filteredRecentTrips = recentTrips.filter(t => {
        const matchesSearch = !search || t.tripNumber.toLowerCase().includes(search.toLowerCase()) ||
            t.source.toLowerCase().includes(search.toLowerCase()) ||
            t.destination.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !status || t.status === status;
        return matchesSearch && matchesStatus;
    });

    const recentTripColumns = [
        { key: 'tripNumber', title: 'Trip Number', sortable: true },
        { key: 'source', title: 'Source' },
        { key: 'destination', title: 'Destination' },
        {
            key: 'status', title: 'Status', render: (row) => (
                <Badge variant={
                    row.status === 'COMPLETED' ? 'success' :
                    row.status === 'STARTED' ? 'primary' :
                    row.status === 'DISPATCHED' ? 'info' :
                    row.status === 'CANCELLED' ? 'danger' : 'neutral'
                }>
                    {row.status}
                </Badge>
            )
        }
    ];

    const maintenanceColumns = [
        { key: 'title', title: 'Service Type' },
        { key: 'serviceCenter', title: 'Garage' },
        { key: 'cost', title: 'Estimated Cost', render: (row) => `₹${row.cost}` },
        { key: 'scheduledDate', title: 'Due Date', render: (row) => new Date(row.scheduledDate).toLocaleDateString() },
        {
            key: 'status', title: 'Status', render: (row) => (
                <Badge variant={row.status === 'PENDING' ? 'warning' : 'neutral'}>
                    {row.status}
                </Badge>
            )
        }
    ];

    // Data for charts
    const donutData = [
        { label: 'Available', value: vehicleSummary.AVAILABLE, color: 'var(--t-success)' },
        { label: 'On Trip', value: vehicleSummary.ON_TRIP, color: 'var(--t-primary)' },
        { label: 'Maintenance', value: vehicleSummary.MAINTENANCE, color: 'var(--t-warning)' },
        { label: 'Retired', value: vehicleSummary.RETIRED, color: 'var(--t-text-muted)' },
    ];

    const barData = [
        { label: 'Draft', value: tripSummary.DRAFT },
        { label: 'Dispatched', value: tripSummary.DISPATCHED },
        { label: 'Started', value: tripSummary.STARTED },
        { label: 'Completed', value: tripSummary.COMPLETED },
        { label: 'Cancelled', value: tripSummary.CANCELLED },
    ];

    return (
        <div className="t-dash-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Fleet Overview
                    </h1>
                </div>
            </div>

            {/* Top filters aligned correctly with separate Spaced Create User Button */}
            <Card>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--t-space-4)' }}>
                    
                    {/* Filters block */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--t-space-3)', flex: 1 }}>
                        <div style={{ minWidth: '160px', flex: 1 }}>
                            <Input
                                placeholder="Search trip / route..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ width: '150px' }}>
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                options={STATUS_OPTIONS}
                            />
                        </div>
                        <div style={{ width: '150px' }}>
                            <Select
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                options={VEHICLE_TYPE_OPTIONS}
                            />
                        </div>
                        <div style={{ width: '150px' }}>
                            <Select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                options={REGION_OPTIONS}
                            />
                        </div>
                    </div>

                    {/* Create User button spacing */}
                    <div style={{ marginLeft: 'auto' }}>
                        <Button iconLeft="ri-user-add-line" onClick={() => setUserModalOpen(true)}>
                            Create Account
                        </Button>
                    </div>
                </div>
            </Card>

            {/* KPI statistics grid */}
            <div className="t-dash-page__stats" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--t-space-4)'
            }}>
                <StatCard title="Total Vehicles" value={kpis.totalVehicles} icon="ri-bus-fill" color="primary" subtitle="Total asset capacity" />
                <StatCard title="Available Vehicles" value={kpis.availableVehicles} icon="ri-checkbox-circle-line" color="success" subtitle="Ready for dispatch" />
                <StatCard title="Vehicles On Trip" value={vehiclesOnTrip >= 0 ? vehiclesOnTrip : 0} icon="ri-roadster-fill" color="info" subtitle="Active in-transit" />
                <StatCard title="In Maintenance" value={kpis.vehiclesInMaintenance} icon="ri-tools-fill" color="warning" subtitle="Under repairs" />
                <StatCard title="Drivers Available" value={kpis.totalDrivers - runningTrips >= 0 ? kpis.totalDrivers - runningTrips : 0} icon="ri-user-follow-line" color="success" />
                <StatCard title="Drivers On Trip" value={runningTrips} icon="ri-steering-fill" color="info" />
                <StatCard title="Running Trips" value={runningTrips} icon="ri-route-line" color="primary" />
                <StatCard title="Utilization Rate" value={`${utilizationRate}%`} icon="ri-pie-chart-line" color={utilizationRate > 75 ? 'success' : 'primary'} />
                <StatCard title="Total Fuel Cost" value={`₹${kpis.totalFuelCost.toLocaleString()}`} icon="ri-gas-station-fill" color="warning" />
            </div>

            {/* Visual Charts section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: 'var(--t-space-5)'
            }}>
                <Card>
                    <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Vehicle Status Breakdown
                    </h3>
                    <SvgDonutChart data={donutData} />
                </Card>

                <Card>
                    <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Trip Summaries By Status
                    </h3>
                    <div style={{ padding: 'var(--t-space-3) 0' }}>
                        <SvgBarChart data={barData} barColor="var(--t-primary)" />
                    </div>
                </Card>
            </div>

            {/* Fleet Utilization and Progress */}
            <Card>
                <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                    Fleet Segment Utilization
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-3)' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--t-space-1)', fontSize: 'var(--t-font-size-body-sm)' }}>
                            <span style={{ color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-medium)' }}>Heavy Duty Cargo Trucks</span>
                            <span style={{ color: 'var(--t-text-muted)' }}>87% Utilization</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--t-bg-app)', borderRadius: 'var(--t-rounded-pill)', overflow: 'hidden' }}>
                            <div style={{ width: '87%', height: '100%', backgroundColor: 'var(--t-primary)', borderRadius: 'var(--t-rounded-pill)' }} />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--t-space-1)', fontSize: 'var(--t-font-size-body-sm)' }}>
                            <span style={{ color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-medium)' }}>Delivery Transit Vans</span>
                            <span style={{ color: 'var(--t-text-muted)' }}>64% Utilization</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--t-bg-app)', borderRadius: 'var(--t-rounded-pill)', overflow: 'hidden' }}>
                            <div style={{ width: '64%', height: '100%', backgroundColor: 'var(--t-info)', borderRadius: 'var(--t-rounded-pill)' }} />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--t-space-1)', fontSize: 'var(--t-font-size-body-sm)' }}>
                            <span style={{ color: 'var(--t-text-main)', fontWeight: 'var(--t-font-weight-medium)' }}>Staff Shuttles & Buses</span>
                            <span style={{ color: 'var(--t-text-muted)' }}>42% Utilization</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--t-bg-app)', borderRadius: 'var(--t-rounded-pill)', overflow: 'hidden' }}>
                            <div style={{ width: '42%', height: '100%', backgroundColor: 'var(--t-warning)', borderRadius: 'var(--t-rounded-pill)' }} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Recents and Maintenance Table view */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: 'var(--t-space-5)'
            }}>
                <Card padding="none">
                    <div style={{ padding: 'var(--t-space-4) var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)' }}>
                        <h3 style={{ margin: 0, fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                            Recent Trips log
                        </h3>
                    </div>
                    <DataTable
                        columns={recentTripColumns}
                        data={filteredRecentTrips}
                        paginated
                        pageSize={5}
                        emptyMessage="No recent trip assignments found."
                    />
                </Card>

                <Card padding="none">
                    <div style={{ padding: 'var(--t-space-4) var(--t-space-5)', borderBottom: '1px solid var(--t-border-color)' }}>
                        <h3 style={{ margin: 0, fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                            Pending Maintenance Schedules
                        </h3>
                    </div>
                    <DataTable
                        columns={maintenanceColumns}
                        data={maintenanceDue}
                        paginated
                        pageSize={5}
                        emptyMessage="No pending maintenance service tasks due."
                    />
                </Card>
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={userModalOpen}
                onClose={closeUserModal}
                title="Create User Account"
                size="md"
                footer={
                    !createdCredentials && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-space-3)' }}>
                            <Button variant="ghost" onClick={closeUserModal} disabled={userSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateUser} loading={userSubmitting}>
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
                        <Button style={{ marginTop: 'var(--t-space-2)' }} onClick={closeUserModal}>Done</Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                        <Input
                            label="Full Name"
                            placeholder="Enter full name"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            error={userFormErrors.name}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="user@transitops.com"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            error={userFormErrors.email}
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

        </div>
    );
};

export default FleetManagerDashboard;
