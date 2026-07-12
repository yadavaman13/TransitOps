import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

// Dashboard Endpoints
export const getDashboardOverview = async () => {
    const res = await api.get('/dashboard');
    return res.data;
};

export const getDashboardKpis = async () => {
    const res = await api.get('/dashboard/kpis');
    return res.data;
};

export const getVehicleSummary = async () => {
    const res = await api.get('/dashboard/vehicle-summary');
    return res.data;
};

export const getDriverSummary = async () => {
    const res = await api.get('/dashboard/driver-summary');
    return res.data;
};

export const getTripSummary = async () => {
    const res = await api.get('/dashboard/trip-summary');
    return res.data;
};

export const getRecentActivities = async () => {
    const res = await api.get('/dashboard/recent-activities');
    return res.data;
};

// Vehicles Endpoints
export const listVehicles = async (status) => {
    const res = await api.get('/vehicles', { params: { status } });
    return res.data;
};

export const getAvailableVehicles = async () => {
    const res = await api.get('/vehicles/available');
    return res.data;
};

export const getVehicleDetails = async (id) => {
    const res = await api.get(`/vehicles/${id}`);
    return res.data;
};

export const getVehicleTrips = async (id) => {
    const res = await api.get(`/vehicles/${id}/trips`);
    return res.data;
};

export const getVehicleMaintenance = async (id) => {
    const res = await api.get(`/vehicles/${id}/maintenance`);
    return res.data;
};

export const getVehicleFuelLogs = async (id) => {
    const res = await api.get(`/vehicles/${id}/fuel-logs`);
    return res.data;
};

export const getVehicleExpenses = async (id) => {
    const res = await api.get(`/vehicles/${id}/expenses`);
    return res.data;
};

export const registerVehicle = async (data) => {
    const res = await api.post('/vehicles', data);
    return res.data;
};

export const updateVehicle = async (id, data) => {
    const res = await api.patch(`/vehicles/${id}`, data);
    return res.data;
};

export const deleteVehicle = async (id) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
};

export const updateVehicleStatus = async (id, status) => {
    const res = await api.patch(`/vehicles/${id}/status`, { status });
    return res.data;
};

export const retireVehicle = async (id) => {
    const res = await api.patch(`/vehicles/${id}/retire`);
    return res.data;
};

export const restoreVehicle = async (id) => {
    const res = await api.patch(`/vehicles/${id}/restore`);
    return res.data;
};

export const updateVehicleOdometer = async (id, odometer) => {
    const res = await api.patch(`/vehicles/${id}/odometer`, { odometer });
    return res.data;
};

// Drivers Endpoints
export const listDrivers = async () => {
    const res = await api.get('/drivers');
    return res.data;
};

export const getAvailableDrivers = async () => {
    const res = await api.get('/drivers/available');
    return res.data;
};

export const getExpiringLicenses = async () => {
    const res = await api.get('/drivers/expiring-license');
    return res.data;
};

export const getDriverDetails = async (id) => {
    const res = await api.get(`/drivers/${id}`);
    return res.data;
};

export const getDriverTrips = async (id) => {
    const res = await api.get(`/drivers/${id}/trips`);
    return res.data;
};

export const registerDriver = async (data) => {
    const res = await api.post('/drivers', data);
    return res.data;
};

export const updateDriver = async (id, data) => {
    const res = await api.patch(`/drivers/${id}`, data);
    return res.data;
};

export const deleteDriver = async (id) => {
    const res = await api.delete(`/drivers/${id}`);
    return res.data;
};

export const updateDriverStatus = async (id, status) => {
    const res = await api.patch(`/drivers/${id}/status`, { status });
    return res.data;
};

export const updateDriverLicense = async (id, data) => {
    const res = await api.patch(`/drivers/${id}/license`, data);
    return res.data;
};

export const updateDriverSafetyScore = async (id, safetyScore) => {
    const res = await api.patch(`/drivers/${id}/safety-score`, { safetyScore });
    return res.data;
};

export const suspendDriver = async (id) => {
    const res = await api.patch(`/drivers/${id}/suspend`);
    return res.data;
};

export const activateDriver = async (id) => {
    const res = await api.patch(`/drivers/${id}/activate`);
    return res.data;
};

// Trips Endpoints
export const listTrips = async (filters = {}) => {
    const res = await api.get('/trips', { params: filters });
    return res.data;
};

export const getTripDetails = async (id) => {
    const res = await api.get(`/trips/${id}`);
    return res.data;
};

export const getTripTimeline = async (id) => {
    const res = await api.get(`/trips/${id}/timeline`);
    return res.data;
};

export const createTrip = async (data) => {
    const res = await api.post('/trips', data);
    return res.data;
};

