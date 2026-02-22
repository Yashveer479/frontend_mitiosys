import axios from 'axios';
import { API_BASE_URL } from './urlConfig';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
