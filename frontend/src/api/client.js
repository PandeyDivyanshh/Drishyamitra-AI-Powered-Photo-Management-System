import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── JWT interceptor ────────────────────────────────────────
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('drishyamitra_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('drishyamitra_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── Auth ────────────────────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// ── Upload ─────────────────────────────────────────────────
export const uploadPhoto = (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
            if (onProgress && e.total) {
                onProgress(Math.round((e.loaded * 100) / e.total));
            }
        },
    });
};

// ── Chat ────────────────────────────────────────────────────
export const sendChat = (message) => API.post('/chat', { message });

// ── Search ─────────────────────────────────────────────────
export const searchPhotos = (params) => API.get('/search', { params });

export default API;
