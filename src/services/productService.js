import api from './api';

export const productService = {
  // GET /products - Lista productos activos
  getAll: () => api.get('/products'),
  
  // POST /products - Crear o actualizar producto
  // Body: { sku, name, description, price, stock, lowStockThreshold }
  create: (data) => api.post('/products', data),
  
  // POST /products - También sirve para editar (si SKU existe, lo actualiza)
  update: (data) => api.post('/products', data),
  
  // DELETE /products/{id} - Soft delete (oculta pero no borra)
  delete: (id) => api.delete(`/products/${id}`),
};

// Alias para mantener compatibilidad
export const inventoryService = productService;
