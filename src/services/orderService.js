import api from './api';

export const orderService = {
  // GET /orders - Listar todas las órdenes (requiere token)
  getAll: () => api.get('/orders'),
  
  // GET /orders/{id} - Obtener orden por ID
  getById: (id) => api.get(`/orders/${id}`),
  
  // POST /orders - Crear orden
  // Body: { description, type, clientId, laborCost, items: [{ productSku, quantity }] }
  // El backend calcula totalCost automáticamente y descuenta stock
  create: (data) => api.post('/orders', data),
  
  // PATCH /orders/{id}/status?status=REPARADO - Cambiar estado
  // Estados: PENDIENTE, DIAGNOSTICO, EN_ESPERA_REPUESTO, REPARADO, ENTREGADO, CANCELADO
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, null, { 
    params: { status } 
  }),
  
  // GET /orders/track/{trackingCode} - Rastreo público (NO requiere token)
  // Este endpoint es público para que el cliente pueda ver su orden
  getByTracking: (trackingCode) => api.get(`/orders/track/${trackingCode}`),
  
  // DELETE /orders/{id}
  delete: (id) => api.delete(`/orders/${id}`),
};
