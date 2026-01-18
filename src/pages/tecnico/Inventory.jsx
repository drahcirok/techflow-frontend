import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStock === 'low') {
      return matchesSearch && item.stock <= (item.lowStockThreshold || 5) && item.stock > 0;
    } else if (filterStock === 'out') {
      return matchesSearch && item.stock === 0;
    }
    return matchesSearch;
  });

  const getStockStatus = (item) => {
    if (item.stock === 0) {
      return { label: 'Agotado', color: 'bg-red-500/20 text-red-400' };
    } else if (item.stock <= (item.lowStockThreshold || 5)) {
      return { label: 'Stock Bajo', color: 'bg-yellow-500/20 text-yellow-400' };
    }
    return { label: 'Disponible', color: 'bg-green-500/20 text-green-400' };
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await productService.delete(id);
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (error) {
      // Error manejado por interceptor
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-slate-400">Control de stock de repuestos</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStock('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStock === 'all' 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStock('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStock === 'low' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Stock Bajo
            </button>
            <button
              onClick={() => setFilterStock('out')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStock === 'out' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Agotados
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Total Productos</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Stock Bajo</p>
          <p className="text-2xl font-bold text-yellow-400">
            {products.filter(i => i.stock <= (i.lowStockThreshold || 5) && i.stock > 0).length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Agotados</p>
          <p className="text-2xl font-bold text-red-400">
            {products.filter(i => i.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Producto</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-400">Stock</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Precio</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-400">Estado</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-400">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-white font-medium">{item.name}</span>
                          {item.description && (
                            <p className="text-slate-400 text-sm">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-semibold">{item.stock}</span>
                        <span className="text-slate-500 text-sm ml-1">/ {item.lowStockThreshold || 5} min</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white">${item.price?.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openModal(item)}
                          className="text-sky-400 hover:text-sky-300 text-sm font-medium mr-3"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

// Modal para crear/editar producto
const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    lowStockThreshold: product?.lowStockThreshold || 5,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name || !formData.price) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await productService.create({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
      });
      toast.success(product ? 'Producto actualizado' : 'Producto creado');
      onSave();
    } catch (error) {
      // Error manejado por interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">SKU *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="RAM-COR-8GB"
              disabled={!!product}
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Memoria RAM 8GB"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="DDR4 3200MHz"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Precio *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="45.50"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="20"
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Stock mínimo (alerta)</label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="5"
              min="0"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory;
