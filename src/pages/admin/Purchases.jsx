import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDIENTE: 'bg-amber-100 text-amber-700 border-amber-200',
  PROCESANDO: 'bg-sky-100 text-sky-700 border-sky-200',
  ENVIADO: 'bg-purple-100 text-purple-700 border-purple-200',
  ENTREGADO: 'bg-green-100 text-green-700 border-green-200',
  CANCELADO: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  PROCESANDO: 'Procesando',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const STATUS_OPTIONS = ['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

const Purchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await purchaseService.getAll();
      setPurchases(response.data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Error al cargar las compras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (purchaseId, newStatus) => {
    try {
      await purchaseService.updateStatus(purchaseId, newStatus);
      toast.success('Estado actualizado correctamente');
      fetchPurchases();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const getFilteredPurchases = () => {
    let filtered = purchases;

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(p =>
        p.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStats = () => {
    const total = purchases.length;
    const pendientes = purchases.filter(p => p.status === 'PENDIENTE').length;
    const procesando = purchases.filter(p => p.status === 'PROCESANDO').length;
    const enviado = purchases.filter(p => p.status === 'ENVIADO').length;
    const entregado = purchases.filter(p => p.status === 'ENTREGADO').length;
    const totalVentas = purchases
      .filter(p => p.status === 'ENTREGADO')
      .reduce((sum, p) => sum + (p.total || 0), 0);

    return { total, pendientes, procesando, enviado, entregado, totalVentas };
  };

  const stats = getStats();
  const filteredPurchases = getFilteredPurchases();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Compras</h1>
        <p className="text-slate-500">Administra todas las compras de la tienda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 text-sm mb-1">Total Compras</div>
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="text-amber-700 text-sm mb-1">Pendientes</div>
          <div className="text-2xl font-bold text-amber-700">{stats.pendientes}</div>
        </div>
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
          <div className="text-sky-700 text-sm mb-1">Procesando</div>
          <div className="text-2xl font-bold text-sky-700">{stats.procesando}</div>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <div className="text-purple-700 text-sm mb-1">Enviados</div>
          <div className="text-2xl font-bold text-purple-700">{stats.enviado}</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-green-700 text-sm mb-1">Entregados</div>
          <div className="text-2xl font-bold text-green-700">{stats.entregado}</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="text-slate-300 text-sm mb-1">Total Ventas</div>
          <div className="text-2xl font-bold text-white">${stats.totalVentas.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por código, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filtrar por Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="ALL">Todos los estados</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      {filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No se encontraron compras</h2>
          <p className="text-slate-500">Intenta cambiar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPurchases.map((purchase) => (
                  <>
                    <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-sky-600">
                          {purchase.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{purchase.clientName}</p>
                          <p className="text-xs text-slate-500">{purchase.clientEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">
                          ${(purchase.total || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={purchase.status}
                          onChange={(e) => handleStatusChange(purchase.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border cursor-pointer ${STATUS_COLORS[purchase.status] || 'bg-slate-100 text-slate-600'}`}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(expandedId === purchase.id ? null : purchase.id)}
                          className="text-sky-500 hover:text-sky-600 font-medium text-sm flex items-center gap-1"
                        >
                          {expandedId === purchase.id ? 'Ocultar' : 'Ver más'}
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedId === purchase.id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedId === purchase.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-slate-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Detalles de la compra */}
                            <div>
                              <h4 className="font-semibold text-slate-800 mb-3">Información de Envío</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-slate-500">Dirección:</span>
                                  <p className="text-slate-800">{purchase.shippingAddress}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Teléfono:</span>
                                  <p className="text-slate-800">{purchase.clientPhone || 'No especificado'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Método de Pago:</span>
                                  <p className="text-slate-800 font-medium">{purchase.paymentMethod || 'EFECTIVO'}</p>
                                </div>
                                {purchase.notes && (
                                  <div>
                                    <span className="text-slate-500">Notas:</span>
                                    <p className="text-slate-800">{purchase.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Productos */}
                            <div>
                              <h4 className="font-semibold text-slate-800 mb-3">Productos</h4>
                              <div className="space-y-2">
                                {purchase.items && purchase.items.length > 0 ? (
                                  purchase.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded border border-slate-200">
                                      <span className="text-slate-700">
                                        {item.productName} <span className="text-slate-400">x{item.quantity}</span>
                                      </span>
                                      <span className="font-medium text-slate-800">
                                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-400 text-sm">No hay productos</p>
                                )}
                                <div className="pt-2 border-t border-slate-300 mt-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Subtotal:</span>
                                    <span className="text-slate-800">${(purchase.subtotal || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">IVA (12%):</span>
                                    <span className="text-slate-800">${(purchase.tax || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold">
                                    <span className="text-slate-800">Total:</span>
                                    <span className="text-sky-600">${(purchase.total || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Botón ver factura */}
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <button
                              onClick={() => navigate(`/admin/compra/${purchase.id}`)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Ver Factura Completa
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
