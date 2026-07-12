import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

// Dashboard & Metrics
export async function getDashboardOverview() {
    const response = await api.get('/dashboard');
    return response.data.data || response.data;
}

// Driver Management
export async function getDrivers() {
    const response = await api.get('/drivers');
    return response.data.data || response.data;
}

export async function getExpiringLicenses() {
    const response = await api.get('/drivers/expiring-license');
    return response.data.data || response.data;
}

export async function updateDriverSafetyScore(id, safetyScore) {
    const response = await api.patch(`/drivers/${id}/safety-score`, { safetyScore });
    return response.data;
}

export async function updateDriverLicense(id, { licenseNumber, licenseExpiry }) {
    const response = await api.patch(`/drivers/${id}/license`, { licenseNumber, licenseExpiry });
    return response.data;
}

export async function suspendDriver(id) {
    const response = await api.patch(`/drivers/${id}/suspend`);
    return response.data;
}

export async function activateDriver(id) {
    const response = await api.patch(`/drivers/${id}/activate`);
    return response.data;
}

// Vehicle Management & Audits
export async function getVehicles() {
    const response = await api.get('/vehicles');
    return response.data.data || response.data;
}

export async function getVehicleDocuments(vehicleId) {
    const response = await api.get(`/vehicle-documents/${vehicleId}`);
    return response.data.data || response.data;
}

// Maintenance Management
export async function getMaintenance() {
    const response = await api.get('/maintenance');
    return response.data.data || response.data;
}

// Notifications
export async function getNotifications() {
    const response = await api.get('/notifications');
    return response.data.data || response.data;
}

export async function markNotificationAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
}

export async function markAllNotificationsAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
}
