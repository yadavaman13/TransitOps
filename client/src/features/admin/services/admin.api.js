import axios from 'axios';

const adminApiInstance = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Admin Operations
export const listUsersApi = async (includeDeleted) => {
    const response = await adminApiInstance.get('/users', {
        params: { includeDeleted: !!includeDeleted },
    });
    return response.data;
};

export const updateUserRoleApi = async (userId, role) => {
    const response = await adminApiInstance.patch(`/users/${userId}/role`, { role });
    return response.data;
};

export const deleteUserApi = async (userId) => {
    const response = await adminApiInstance.delete(`/users/${userId}`);
    return response.data;
};
