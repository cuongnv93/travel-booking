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

    // Attach Accept-Language based on current URL path or navigator language
    if (typeof window !== 'undefined') {
      try {
        const pathSegments = window.location.pathname.split('/');
        const matchedLocale = pathSegments[1];
        if (['vi', 'en', 'zh', 'ko', 'ja'].includes(matchedLocale)) {
          (config.headers as any)['Accept-Language'] = matchedLocale;
        } else {
          (config.headers as any)['Accept-Language'] = 'vi';
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
      if (currentPath.includes('/admin') && !currentPath.includes('/admin/login')) {
        // Admin session expired → redirect to admin login
        try {
          localStorage.removeItem('auth-storage');
        } catch {}
        window.location.href = '/admin/login?expired=true';
      } else if (!currentPath.includes('/login') && !currentPath.includes('/admin')) {
        // Customer session expired → redirect to customer login preserving return URL
        try {
          localStorage.removeItem('auth-storage');
        } catch {}
        const returnUrl = encodeURIComponent(currentPath + window.location.search);
        // Detect locale from path (first segment)
        const segments = currentPath.split('/').filter(Boolean);
        const supportedLocales = ['vi', 'en', 'zh', 'ko', 'ja'];
        const locale = supportedLocales.includes(segments[0]) ? segments[0] : 'vi';
        window.location.href = `/${locale}/login?expired=true&returnUrl=${returnUrl}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
