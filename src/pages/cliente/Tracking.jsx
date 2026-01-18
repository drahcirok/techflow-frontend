import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';

const STEPS = [
  { id: 'INGRESADO', label: 'Ingresado', description: 'Tu equipo ha sido recibido' },
  { id: 'DIAGNOSTICO', label: 'Diagnóstico', description: 'Analizando el problema' },
  { id: 'ESPERANDO_REPUESTO', label: 'Esperando Repuesto', description: 'Gestionando piezas' },
  { id: 'EN_REPARACION', label: 'En Reparación', description: 'Trabajando en tu equipo' },
  { id: 'TERMINADO', label: 'Terminado', description: '¡Listo para recoger!' },
];

// Datos de prueba
const mockOrders = [
  { 
    id: 1, 
    trackingCode: 'TF-2025-001', 
    status: 'EN_REPARACION', 
    equipoDescripcion: 'Laptop HP Pavilion', 
    equipoMarca: 'HP',
    equipoModelo: 'Pavilion 15',
    createdAt: '2025-01-15T10:30:00' 
  },
  { 
    id: 2, 
    trackingCode: 'TF-2025-002', 
    status: 'TERMINADO', 
    equipoDescripcion: 'Impresora Epson', 
    equipoMarca: 'Epson',
    equipoModelo: 'L3150',
    createdAt: '2025-01-10T14:00:00' 
  },
];

const Tracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState(mockOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchOrders = async () => {
    try {
      // Descomentar cuando el backend esté listo
      // const response = await orderService.getByClient(user.id);
      // setOrders(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Polling cada 30 segundos (Observer simulado)
  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStepIndex = (status) => {
    return STEPS.findIndex(step => step.id === status);
  };

  const ProgressBar = ({ currentStatus }) => {
    const currentIndex = getStepIndex(currentStatus);
    
    return (
      <div className="relative mt-8">
        {/* Línea de fondo */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-700 rounded-full" />
        
        {/* Línea de progreso */}
        <div 
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-700"
          style={{ width: `${((currentIndex) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {/* Pasos */}
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center" style={{ width: '20%' }}>
                {/* Círculo */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-500 z-10
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/25' 
                    : 'bg-slate-800 border-2 border-slate-600'
                  }
                  ${isCurrent ? 'ring-4 ring-sky-500/30 scale-110' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-slate-500 font-medium text-sm">{index + 1}</span>
                  )}
                </div>
                
                {/* Label */}
                <div className="mt-3 text-center">
                  <p className={`text-xs sm:text-sm font-medium ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hola, {user?.name || 'Cliente'} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Sigue el estado de tus equipos
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Auto-actualización activa</span>
        </div>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 text-center py-16">
          <div className="w-20 h-20 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Sin órdenes activas
          </h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            Cuando tengas un equipo en reparación, aparecerá aquí para que puedas seguir su estado
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              {/* Order header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-slate-500 bg-slate-700 px-2 py-1 rounded">
                      {order.trackingCode}
                    </span>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${order.status === 'TERMINADO' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-sky-500/20 text-sky-400'
                      }
                    `}>
                      {STEPS.find(s => s.id === order.status)?.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {order.equipoDescripcion}
                  </h3>
                  <p className="text-slate-400">
                    {order.equipoMarca} {order.equipoModelo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-sm">Fecha de ingreso</p>
                  <p className="text-white font-medium">
                    {new Date(order.createdAt).toLocaleDateString('es-EC', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <ProgressBar currentStatus={order.status} />

              {/* Footer info */}
              {order.status === 'TERMINADO' && (
                <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-emerald-400 font-semibold">
                        🎉 ¡Tu equipo está listo para recoger!
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Acércate a nuestro taller con tu documento de identidad en horario de atención.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Last update */}
      <p className="text-center text-slate-500 text-sm mt-8">
        Última actualización: {lastUpdate.toLocaleTimeString('es-EC')}
      </p>
    </div>
  );
};

export default Tracking;
