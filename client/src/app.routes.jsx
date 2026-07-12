import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import VerifyEmail from './features/auth/pages/VerifyEmail';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { useAuth } from './features/auth/hooks/useAuth';

import RoleDashboardLayout from './features/shared/layouts/RoleDashboardLayout';
import FleetManagerDashboard from './features/fleet-manager/page/FleetManagerDashboard';
import DriverDashboard from './features/driver/page/DriverDashboard';
import SafetyOfficerDashboard from './features/safety-officer/page/SafetyOfficerDashboard';
import FinancialAnalystDashboard from './features/financial-analyst/page/FinancialAnalystDashboard';

import TemplateDemoLayout from './features/template/pages/TemplateDemoLayout';
import DashboardTemplatePage from './features/template/pages/DashboardTemplatePage';
import CrudTemplatePage from './features/template/pages/CrudTemplatePage';

// Centralized role-based redirection component at "/"
const RootRedirect = () => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'FLEET_MANAGER':
            return <Navigate to="/fleet-manager/" replace />;
        case 'DRIVER':
            return <Navigate to="/driver/" replace />;
        case 'SAFETY_OFFICER':
            return <Navigate to="/safety-officer/" replace />;
        case 'FINANCIAL_ANALYST':
            return <Navigate to="/financial-analyst/" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};

export const router = createBrowserRouter([
    {
        path: '/demo',
        element: <TemplateDemoLayout />,
        children: [
            {
                path: 'dashboard',
                element: <DashboardTemplatePage />
            },
            {
                path: 'crud',
                element: <CrudTemplatePage />
            },
            {
                index: true,
                element: <Navigate to="dashboard" replace />
            }
        ]
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <RootRedirect />
            </ProtectedRoute>
        ),
    },
    {
        path: '/fleet-manager',
        element: (
            <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
                <RoleDashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <FleetManagerDashboard />
            }
            // To add a new child route / tab under Fleet Manager, register it here:
            // e.g. { path: 'vehicles', element: <VehiclesPage /> }
        ]
    },
    {
        path: '/driver',
        element: (
            <ProtectedRoute allowedRoles={['DRIVER']}>
                <RoleDashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DriverDashboard />
            }
            // To add a new child route / tab under Driver, register it here:
            // e.g. { path: 'trips', element: <DriverTripsPage /> }
        ]
    },
    {
        path: '/safety-officer',
        element: (
            <ProtectedRoute allowedRoles={['SAFETY_OFFICER']}>
                <RoleDashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <SafetyOfficerDashboard />
            }
            // To add a new child route / tab under Safety Officer, register it here:
            // e.g. { path: 'incidents', element: <IncidentsPage /> }
        ]
    },
    {
        path: '/financial-analyst',
        element: (
            <ProtectedRoute allowedRoles={['FINANCIAL_ANALYST']}>
                <RoleDashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <FinancialAnalystDashboard />
            }
            // To add a new child route / tab under Financial Analyst, register it here:
            // e.g. { path: 'expenses', element: <ExpensesPage /> }
        ]
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/verify-email',
        element: <VerifyEmail />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    }
]);
