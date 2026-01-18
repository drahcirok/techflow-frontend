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
    const message = error.response?.data?.message || error.response?.data || 'Error de conexión';
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Sesión expirada. Inicia sesión nuevamente.');
    } else if (error.response?.status >= 500) {
      toast.error(typeof message === 'string' ? message : 'Error del servidor. Verifica el stock.');
    } else if (error.response?.status === 400) {
      toast.error(typeof message === 'string' ? message : 'Datos inválidos');
    } else {
      toast.error(typeof message === 'string' ? message : 'Error de conexión');
    }
    
    return Promise.reject(error);
  }
);

export default api;
