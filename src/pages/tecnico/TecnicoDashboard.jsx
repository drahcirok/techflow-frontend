import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'INGRESADO', title: 'Ingresados', color: 'bg-blue-500' },
  { id: 'DIAGNOSTICO', title: 'En Diagnóstico', color: 'bg-yellow-500' },
  { id: 'ESPERANDO_REPUESTO', title: 'Esperando Repuesto', color: 'bg-orange-500' },
  { id: 'EN_REPARACION', title: 'En Reparación', color: 'bg-purple-500' },
  { id: 'TERMINADO', title: 'Terminados', color: 'bg-green-500' },
];

// Datos de prueba mientras no hay backend
const mockOrders = [
  { id: 1, trackingCode: 'TF-001', status: 'INGRESADO', clienteNombre: 'Juan Pérez', equipoDescripcion: 'Laptop HP', createdAt: '2025-01-15' },
  { id: 2, trackingCode: 'TF-002', status: 'DIAGNOSTICO', clienteNombre: 'María García', equipoDescripcion: 'PC Desktop', createdAt: '2025-01-14' },
  { id: 3, trackingCode: 'TF-003', status: 'EN_REPARACION', clienteNombre: 'Carlos López', equipoDescripcion: 'Impresora Epson', createdAt: '2025-01-13' },
  { id: 4, trackingCode: 'TF-004', status: 'TERMINADO', clienteNombre: 'Ana Torres', equipoDescripcion: 'Monitor LG', createdAt: '2025-01-10' },
];

const TecnicoDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(mockOrders);
  const [isLoading, setIsLoading] = useState(false);

  // Descomentar cuando el backend esté listo
  // useEffect(() => {
  //   fetchOrders();
  // }, []);
  
  // const fetchOrders = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await orderService.getAll();
  //     setOrders(response.data);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Actualización optimista
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast.success('Estado actualizado');
    
    // Descomentar cuando el backend esté listo
    // try {
    //   await orderService.updateStatus(orderId, newStatus);
    // } catch (error) {
    //   fetchOrders(); // Revertir si falla
    // }
  };

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const orderId = parseInt(e.dataTransfer.getData('orderId'));
    if (orderId) {
      handleStatusChange(orderId, newStatus);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Gestiona las órdenes de servicio</p>
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
                // Skeletons
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
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 cursor-move hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-slate-500">
                        #{order.trackingCode}
                      </span>
                    </div>
                    <h4 className="text-white font-medium mb-1">
                      {order.equipoDescripcion}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {order.clienteNombre}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <button className="text-sky-400 hover:text-sky-300 text-xs">
                        Ver detalles
                      </button>
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
