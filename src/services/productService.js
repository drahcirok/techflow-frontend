import api from './api';

export const productService = {
  // GET /products - Lista productos activos
  getAll: () => api.get('/products'),
  
  // POST /products - Crear o actualizar producto
  // Body: { sku, name, description, price, stock, lowStockThreshold }
  create: (data) => api.post('/products', data),
  
  // PUT /products/{id} - Actualizar producto existente
  update: (id, data) => api.put(`/products/${id}`, data),
  
  // DELETE /products/{id} - Soft delete (oculta pero no borra)
  delete: (id) => api.delete(`/products/${id}`),

  // GET /products/available - Productos disponibles para la tienda (con stock > 0)
  getAvailableProducts: () => api.get('/products/available'),
};

// Alias para mantener compatibilidad
export const inventoryService = productService;
