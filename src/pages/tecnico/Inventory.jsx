import { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStockStatus = (item) => {
    if (item.stock === 0) {
      return { label: 'Agotado', color: 'bg-red-100 text-red-600' };
    } else if (item.stock <= (item.lowStockThreshold || 5)) {
      return { label: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: 'Disponible', color: 'bg-green-100 text-green-600' };
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
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500">Control de stock de repuestos</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Producto</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Stock</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Precio</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
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
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-500">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-slate-800 font-medium">{item.name}</span>
                          {item.description && (
                            <p className="text-slate-400 text-sm">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-800 font-semibold">{item.stock}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-800 font-medium">${item.price?.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openModal(item)}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium mr-3"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">SKU *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="RAM-COR-8GB"
              disabled={!!product}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Memoria RAM 8GB"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DDR4 3200MHz"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Precio *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="45.50"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20"
                min="0"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-xl font-semibold transition-colors"
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
