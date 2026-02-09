import api from './api';

export const purchaseService = {
  // POST /purchases - Crear orden de compra
  create: (data) => api.post('/purchases', data),

  // GET /purchases/mine - Mis órdenes de compra
  getMyPurchases: () => api.get('/purchases/mine'),

  // GET /purchases/{id} - Obtener compra por ID
  getById: (id) => api.get(`/purchases/${id}`),

  // GET /purchases/number/{orderNumber} - Obtener compra por número
  getByNumber: (orderNumber) => api.get(`/purchases/number/${orderNumber}`),

  // PATCH /purchases/{id}/status - Actualizar estado (admin)
  updateStatus: (id, status) => api.patch(`/purchases/${id}/status`, null, {
    params: { status }
  }),

  // GET /purchases/all - Todas las compras (admin)
  getAll: () => api.get('/purchases/all'),

  // GET /purchases/status/{status} - Por estado (admin)
  getByStatus: (status) => api.get(`/purchases/status/${status}`),
};
