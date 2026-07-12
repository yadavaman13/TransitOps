import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router';
import { AppLayout, Sidebar, ToastProvider } from '../../template/index.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import '../../template/styles/index.scss';

const getNavItems = (role) => {
    switch (role) {
        case 'FLEET_MANAGER':
            return [
                { title: 'Fleet Overview', icon: 'ri-dashboard-3-line', route: '/fleet-manager' },
                { title: 'Vehicles', icon: 'ri-bus-line', route: '/fleet-manager/vehicles' },
                { title: 'Drivers', icon: 'ri-user-star-line', route: '/fleet-manager/drivers' },
                { title: 'Trips Management', icon: 'ri-roadster-line', route: '/fleet-manager/trips' },
                { title: 'Maintenance', icon: 'ri-tools-line', route: '/fleet-manager/maintenance' },
                { title: 'Fuel & Expenses', icon: 'ri-gas-station-line', route: '/fleet-manager/fuel-expenses' },
                { title: 'Reports & Analytics', icon: 'ri-bar-chart-2-line', route: '/fleet-manager/reports' },
                { title: 'Users Management', icon: 'ri-team-line', route: '/fleet-manager/users' },
                { title: 'Settings', icon: 'ri-settings-4-line', route: '/fleet-manager/settings' },
            ];
        case 'DRIVER':
            return [
                { title: 'Driver Dashboard', icon: 'ri-dashboard-3-line', route: '/driver' },
            ];
        case 'SAFETY_OFFICER':
            return [
                { title: 'Dashboard', icon: 'ri-dashboard-3-line', route: '/safety-officer' },
                { title: 'Drivers', icon: 'ri-contacts-line', route: '/safety-officer/drivers' },
                { title: 'Vehicles', icon: 'ri-truck-line', route: '/safety-officer/vehicles' },
                { title: 'Maintenance', icon: 'ri-tools-line', route: '/safety-officer/maintenance' },
                { title: 'Reports', icon: 'ri-file-chart-line', route: '/safety-officer/reports' },
            ];
        case 'FINANCIAL_ANALYST':
            return [
                { title: 'Financial Analytics', icon: 'ri-dashboard-3-line', route: '/financial-analyst' },
            ];
        default:
            return [];
    }
};

const RoleDashboardLayout = () => {
    const { user, loading, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        await handleLogout();
        navigate('/login');
    };

    // Still loading the user — render nothing (ProtectedRoute already shows a spinner above)
    if (!user && loading) return null;

    // No user and not loading — safety net redirect
    if (!user) return <Navigate to="/login" replace />;

    // Format role for display (e.g. FLEET_MANAGER → Fleet Manager)
    const formattedRole = user.role
        ? user.role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
        : '';

    const sidebar = (
        <Sidebar
            logo="TransitOps"
            logoIcon="ri-bus-wifi-line"
            user={{ name: user.name || user.email, role: formattedRole }}
            navItems={getNavItems(user.role)}
            onLogout={onLogout}
        />
    );

    return (
        <ToastProvider>
            <div className="t-root">
                <AppLayout sidebar={sidebar}>
                    <Outlet />
                </AppLayout>
            </div>
        </ToastProvider>
    );
};

export default RoleDashboardLayout;
