import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { AppLayout, Sidebar, TopNavbar, ToastProvider } from '../../template/index.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import '../../template/styles/index.scss';

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
                ];
            case 'DRIVER':
                return [
                    { title: 'Driver Dashboard', icon: 'ri-dashboard-3-line', route: '/driver' },
                ];
            case 'SAFETY_OFFICER':
                return [
                    { title: 'Safety Overview', icon: 'ri-dashboard-3-line', route: '/safety-officer' },
                ];
            case 'FINANCIAL_ANALYST':
                return [
                    { title: 'Financial Analytics', icon: 'ri-dashboard-3-line', route: '/financial-analyst' },
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
