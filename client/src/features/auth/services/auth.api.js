import axios from 'axios';

const authApiInstance = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
});

export async function register({ name, email, password }) {
    try {
        const response = await authApiInstance.post('/register', {
            name,
            email,
            password,
        });
        return response.data;
    } catch (err) {
        throw err;
    }
}

export async function login({ email, password }) {
    try {
        const response = await authApiInstance.post('/login', {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function verifyEmail({ email, otp }) {
    try {
        const response = await authApiInstance.post('/verify-email', {
            email,
            otp,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function resendOtp({ email, purpose }) {
    try {
        const response = await authApiInstance.post('/resend-otp', {
            email,
            purpose,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function requestPasswordReset({ email }) {
    try {
        const response = await authApiInstance.post('/forgot-password', {
            email,
        });
        return response.data;
    } catch (err) {
        throw err;
    }
}

export async function resetPassword({ email, otp, password, confirmPassword }) {
    try {
        const response = await authApiInstance.post('/reset-password', {
            email,
            otp,
            password,
            confirmPassword,
        });
        return response.data;
    } catch (err) {
        throw err;
    }
}

export async function logout() {
    try {
        await authApiInstance.post('/logout');
    } catch (err) {
        console.error('Logout Failed', err);
    }
}

export async function getMe() {
    try {
        const response = await authApiInstance.get('/get-me');
        return response.data;
    } catch (err) {
        console.error('Failed to fetch user data', err);
        return null;
    }
}
