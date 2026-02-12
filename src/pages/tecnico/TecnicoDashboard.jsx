import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'PENDIENTE', title: 'Ingresados', color: 'bg-slate-400', borderColor: 'border-l-slate-400' },
  { id: 'DIAGNOSTICO', title: 'En Diagnóstico', color: 'bg-sky-500', borderColor: 'border-l-sky-500' },
  { id: 'EN_ESPERA_REPUESTO', title: 'En Reparación', color: 'bg-amber-500', borderColor: 'border-l-amber-500' },
  { id: 'REPARADO', title: 'Listos', color: 'bg-sky-500', borderColor: 'border-l-sky-500' },
];

const TYPE_COLORS = {
  MANTENIMIENTO: 'bg-amber-100 text-amber-700',
  REPARACION: 'bg-rose-100 text-rose-700',
  ENSAMBLE: 'bg-violet-100 text-violet-700',
};

const TecnicoDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const previousOrders = [...orders];

    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success('Estado actualizado');
    } catch (error) {
      setOrders(previousOrders);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    if (!confirm('¿Marcar como entregado y eliminar del tablero?')) return;

    const previousOrders = [...orders];

    setOrders(prev => prev.filter(order => order.id !== orderId));

    try {
      await orderService.updateStatus(orderId, 'ENTREGADO');
      toast.success('Orden marcada como entregada');
    } catch (error) {
      setOrders(previousOrders);
      toast.error('Error al marcar como entregada');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId.toString());
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-slate-300/50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-slate-300/50');
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-slate-300/50');
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
      handleStatusChange(parseInt(orderId), newStatus);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `Hace ${diffDays}d`;
    if (diffHours > 0) return `Hace ${diffHours}h`;
    if (diffMins > 0) return `Hace ${diffMins}m`;
    return 'Ahora';
  };

  const activeOrders = orders.filter(o => !['ENTREGADO', 'CANCELADO'].includes(o.status)).length;
  const readyOrders = orders.filter(o => o.status === 'REPARADO').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tablero de Trabajo</h1>
          <p className="text-slate-500">
            {activeOrders} órdenes activas 
            {readyOrders > 0 && <span className="text-sky-600 font-medium"> · {readyOrders} listas para entregar</span>}
          </p>
        </div>
        <button
          onClick={() => navigate('/tecnico/new-order')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-sky-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Orden
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="bg-slate-200/50 rounded-2xl p-4 transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-slate-700">{column.title}</h3>
              <span className="ml-auto bg-slate-300 px-2.5 py-0.5 rounded-full text-sm font-medium text-slate-600">
                {getOrdersByStatus(column.id).length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[300px]">
              {isLoading ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                ))
              ) : (
                getOrdersByStatus(column.id).map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${column.borderColor} hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sky-600 font-semibold text-sm">
                        #{order.trackingCode || `ORD-${order.id.toString().padStart(4, '0')}`}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {getTimeAgo(order.createdAt)}
                      </span>
                    </div>

                    <h4
                      onClick={() => handleViewDetails(order)}
                      className="text-slate-800 font-semibold mb-1 line-clamp-1 cursor-pointer hover:text-sky-600 transition-colors"
                      title="Clic para ver detalles"
                    >
                      {order.description || 'Sin descripción'}
                    </h4>
                    
                    <p className="text-slate-500 text-sm mb-3">
                      Cliente: {order.clientName || `ID ${order.clientId}`}
                    </p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${TYPE_COLORS[order.type] || 'bg-slate-100 text-slate-600'}`}>
                        {order.type || 'General'}
                      </span>
                      
                      {order.status === 'EN_ESPERA_REPUESTO' && (
                        <span className="flex items-center gap-1 text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                          </svg>
                          Esperando
                        </span>
                      )}
                      
                      {order.status === 'REPARADO' && (
                        <span className="flex items-center gap-1 text-sky-600 text-xs bg-sky-50 px-2 py-1 rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Listo
                        </span>
                      )}
                    </div>

                    {order.totalCost > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500 text-xs">Total:</span>
                        <span className="text-sky-600 font-semibold">${order.totalCost.toFixed(2)}</span>
                      </div>
                    )}

                    {order.status === 'REPARADO' && (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Cliente notificado');
                          }}
                          className="w-full py-2 border border-sky-500 text-sky-600 rounded-lg text-sm font-medium hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Notificar Cliente
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsDelivered(order.id);
                          }}
                          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Marcar como Entregado
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {!isLoading && getOrdersByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-300 rounded-xl">
                  Sin órdenes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Detalles de la Orden</h2>
                <p className="text-sm text-slate-500">
                  #{selectedOrder.trackingCode || `ORD-${selectedOrder.id.toString().padStart(4, '0')}`}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Estado Actual</label>
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedOrder.status === 'REPARADO' ? 'bg-sky-100 text-sky-700' :
                  selectedOrder.status === 'EN_ESPERA_REPUESTO' ? 'bg-amber-100 text-amber-700' :
                  selectedOrder.status === 'DIAGNOSTICO' ? 'bg-sky-100 text-sky-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedOrder.status === 'REPARADO' ? '✅ Listo para entregar' :
                   selectedOrder.status === 'EN_ESPERA_REPUESTO' ? '🔧 En Reparación' :
                   selectedOrder.status === 'DIAGNOSTICO' ? '🔍 En Diagnóstico' :
                   '📥 Pendiente'}
                </span>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Descripción del Problema</label>
                <p className="text-slate-800 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">
                  {selectedOrder.description || 'Sin descripción'}
                </p>
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Cliente</label>
                  <p className="text-slate-800 font-medium">
                    {selectedOrder.clientName || `Cliente #${selectedOrder.clientId}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Tipo de Servicio</label>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${TYPE_COLORS[selectedOrder.type] || 'bg-slate-100 text-slate-600'}`}>
                    {selectedOrder.type || 'General'}
                  </span>
                </div>
              </div>

              {/* Costos */}
              {selectedOrder.totalCost > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Costo Total</span>
                    <span className="text-2xl font-bold text-sky-600">
                      ${selectedOrder.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Fecha de Ingreso</label>
                <p className="text-slate-800">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'No disponible'}
                </p>
              </div>

              {/* Repuestos */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Repuestos Utilizados</label>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                        <span className="text-slate-800">{item.productName || item.productSku}</span>
                        <span className="text-slate-600">Cantidad: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TecnicoDashboard;
