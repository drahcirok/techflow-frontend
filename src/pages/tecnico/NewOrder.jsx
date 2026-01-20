import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

const ORDER_TYPES = [
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'REPARACION', label: 'Reparación' },
  { value: 'ENSAMBLE', label: 'Ensamble' },
];

const NewOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const [formData, setFormData] = useState({
    // Datos del cliente
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    // Detalle del servicio
    type: '',
    brandModel: '',
    serialNumber: '',
    description: '',
    // Costos
    laborCost: '',
    clientId: 1,
  });
  
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const addItem = () => {
    setOrderItems(prev => [...prev, { productSku: '', quantity: 1 }]);
  };

  const updateItem = (index, field, value) => {
    setOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

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
    
    if (!formData.type) {
      toast.error('Selecciona un tipo de servicio');
      return;
    }
    
    if (!formData.description) {
      toast.error('Ingresa una descripción del problema');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const orderData = {
        description: `${formData.brandModel ? formData.brandModel + ' - ' : ''}${formData.description}`,
        type: formData.type,
        clientId: parseInt(formData.clientId) || 1,
        laborCost: parseFloat(formData.laborCost) || 0,
        items: orderItems.filter(item => item.productSku && item.quantity > 0),
      };
      
      const response = await orderService.create(orderData);
      
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
      // Error manejado por interceptor
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
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Tablero
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Nueva Orden de Servicio</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección 1: Datos del Cliente */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">1</span>
              <h2 className="text-lg font-semibold text-slate-800">Datos del Cliente</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. Roberto Gomez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+593 99..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
          </section>

          {/* Sección 2: Detalle del Servicio */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">2</span>
              <h2 className="text-lg font-semibold text-slate-800">Detalle del Servicio (Factory Pattern)</h2>
            </div>
            
            {/* Tipo de servicio */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                </svg>
                <div>
                  <p className="font-medium text-blue-800">Seleccione el Tipo de Servicio</p>
                  <p className="text-sm text-blue-600">Esta selección determinará el flujo de trabajo interno (Patrón Factory).</p>
                </div>
              </div>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Seleccionar Tipo --</option>
                {ORDER_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Marca / Modelo
                </label>
                <input
                  type="text"
                  name="brandModel"
                  value={formData.brandModel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. Dell Inspiron 15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Número de Serie
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder=""
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción del Problema / Solicitud
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="El equipo se calienta mucho y hace ruido..."
                />
              </div>
            </div>
          </section>

          {/* Sección 3: Repuestos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">3</span>
                <h2 className="text-lg font-semibold text-slate-800">Repuestos (Opcional)</h2>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar repuesto
              </button>
            </div>
            
            {orderItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                <p>No hay repuestos agregados</p>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  + Agregar primer repuesto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => {
                  const product = products.find(p => p.sku === item.productSku);
                  return (
                    <div key={index} className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Producto</label>
                        <select
                          value={item.productSku}
                          onChange={(e) => updateItem(index, 'productSku', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <label className="block text-xs text-slate-500 mb-1">Cantidad</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                      <div className="w-24 text-right">
                        <label className="block text-xs text-slate-500 mb-1">Subtotal</label>
                        <p className="py-2 text-green-600 font-semibold">
                          ${((product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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

          {/* Sección 4: Costos */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">4</span>
              <h2 className="text-lg font-semibold text-slate-800">Costos</h2>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mano de Obra ($)
                  </label>
                  <input
                    type="number"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Mano de obra:</span>
                  <span className="text-slate-700">${parseFloat(formData.laborCost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Repuestos ({orderItems.length}):</span>
                  <span className="text-slate-700">
                    ${orderItems.reduce((total, item) => {
                      const product = products.find(p => p.sku === item.productSku);
                      return total + (product?.price || 0) * (item.quantity || 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                  <span className="text-slate-800">Total Estimado:</span>
                  <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.type}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
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
    </div>
  );
};

export default NewOrder;
