import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { AppLayout, Sidebar, TopNavbar, ToastProvider } from '../index.js';
import '../styles/index.scss';

const TemplateDemoLayout = () => {
    const navigate = useNavigate();

    const user = { name: 'ERP Tester', role: 'ADMIN' };

    const navItems = [
        { title: 'Dashboard Demo', icon: 'ri-dashboard-3-line', route: '/demo/dashboard' },
        { title: 'CRUD Demo', icon: 'ri-database-2-line', route: '/demo/crud' },
    ];

    const sidebar = (
        <Sidebar
            logo="ERP Starter Kit"
            logoIcon="ri-shield-flash-line"
            user={user}
            navItems={navItems}
            onLogout={() => console.log('logout')}
        />
    );

    const topbar = (
        <TopNavbar
            title="ERP Component Playground"
            user={user}
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

export default TemplateDemoLayout;