export const updateTrip = async (id, data) => {
    const res = await api.patch(`/trips/${id}`, data);
    return res.data;
};

export const deleteTrip = async (id) => {
    const res = await api.delete(`/trips/${id}`);
    return res.data;
};

export const dispatchTrip = async (id) => {
    const res = await api.post(`/trips/${id}/dispatch`);
    return res.data;
};

export const cancelTrip = async (id) => {
    const res = await api.post(`/trips/${id}/cancel`);
    return res.data;
};

export const startTrip = async (id) => {
    const res = await api.post(`/trips/${id}/start`);
    return res.data;
};

export const completeTrip = async (id, data) => {
    const res = await api.post(`/trips/${id}/complete`, data);
    return res.data;
};

// Maintenance Endpoints
export const listMaintenance = async (filters = {}) => {
    const res = await api.get('/maintenance', { params: filters });
    return res.data;
};

export const getActiveMaintenance = async () => {
    const res = await api.get('/maintenance/active');
    return res.data;
};

export const getVehicleMaintenanceHistory = async (vehicleId) => {
    const res = await api.get(`/maintenance/vehicle/${vehicleId}`);
    return res.data;
};

export const createMaintenance = async (data) => {
    const res = await api.post('/maintenance', data);
    return res.data;
};

export const updateMaintenance = async (id, data) => {
    const res = await api.patch(`/maintenance/${id}`, data);
    return res.data;
};

export const closeMaintenance = async (id) => {
    const res = await api.post(`/maintenance/${id}/close`);
    return res.data;
};

export const cancelMaintenance = async (id) => {
    const res = await api.post(`/maintenance/${id}/cancel`);
    return res.data;
};

// Fuel Logs Endpoints
export const listFuelLogs = async (filters = {}) => {
    const res = await api.get('/fuel-logs', { params: filters });
    return res.data;
};

export const getFuelSummary = async () => {
    const res = await api.get('/fuel-logs/summary');
    return res.data;
};

export const createFuelLog = async (data) => {
    const res = await api.post('/fuel-logs', data);
    return res.data;
};

export const updateFuelLog = async (id, data) => {
    const res = await api.patch(`/fuel-logs/${id}`, data);
    return res.data;
};

export const deleteFuelLog = async (id) => {
    const res = await api.delete(`/fuel-logs/${id}`);
    return res.data;
};

// Expenses Endpoints
export const listExpenses = async (filters = {}) => {
    const res = await api.get('/expenses', { params: filters });
    return res.data;
};

export const getExpenseSummary = async () => {
    const res = await api.get('/expenses/summary');
    return res.data;
};

export const createExpense = async (data) => {
    const res = await api.post('/expenses', data);
    return res.data;
};

export const updateExpense = async (id, data) => {
    const res = await api.patch(`/expenses/${id}`, data);
    return res.data;
};

export const deleteExpense = async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
};

// File Upload Endpoint
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

// Reports Endpoints
export const getFleetReport = async () => {
    const res = await api.get('/reports/fleet');
    return res.data;
};

export const getDriverReport = async () => {
    const res = await api.get('/reports/drivers');
    return res.data;
};

export const getTripReport = async () => {
    const res = await api.get('/reports/trips');
    return res.data;
};

export const getExpenseReport = async () => {
    const res = await api.get('/reports/expenses');
    return res.data;
};

export const getOperationalCostReport = async () => {
    const res = await api.get('/reports/operational-cost');
    return res.data;
};

// User Administration Endpoints
export const listUsers = async () => {
    const res = await api.get('/users');
    return res.data;
};

export const createSafetyOfficer = async (data) => {
    const res = await api.post('/users/safety-officer', data);
    return res.data;
};

export const createFinancialAnalyst = async (data) => {
    const res = await api.post('/users/financial-analyst', data);
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
};

// Personal / Company settings preferences
export const getSettings = async () => {
    const res = await api.get('/settings');
    return res.data;
};

export const updateSettings = async (data) => {
    const res = await api.patch('/settings', data);
    return res.data;
};

export const updateNotificationPrefs = async (prefs) => {
    const res = await api.patch('/settings/notifications', prefs);
    return res.data;
};

export const updateFleetRules = async (rules) => {
    const res = await api.patch('/settings/fleet-rules', rules);
    return res.data;
};

export const updateThemeSetting = async (theme) => {
    const res = await api.patch('/settings/theme', { theme });
    return res.data;
};

export const updateProfile = async (data) => {
    const res = await api.patch('/users/profile', data);
    return res.data;
};

export const changePassword = async (data) => {
    const res = await api.patch('/users/change-password', data);
    return res.data;
};
