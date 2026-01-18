import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

// Estados del backend
const STEPS = [
  { id: 'PENDIENTE', label: 'Pendiente', description: 'Orden recibida' },
  { id: 'DIAGNOSTICO', label: 'Diagnóstico', description: 'Analizando el problema' },
  { id: 'EN_ESPERA_REPUESTO', label: 'Esperando Repuesto', description: 'Gestionando piezas' },
  { id: 'REPARADO', label: 'Reparado', description: 'Trabajo completado' },
  { id: 'ENTREGADO', label: 'Entregado', description: '¡Recogido!' },
];

const Tracking = () => {
  const { user } = useAuth();
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const searchOrder = async (code) => {
    if (!code) {
      toast.error('Ingresa un código de rastreo');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await orderService.getByTracking(code);
      setOrder(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchOrder(trackingCode);
  };

  useEffect(() => {
    if (!order) return;
    
    const interval = setInterval(() => {
      searchOrder(order.trackingCode);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [order?.trackingCode]);

  const getStepIndex = (status) => {
    return STEPS.findIndex(step => step.id === status);
  };

  const ProgressBar = ({ currentStatus }) => {
    const currentIndex = getStepIndex(currentStatus);
    
    if (currentStatus === 'CANCELADO') {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 font-semibold">Orden Cancelada</p>
        </div>
      );
    }
    
    return (
      <div className="relative mt-8">
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-700 rounded-full" />
        
        <div 
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-700"
          style={{ width: `${((currentIndex) / (STEPS.length - 1)) * 100}%` }}
        />
        
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center" style={{ width: '20%' }}>
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

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">
          Rastrear mi Orden
        </h1>
        <p className="text-slate-400 mt-1">
          Ingresa tu código de seguimiento
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Ej: 550e8400-e29b-41d4-a716-446655440000"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Buscar'
            )}
          </button>
        </div>
      </form>

      {/* Result */}
      {order && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          {/* Order header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-slate-500 bg-slate-700 px-2 py-1 rounded">
                  {order.trackingCode}
                </span>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${order.status === 'ENTREGADO' ? 'bg-emerald-500/20 text-emerald-400' : 
                    order.status === 'CANCELADO' ? 'bg-red-500/20 text-red-400' :
                    order.status === 'REPARADO' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-sky-500/20 text-sky-400'}
                `}>
                  {STEPS.find(s => s.id === order.status)?.label || order.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                {order.description}
              </h3>
              <p className="text-slate-400">
                Tipo: {order.type}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm">Total</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${order.totalCost?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar currentStatus={order.status} />

          {/* Ready message */}
          {order.status === 'REPARADO' && (
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
                    Acércate a nuestro taller con tu documento de identidad.
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.status === 'ENTREGADO' && (
            <div className="mt-8 p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
              <p className="text-sky-400 font-semibold text-center">
                ✅ Orden completada - ¡Gracias por preferirnos!
              </p>
            </div>
          )}

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Repuestos utilizados:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.productSku} x{item.quantity}</span>
                    <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last update */}
      {lastUpdate && (
        <p className="text-center text-slate-500 text-sm mt-6">
          Última actualización: {lastUpdate.toLocaleTimeString()}
          <span className="ml-2 text-xs">(auto-refresh cada 30s)</span>
        </p>
      )}
    </div>
  );
};

export default Tracking;
