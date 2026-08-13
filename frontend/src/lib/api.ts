import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach auth token from Zustand persisted store in localStorage
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          const token = parsed?.state?.accessToken;
          if (token) {
            (config.headers as any)['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch (err) {
        // ignore
      }
    }

    // For FormData: remove Content-Type so axios auto-sets multipart/form-data + boundary
    if (config.data instanceof FormData) {
      delete (config.headers as any)['Content-Type'];
    } else {
      if (!(config.headers as any)['Content-Type']) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        try {
          localStorage.removeItem('auth-storage');
        } catch {}
        window.location.href = '/admin/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
