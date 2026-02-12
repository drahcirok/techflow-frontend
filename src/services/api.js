import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
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

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (backend unreachable) - DON'T logout
    if (!error.response) {
      toast.error('Error de conexión. Verifica tu internet.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = data?.message || data || 'Error de conexión';

    // 401 Unauthorized - check if it's actually a token issue
    if (status === 401) {
      const isTokenError =
        message?.toLowerCase().includes('token') ||
        message?.toLowerCase().includes('expired') ||
        message?.toLowerCase().includes('unauthorized');

      if (isTokenError) {
        // Legitimate token issue - logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Sesión expirada. Inicia sesión nuevamente.');
      } else {
        // Other 401 - show error but don't logout
        toast.error(typeof message === 'string' ? message : 'No autorizado');
      }
    }
    // 403 Forbidden - permission denied (DON'T logout)
    else if (status === 403) {
      toast.error('No tienes permisos para realizar esta acción');
    }
    // Server errors
    else if (status >= 500) {
      toast.error(typeof message === 'string' ? message : 'Error del servidor');
    }
    // Bad request
    else if (status === 400) {
      toast.error(typeof message === 'string' ? message : 'Datos inválidos');
    }
    // Other errors
    else {
      toast.error(typeof message === 'string' ? message : 'Error de conexión');
    }

    return Promise.reject(error);
  }
);

export default api;
