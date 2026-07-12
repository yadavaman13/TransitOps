import axios from 'axios';

const financeApiInstance = axios.create({
    baseURL: '/api/finance',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getDashboardOverviewApi = async () => {
    const response = await financeApiInstance.get('/dashboard');
    return response.data;
};

export const getExpensesApi = async (params = {}) => {
    const response = await financeApiInstance.get('/expenses', { params });
    return response.data;
};

export const createExpenseApi = async (data) => {
    const response = await financeApiInstance.post('/expenses', data);
    return response.data;
};

export const getFuelLogsApi = async () => {
    const response = await financeApiInstance.get('/fuel');
    return response.data;
};

export const getReportsApi = async () => {
    const response = await financeApiInstance.get('/reports');
    return response.data;
};

export const createFuelLogApi = async (data) => {
    const response = await axios.post('/api/fuel-logs', data, { withCredentials: true });
    return response.data;
};
