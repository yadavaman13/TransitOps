import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

// Driver details (profile, safety score, etc)
export const getDriverDetails = async (userId) => {
    const res = await api.get(`/drivers/${userId}`);
    return res.data;
};

// Trips
export const getDriverTrips = async () => {
    const res = await api.get('/trips');
    return res.data;
};

export const startTrip = async (tripId) => {
    const res = await api.post(`/trips/${tripId}/start`);
    return res.data;
};

export const completeTrip = async (tripId, data) => {
    const res = await api.post(`/trips/${tripId}/complete`, data);
    return res.data;
};

export const getTripTimeline = async (tripId) => {
    const res = await api.get(`/trips/${tripId}/timeline`);
    return res.data;
};

export const getTripDetails = async (tripId) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
};

// Fuel Logs
export const getFuelLogs = async () => {
    const res = await api.get('/fuel-logs');
    return res.data;
};

export const createFuelLog = async (data) => {
    const res = await api.post('/fuel-logs', data);
    return res.data;
};

// User Profile Actions
export const updateProfile = async (data) => {
    const res = await api.patch('/users/profile', data);
    return res.data;
};

export const changePassword = async (data) => {
    const res = await api.patch('/users/change-password', data);
    return res.data;
};

export const updateProfileImage = async (formData) => {
    const res = await api.patch('/users/profile-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};
