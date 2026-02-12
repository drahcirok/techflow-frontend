import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const ORDER_TYPES = [
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', description: 'Limpieza, actualización de software, etc.' },
  { value: 'REPARACION', label: 'Reparación', description: 'Diagnóstico y solución de fallas' },
  { value: 'ENSAMBLE', label: 'Ensamble', description: 'Armado de equipos nuevos' },
];

const NewOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [clientMode, setClientMode] = useState('new'); // 'new' o 'existing'
  const [selectedClientId, setSelectedClientId] = useState('');

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    type: '',
    brandModel: '',
    serialNumber: '',
    description: '',
    laborCost: '',
  });

  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchClients();
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

  const fetchClients = async () => {
    try {
      const response = await userService.getClients();
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleClientModeChange = (mode) => {
    setClientMode(mode);
    if (mode === 'new') {
      setSelectedClientId('');
      setFormData(prev => ({ ...prev, clientName: '', clientPhone: '', clientEmail: '' }));
    }
  };

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === parseInt(clientId));
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.name || '',
        clientPhone: client.phone || '',
        clientEmail: client.email || ''
      }));
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

    // Validar datos del cliente
    if (clientMode === 'existing' && !selectedClientId) {
      toast.error('Selecciona un cliente de la lista');
      return;
    }
    if (clientMode === 'new' && !formData.clientEmail) {
      toast.error('Ingresa el correo electrónico del cliente');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        description: `${formData.brandModel ? formData.brandModel + ' - ' : ''}${formData.description}`,
        type: formData.type,
        laborCost: parseFloat(formData.laborCost) || 0,
        items: orderItems.filter(item => item.productSku && item.quantity > 0),
      };

      // Si es cliente existente, enviar clientId
      if (clientMode === 'existing' && selectedClientId) {
        orderData.clientId = parseInt(selectedClientId);
      } else {
        // Si es cliente nuevo, enviar sus datos
        orderData.clientEmail = formData.clientEmail;
        orderData.clientName = formData.clientName;
        orderData.clientPhone = formData.clientPhone;
      }

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
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Nueva Orden de Servicio</h1>
        <p className="text-slate-500 mb-8">Registra un nuevo equipo para reparación o mantenimiento</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección 1: Datos del Cliente */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">1</span>
              <h2 className="text-lg font-semibold text-slate-800">Datos del Cliente</h2>
            </div>

            {/* Selector de modo: Cliente existente o nuevo */}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => handleClientModeChange('existing')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  clientMode === 'existing'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cliente Registrado
                </div>
                <p className="text-xs text-slate-500 mt-1">Seleccionar de la lista</p>
              </button>
              <button
                type="button"
                onClick={() => handleClientModeChange('new')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  clientMode === 'new'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Cliente Nuevo
                </div>
                <p className="text-xs text-slate-500 mt-1">Ingresar datos manualmente</p>
              </button>
            </div>

            {/* Selector de cliente existente */}
            {clientMode === 'existing' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Cliente *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Seleccionar cliente --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">No hay clientes registrados aún</p>
                )}
              </div>
            )}

            {/* Datos del cliente (mostrar siempre, pero en modo existente solo lectura) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo {clientMode === 'new' && '*'}
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  disabled={clientMode === 'existing'}
                  className={`w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    clientMode === 'existing' ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                  }`}
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
                  disabled={clientMode === 'existing'}
                  className={`w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    clientMode === 'existing' ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="+593 99..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  disabled={clientMode === 'existing'}
                  className={`w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    clientMode === 'existing' ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="cliente@email.com"
                />
                {clientMode === 'new' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Si el cliente crea una cuenta con este email, podrá ver esta orden automáticamente
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Sección 2: Detalle del Servicio */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">2</span>
              <h2 className="text-lg font-semibold text-slate-800">Detalle del Servicio</h2>
            </div>
            
            {/* Tipo de servicio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo de Servicio *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ORDER_TYPES.map(type => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className={`font-semibold ${formData.type === type.value ? 'text-sky-700' : 'text-slate-800'}`}>
                      {type.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">{type.description}</span>
                    {formData.type === type.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
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
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Opcional"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción del Problema / Solicitud *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="El equipo se calienta mucho y hace ruido al encender..."
                />
              </div>
            </div>
          </section>

          {/* Sección 3: Repuestos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">3</span>
                <h2 className="text-lg font-semibold text-slate-800">Repuestos (Opcional)</h2>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar repuesto
              </button>
            </div>
            
            {orderItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>No hay repuestos agregados</p>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-2 text-sky-500 hover:text-sky-600 text-sm font-medium"
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
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="">Seleccionar...</option>
                          {products.filter(p => p.stock > 0).map(p => (
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
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          min="1"
                          max={product?.stock || 99}
                        />
                      </div>
                      <div className="w-24 text-right">
                        <label className="block text-xs text-slate-500 mb-1">Subtotal</label>
                        <p className="py-2 text-sky-600 font-semibold">
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
              <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">4</span>
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
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  <span className="text-sky-600">${calculateTotal().toFixed(2)}</span>
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
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/30"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Crear Orden
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
