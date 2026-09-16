// import axios from 'axios';

// // const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL ?? '/api';
// const API_BASE_URL = "https://api-monitoring-app-server.onrender.com/api";

// // const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 
// //     (import.meta?.env?.MODE === 'production' 
// //         ? 'https://server-api-app-latest.onrender.com/api' 
// //         : '/api');

// const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     withCredentials: true,
// });
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         const isAuthRoute = error.config?.url?.includes('/auth/');
//         if (error.response?.status === 401 && !isAuthRoute) {
//             window.dispatchEvent(new Event('auth:unauthorized'));
//         }
//         return Promise.reject(error);
//     }
// );

// export const authApi = {
//     login: async (credentials) => {
//         const response = await api.post('/auth/login', credentials);
//         return response.data;
//     },
//     register: async (userData) => {
//         const response = await api.post('/auth/register', userData);
//         return response.data;
//     },
//     getProfile: async (options) => {
//         const response = await api.get('/auth/profile', { signal: options?.signal });
//         return response.data;
//     },
//     logout: async () => {
//         const response = await api.post('/auth/logout');
//         return response.data;
//     },
//     updateProfile: async (profileData) => {
//         const response = await api.put('/auth/profile', profileData);
//         return response.data;
//     },
// };

// export const analyticsApi = {
//     getDashboard: async () => {
//         const response = await api.get('/analytics/dashboard');
//         const payload = response.data || {};

//         payload.data = payload.data || {};

//         payload.data.stats = payload.data.stats ?? {
//             totalHits: 0,
//             avgLatency: 0,
//             errorRate: 0,
//             errorHits: 0,
//             successHits: 0,
//             uniqueServices: 0,
//             uniqueEndpoints: 0,
//         };

//         payload.data.topEndpoints = payload.data.topEndpoints ?? [];
//         payload.data.recentActivity = payload.data.recentActitivy ?? payload.data.recentActivity ?? [];

//         return payload;
//     },
//     getStats: async (params) => {
//         const response = await api.get('/analytics/stats', { params });
//         return response.data;
//     },
//     getTopEndpoints: async (params) => {
//         const response = await api.get('/analytics/top-endpoints', { params });
//         return response.data;
//     },
//     getTimeSeries: async (params) => {
//         const response = await api.get('/analytics/time-series', { params });
//         return response.data;
//     },
// };

// export const clientApi = {
//     getCurrentClient: async () => {
//         const response = await api.get('/clients/current');
//         return response.data;
//     },
//     getClientDashboard: async (clientId) => {
//         const params = clientId ? { clientId } : {};
//         const response = await api.get('/clients/dashboard', { params });
//         return response.data;
//     },
//     createClient: async (clientData) => {
//         const response = await api.post('/admin/clients', clientData);
//         return response.data;
//     },
//     getClients: async (params) => {
//         const response = await api.get('/admin/clients', { params });
//         return response.data;
//     },
//     createApiKey: async (clientId, keyData) => {
//         const response = await api.post(`/admin/clients/${clientId}/api/keys`, keyData);
//         return response.data;
//     },
//     getClientApiKeys: async (clientId) => {
//         const response = await api.get(`/admin/clients/${clientId}/api/keys`);
//         return response.data;
//     },
// };

// export default api;



import axios from 'axios';


const API_BASE_URL = "https://api-monitoring-app-server.onrender.com/api";



const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true hata diya kyunki ab hum Cookie use nahi karenge
});

// REQUEST INTERCEPTOR: Har API request se pehle localStorage se token nikal kar header me daalega
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Agar token expire ho jaye ya invalid ho (401), toh logout trigger karega
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRoute = error.config?.url?.includes('/auth/');
        if (error.response?.status === 401 && !isAuthRoute) {
            // Agar unauthorized aaye, toh token clear kar do taaki agle login mein issue na ho
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        // Backend se jo token aayega, usko localStorage mein save kar lo
        const token = response.data?.data?.token || response.data?.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        const token = response.data?.data?.token || response.data?.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        return response.data;
    },
    getProfile: async (options) => {
        const response = await api.get('/auth/profile', { signal: options?.signal });
        return response.data;
    },
    logout: async () => {
        // Logout par local storage se token delete kar do
        localStorage.removeItem('token');
        const response = await api.post('/auth/logout');
        return response.data;
    },
    updateProfile: async (profileData) => {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    },
};

export const analyticsApi = {
    getDashboard: async () => {
        const response = await api.get('/analytics/dashboard');
        const payload = response.data || {};

        payload.data = payload.data || {};

        payload.data.stats = payload.data.stats ?? {
            totalHits: 0,
            avgLatency: 0,
            errorRate: 0,
            errorHits: 0,
            successHits: 0,
            uniqueServices: 0,
            uniqueEndpoints: 0,
        };

        payload.data.topEndpoints = payload.data.topEndpoints ?? [];
        payload.data.recentActivity = payload.data.recentActitivy ?? payload.data.recentActivity ?? [];

        return payload;
    },
    getStats: async (params) => {
        const response = await api.get('/analytics/stats', { params });
        return response.data;
    },
    getTopEndpoints: async (params) => {
        const response = await api.get('/analytics/top-endpoints', { params });
        return response.data;
    },
    getTimeSeries: async (params) => {
        const response = await api.get('/analytics/time-series', { params });
        return response.data;
    },
};

export const clientApi = {
    getCurrentClient: async () => {
        const response = await api.get('/clients/current');
        return response.data;
    },
    getClientDashboard: async (clientId) => {
        const params = clientId ? { clientId } : {};
        const response = await api.get('/clients/dashboard', { params });
        return response.data;
    },
    createClient: async (clientData) => {
        const response = await api.post('/admin/clients', clientData);
        return response.data;
    },
    getClients: async (params) => {
        const response = await api.get('/admin/clients', { params });
        return response.data;
    },
    createApiKey: async (clientId, keyData) => {
        const response = await api.post(`/admin/clients/${clientId}/api/keys`, keyData);
        return response.data;
    },
    getClientApiKeys: async (clientId) => {
        const response = await api.get(`/admin/clients/${clientId}/api/keys`);
        return response.data;
    },
};

export default api;

