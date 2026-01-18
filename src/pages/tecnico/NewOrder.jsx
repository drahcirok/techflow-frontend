import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

// Tipos de orden según backend
const ORDER_TYPES = {
  MANTENIMIENTO: {
    label: 'Mantenimiento',
    color: 'blue',
    description: 'Revisión y mantenimiento preventivo',
  },
  REPARACION: {
    label: 'Reparación',
    color: 'orange',
    description: 'Diagnóstico y reparación de fallas',
  },
  ENSAMBLE: {
    label: 'Ensamble',
    color: 'purple',
    description: 'Ensamble de equipos nuevos',
  },
};

const colorClasses = {
  blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
  orange: 'border-orange-500 bg-orange-500/10 text-orange-400',
  purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
};

const NewOrder = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [formData, setFormData] = useState({
    description: '',
    clientId: 1, // Por ahora fijo, luego se puede mejorar
    laborCost: '',
  });
  
  // Items de la orden (repuestos)
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar productos al montar
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Agregar item a la orden
  const addItem = () => {
    setOrderItems(prev => [...prev, { productSku: '', quantity: 1 }]);
  };

  // Actualizar item
  const updateItem = (index, field, value) => {
    setOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Eliminar item
  const removeItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calcular total estimado
  const calculateTotal = () => {
    const laborCost = parseFloat(formData.laborCost) || 0;
    const itemsTotal = orderItems.reduce((total, item) => {
      const product = products.find(p => p.sku === item.productSku);
      return total + (product?.price || 0) * (item.quantity || 0);
    }, 0);
    return laborCost + itemsTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast.error('Selecciona un tipo de servicio');
      return;
    }
    
    if (!formData.description) {
      toast.error('Ingresa una descripción');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Estructura según API real
      const orderData = {
        description: formData.description,
        type: selectedType,
        clientId: parseInt(formData.clientId) || 1,
        laborCost: parseFloat(formData.laborCost) || 0,
        items: orderItems.filter(item => item.productSku && item.quantity > 0),
      };
      
      const response = await orderService.create(orderData);
      
      // Mostrar el tracking code
      if (response.data?.trackingCode) {
        toast.success(
          <div>
            <p className="font-semibold">¡Orden creada!</p>
            <p className="text-sm mt-1">Código: {response.data.trackingCode}</p>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.success('Orden creada exitosamente');
      }
      
      navigate('/tecnico/dashboard');
    } catch (error) {
      // Error ya manejado por interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-white">Nueva Orden de Servicio</h1>
        <p className="text-slate-400">El sistema calculará el total automáticamente</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Paso 1: Tipo de servicio */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm flex items-center justify-center">1</span>
            Tipo de Servicio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(ORDER_TYPES).map(([key, type]) => {
              const isSelected = selectedType === key;
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedType(key)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left
                    ${isSelected 
                      ? colorClasses[type.color] 
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                >
                  <h3 className={`font-semibold text-lg mb-1 ${isSelected ? '' : 'text-white'}`}>
                    {type.label}
                  </h3>
                  <p className="text-sm text-slate-400">{type.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Paso 2: Descripción */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm flex items-center justify-center">2</span>
            Descripción del Trabajo
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Descripción del problema/servicio *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[120px]"
                placeholder="Ej: PC no da video, limpieza general..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  ID del Cliente
                </label>
                <input
                  type="number"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Costo de Mano de Obra ($)
                </label>
                <input
                  type="number"
                  name="laborCost"
                  value={formData.laborCost}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="30.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Paso 3: Repuestos */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white text-sm flex items-center justify-center">3</span>
              Repuestos (Opcional)
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar repuesto
            </button>
          </div>
          
          {loadingProducts ? (
            <div className="text-center py-8 text-slate-400">Cargando productos...</div>
          ) : orderItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-700 rounded-lg">
              <p>No hay repuestos agregados</p>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sky-400 hover:text-sky-300 text-sm"
              >
                + Agregar primer repuesto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item, index) => {
                const product = products.find(p => p.sku === item.productSku);
                return (
                  <div key={index} className="flex gap-4 items-start bg-slate-900 p-4 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">Producto</label>
                      <select
                        value={item.productSku}
                        onChange={(e) => updateItem(index, 'productSku', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Seleccionar...</option>
                        {products.map(p => (
                          <option key={p.sku} value={p.sku}>
                            {p.name} - ${p.price} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-slate-400 mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        min="1"
                        max={product?.stock || 999}
                      />
                    </div>
                    <div className="w-24 text-right">
                      <label className="block text-xs text-slate-400 mb-1">Subtotal</label>
                      <p className="py-2 text-emerald-400 font-semibold">
                        ${((product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-6 text-red-400 hover:text-red-300 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Resumen */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Mano de obra:</span>
              <span className="text-white">${parseFloat(formData.laborCost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Repuestos ({orderItems.length}):</span>
              <span className="text-white">
                ${orderItems.reduce((total, item) => {
                  const product = products.find(p => p.sku === item.productSku);
                  return total + (product?.price || 0) * (item.quantity || 0);
                }, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-700 text-lg font-semibold">
              <span className="text-white">Total estimado:</span>
              <span className="text-emerald-400">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedType}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Orden'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrder;
