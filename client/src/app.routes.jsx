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
import VehiclesPage from './features/fleet-manager/page/VehiclesPage';
import DriversPage from './features/fleet-manager/page/DriversPage';
import TripsPage from './features/fleet-manager/page/TripsPage';
import MaintenancePage from './features/fleet-manager/page/MaintenancePage';
import FuelExpensesPage from './features/fleet-manager/page/FuelExpensesPage';
import ReportsPage from './features/fleet-manager/page/ReportsPage';
import UsersPage from './features/fleet-manager/page/UsersPage';
import SettingsPage from './features/fleet-manager/page/SettingsPage';
import DriverDashboard from './features/driver/page/DriverDashboard';
import DriverTripsPage from './features/driver/page/DriverTripsPage';
import DriverFuelLogsPage from './features/driver/page/DriverFuelLogsPage';
import DriverProfilePage from './features/driver/page/DriverProfilePage';
import SafetyOfficerDashboard from './features/safety-officer/page/SafetyOfficerDashboard';
import SafetyDriversPage from './features/safety-officer/page/SafetyDriversPage';
import SafetyVehiclesPage from './features/safety-officer/page/SafetyVehiclesPage';
import SafetyMaintenancePage from './features/safety-officer/page/SafetyMaintenancePage';
import SafetyReportsPage from './features/safety-officer/page/SafetyReportsPage';
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
            },
            {
                path: 'vehicles',
                element: <VehiclesPage />
            },
            {
                path: 'drivers',
                element: <DriversPage />
            },
            {
                path: 'trips',
                element: <TripsPage />
            },
            {
                path: 'maintenance',
                element: <MaintenancePage />
            },
            {
                path: 'fuel-expenses',
                element: <FuelExpensesPage />
            },
            {
                path: 'reports',
                element: <ReportsPage />
            },
            {
                path: 'users',
                element: <UsersPage />
            },
            {
                path: 'settings',
                element: <SettingsPage />
            }
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
            },
            {
                path: 'trips',
                element: <DriverTripsPage />
            },
            {
                path: 'fuel-logs',
                element: <DriverFuelLogsPage />
            },
            {
                path: 'profile',
                element: <DriverProfilePage />
            }
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
            },
            {
                path: 'drivers',
                element: <SafetyDriversPage />
            },
            {
                path: 'vehicles',
                element: <SafetyVehiclesPage />
            },
            {
                path: 'maintenance',
                element: <SafetyMaintenancePage />
            },
            {
                path: 'reports',
                element: <SafetyReportsPage />
            }
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
