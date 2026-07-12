import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { AppLayout, Sidebar, TopNavbar, ToastProvider } from '../../template/index.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import '../../template/styles/index.scss';
import NotificationsBell from '../components/NotificationsBell.jsx';

const RoleDashboardLayout = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        await handleLogout();
        navigate('/login');
    };

    if (!user) return null;

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
                    {
                        title: 'Finance Portal',
                        icon: 'ri-bank-card-line',
                        children: [
                            { title: 'Dashboard', icon: 'ri-bar-chart-box-line', route: '/fleet-manager/finance/dashboard' },
                            { title: 'Expenses', icon: 'ri-coins-line', route: '/fleet-manager/finance/expenses' },
                            { title: 'Fuel Logs', icon: 'ri-gas-station-line', route: '/fleet-manager/finance/fuel' },
                            { title: 'Reports & Analytics', icon: 'ri-line-chart-line', route: '/fleet-manager/finance/reports' },
                        ]
                    }
                ];
            case 'DRIVER':
                return [
                    { title: 'Dashboard', icon: 'ri-dashboard-3-line', route: '/driver' },
                    { title: 'My Trips', icon: 'ri-navigation-line', route: '/driver/trips' },
                    { title: 'Fuel Logs', icon: 'ri-gas-station-line', route: '/driver/fuel-logs' },
                    { title: 'Profile', icon: 'ri-user-line', route: '/driver/profile' },
                ];
            case 'SAFETY_OFFICER':
                return [
                    { title: 'Safety Overview', icon: 'ri-dashboard-3-line', route: '/safety-officer' },
                ];
            case 'FINANCIAL_ANALYST':
                return [
                    { title: 'Dashboard', icon: 'ri-bar-chart-box-line', route: '/financial-analyst' },
                    { title: 'Expenses', icon: 'ri-coins-line', route: '/financial-analyst/expenses' },
                    { title: 'Fuel Logs', icon: 'ri-gas-station-line', route: '/financial-analyst/fuel' },
                    { title: 'Reports & Analytics', icon: 'ri-line-chart-line', route: '/financial-analyst/reports' },
                ];
            default:
                return [];
        }
    };

    // Format role for user plate display (e.g. FLEET_MANAGER -> Fleet Manager)
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

    const topbar = (
        <TopNavbar
            title={`${formattedRole} Portal`}
            user={{ name: user.name || user.email, role: formattedRole }}
            actions={<NotificationsBell />}
        />
    );

    return (
        <ToastProvider>
            <div className="t-root">
                <AppLayout sidebar={sidebar} topbar={topbar}>
                    <Outlet />
                </AppLayout>
            </div>
        </ToastProvider>
    );
};

export default RoleDashboardLayout;
