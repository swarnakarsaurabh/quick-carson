// src/services/api.js
// Ye file saare API calls handle karti hai
// Axios use karte hain - ek popular HTTP client library

import axios from 'axios';

// Backend ka base URL - ek jagah define karo taki baad mein change karna easy ho
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Axios instance banao with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────
//  Request Interceptor
// ─────────────────────────────────────────
// Har request se pehle ye run hoga - JWT token automatically add karega
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // stored token lao
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // header mein add karo
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────
//  Response Interceptor
// ─────────────────────────────────────────
// Har response ke baad ye run hoga - 401 errors handle karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expire ho gaya ya invalid hai - logout karo
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // login page pe redirect
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────
//  Auth API Functions
// ─────────────────────────────────────────

export const authAPI = {
  // Naya account banao
  register: (data) => api.post('/auth/register', data),
  
  // Login karo - token milega
  login: (data) => api.post('/auth/login', data),
  
  // Current user ki info lao
  getMe: () => api.get('/auth/me'),
};

// ─────────────────────────────────────────
//  Projects API Functions
// ─────────────────────────────────────────

export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ─────────────────────────────────────────
//  Tasks API Functions
// ─────────────────────────────────────────

export const tasksAPI = {
  // Optional filters: { project_id, status, priority }
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.status)     params.append('status', filters.status);
    if (filters.priority)   params.append('priority', filters.priority);
    return api.get(`/tasks/?${params.toString()}`);
  },
  
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// ─────────────────────────────────────────
//  Dashboard & Users
// ─────────────────────────────────────────

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const usersAPI = {
  getAll: () => api.get('/users/'),
};

export default api;
