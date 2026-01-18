import api from './api';

export const authService = {
  // POST /auth/login - { email, password }
  // Respuesta: { token: "eyJhbGci..." }
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // POST /auth/register - { name, email, password, role }
  register: (data) => api.post('/auth/register', data),
};
