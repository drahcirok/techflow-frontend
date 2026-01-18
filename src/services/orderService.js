import api from './api';

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getByClient: (clientId) => api.get(`/orders/client/${clientId}`),
  getByTracking: (trackingCode) => api.get(`/orders/tracking/${trackingCode}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};
