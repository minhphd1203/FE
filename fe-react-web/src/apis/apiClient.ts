import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { clearAuthSession } from '../utils/authStorage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    const token = localStorage.getItem('token');
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.skipAuth && config.headers.Authorization) {
      delete config.headers.Authorization;
    }

    // Log report requests - DETAILED
    if (config.url?.includes('/reports')) {
      console.log('[API Interceptor] ===== REPORT REQUEST =====');
      console.log('[API Interceptor] URL:', config.url);
      console.log('[API Interceptor] Method:', config.method);
      console.log('[API Interceptor] Data object:', config.data);
      console.log(
        '[API Interceptor] Data keys:',
        config.data ? Object.keys(config.data) : 'NO DATA',
      );
      console.log(
        '[API Interceptor] reportedUserId in data:',
        config.data?.reportedUserId,
        'type:',
        typeof config.data?.reportedUserId,
      );
      console.log(
        '[API Interceptor] reportedBikeId in data:',
        config.data?.reportedBikeId,
        'type:',
        typeof config.data?.reportedBikeId,
      );
      console.log(
        '[API Interceptor] Data as JSON string:',
        JSON.stringify(config.data),
      );
      console.log('[API Interceptor] ===== END REPORT REQUEST =====');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor — chỉ “đá” login khi request đã gửi Bearer (tránh 401 đăng nhập / public)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authHeader = error.config?.headers?.Authorization;
      const hadBearer =
        typeof authHeader === 'string' && authHeader.startsWith('Bearer ');
      if (hadBearer) {
        clearAuthSession();
        store.dispatch(logout());
        const path = window.location.pathname;
        if (!path.startsWith('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
