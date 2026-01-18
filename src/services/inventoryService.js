import api from './api';

export const inventoryService = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  getBySku: (sku) => api.get(`/inventory/sku/${sku}`),
  getLowStock: () => api.get('/inventory/low-stock'),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  updateStock: (id, quantity) => api.patch(`/inventory/${id}/stock`, { quantity }),
  assignToOrder: (orderId, productId, quantity) => 
    api.post('/inventory/assign', { orderId, productId, quantity }),
  delete: (id) => api.delete(`/inventory/${id}`),
};
