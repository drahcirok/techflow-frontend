import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

// Estados con colores del prototipo
const COLUMNS = [
  { id: 'PENDIENTE', title: 'Ingresados', color: 'bg-slate-400', borderColor: 'border-l-slate-400' },
  { id: 'DIAGNOSTICO', title: 'En Diagnóstico', color: 'bg-blue-500', borderColor: 'border-l-blue-500' },
  { id: 'EN_ESPERA_REPUESTO', title: 'En Reparación', color: 'bg-orange-500', borderColor: 'border-l-orange-500' },
  { id: 'REPARADO', title: 'Listos', color: 'bg-green-500', borderColor: 'border-l-green-500' },
];

const TYPE_COLORS = {
  MANTENIMIENTO: 'bg-yellow-100 text-yellow-700',
  REPARACION: 'bg-red-100 text-red-600',
  ENSAMBLE: 'bg-blue-100 text-blue-600',
};

const TecnicoDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tablero de Trabajo</h1>
          <p className="text-slate-500">Vista general de órdenes activas</p>
        </div>
        <button
          onClick={() => navigate('/tecnico/new-order')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Orden
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="bg-slate-200/50 rounded-2xl p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-slate-700">{column.title}</h3>
              <span className="ml-auto bg-slate-300 px-2.5 py-0.5 rounded-full text-sm font-medium text-slate-600">
                {getOrdersByStatus(column.id).length}
              </span>
            </div>
            
            {/* Cards */}
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
                    className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${column.borderColor} cursor-move hover:shadow-md transition-shadow`}
                  >
                    {/* Order ID & Time */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-500 font-semibold text-sm">
                        #ORD-{order.id.toString().padStart(4, '0')}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {getTimeAgo(order.createdAt)}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <h4 className="text-slate-800 font-semibold mb-1 line-clamp-1">
                      {order.description || 'Sin descripción'}
                    </h4>
                    
                    {/* Client */}
                    <p className="text-slate-500 text-sm mb-3">
                      Cliente: {order.clientName || `ID ${order.clientId}`}
                    </p>
                    
                    {/* Type badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${TYPE_COLORS[order.type] || 'bg-slate-100 text-slate-600'}`}>
                        {order.type || 'General'}
                      </span>
                      
                      {/* Alert for waiting parts */}
                      {order.status === 'EN_ESPERA_REPUESTO' && (
                        <span className="flex items-center gap-1 text-orange-500 text-xs">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                          </svg>
                          Esperando repuesto
                        </span>
                      )}
                      
                      {/* Ready badge */}
                      {order.status === 'REPARADO' && (
                        <span className="flex items-center gap-1 text-green-500 text-xs">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Finalizado
                        </span>
                      )}
                    </div>

                    {/* Notify button for ready orders */}
                    {order.status === 'REPARADO' && (
                      <button 
                        onClick={() => toast.success('Cliente notificado')}
                        className="mt-3 w-full py-2 border border-green-500 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                      >
                        Notificar Cliente
                      </button>
                    )}
                  </div>
                ))
              )}
              
              {/* Empty state */}
              {!isLoading && getOrdersByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Sin órdenes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TecnicoDashboard;
