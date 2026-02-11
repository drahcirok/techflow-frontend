import api from './api';

export const userService = {
  // GET /users/me - Obtener perfil del usuario autenticado
  getMyProfile: () => api.get('/users/me'),

  // PUT /users/me - Actualizar perfil del usuario autenticado
  updateMyProfile: (data) => api.put('/users/me', data),

  // GET /users - Listar todos los usuarios (admin)
  getAll: () => api.get('/users'),

  // GET /users/clients - Listar clientes (para técnicos al crear órdenes)
  getClients: () => api.get('/users/clients'),

  // PUT /users/:id - Editar usuario (admin)
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  // GET /users/technician-ratings - Promedio de valoracion por tecnico
  getTechnicianRatings: () => api.get('/users/technician-ratings'),
};
