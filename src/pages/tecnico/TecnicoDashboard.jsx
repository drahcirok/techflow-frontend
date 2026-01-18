import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

// Estados del backend
const COLUMNS = [
  { id: 'PENDIENTE', title: 'Pendientes', color: 'bg-blue-500' },
  { id: 'DIAGNOSTICO', title: 'En Diagnóstico', color: 'bg-yellow-500' },
  { id: 'EN_ESPERA_REPUESTO', title: 'Esperando Repuesto', color: 'bg-orange-500' },
  { id: 'REPARADO', title: 'Reparados', color: 'bg-purple-500' },
  { id: 'ENTREGADO', title: 'Entregados', color: 'bg-green-500' },
];

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
    // Guardar estado anterior por si falla
    const previousOrders = [...orders];
    
    // Actualización optimista
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success('Estado actualizado');
    } catch (error) {
      // Revertir si falla
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

  const copyTrackingCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Órdenes de Servicio</h1>
          <p className="text-slate-400">Arrastra las tarjetas para cambiar el estado</p>
        </div>
        <button
          onClick={() => navigate('/tecnico/new-order')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Orden
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-white">{column.title}</h3>
              <span className="ml-auto bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-400">
                {getOrdersByStatus(column.id).length}
              </span>
            </div>
            
            {/* Column content */}
            <div className="space-y-3 min-h-[400px] bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              {isLoading ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                  </div>
                ))
              ) : (
                getOrdersByStatus(column.id).map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 cursor-move hover:border-slate-600 transition-colors group"
                  >
                    {/* Tracking code */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => copyTrackingCode(order.trackingCode)}
                        className="text-xs font-mono text-slate-500 hover:text-sky-400 transition-colors flex items-center gap-1"
                        title="Copiar código"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        {order.trackingCode?.substring(0, 8)}...
                      </button>
                      <span className="text-xs text-slate-600">#{order.id}</span>
                    </div>
                    
                    {/* Description */}
                    <h4 className="text-white font-medium mb-1 line-clamp-2">
                      {order.description}
                    </h4>
                    
                    {/* Type badge */}
                    <span className={`
                      inline-block px-2 py-0.5 rounded text-xs font-medium mb-2
                      ${order.type === 'REPARACION' ? 'bg-orange-500/20 text-orange-400' : 
                        order.type === 'MANTENIMIENTO' ? 'bg-blue-500/20 text-blue-400' : 
                        'bg-purple-500/20 text-purple-400'}
                    `}>
                      {order.type}
                    </span>
                    
                    {/* Costs */}
                    <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Total:</span>
                      <span className="text-emerald-400 font-semibold">
                        ${order.totalCost?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    
                    {/* Date */}
                    <div className="mt-2 text-xs text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))
              )}
              
              {/* Empty state */}
              {!isLoading && getOrdersByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
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
