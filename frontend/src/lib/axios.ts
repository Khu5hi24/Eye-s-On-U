import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor to attach Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[axios] attached Bearer token to request', {
        url: config.url,
        method: config.method,
        hasToken: true,
      });
    } else {
      console.log('[axios] no token found in localStorage for request', {
        url: config.url,
        method: config.method,
      });
    }

    return config;
  },
  (error) => {
    console.error('[axios] request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message;
    const url = error?.config?.url;

    if (status && status >= 400 && status < 500) {
      console.warn(`[axios] client error (${status}) on ${url}: ${message}`);
    } else {
      console.error('[axios] response error', {
        status: status || 'unknown',
        message: message || 'unknown error',
        url: url || 'unknown url',
      });
    }
    return Promise.reject(error);
  }
);

export default api;
