import { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'PENDIENTE', label: 'Recibido' },
  { id: 'DIAGNOSTICO', label: 'Diagnóstico' },
  { id: 'EN_ESPERA_REPUESTO', label: 'Reparación' },
  { id: 'REPARADO', label: 'Listo' },
];

const PublicTracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchOrder = async (e) => {
    e?.preventDefault();
    
    if (!trackingCode) {
      toast.error('Ingresa un número de orden');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await orderService.getByTracking(trackingCode);
      setOrder(response.data);
    } catch (error) {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status) => {
    return STEPS.findIndex(step => step.id === status);
  };

  const currentIndex = order ? getStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/>
              </svg>
            </div>
            <span className="font-bold text-lg">TechFlow</span>
          </div>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white">
            Iniciar Sesión
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Rastrea tu Reparación</h1>
          <p className="text-slate-500">Ingresa tu número de orden para ver el estado en tiempo real.</p>
        </div>

        {/* Search */}
        <form onSubmit={searchOrder} className="flex gap-3 max-w-xl mx-auto mb-10">
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 px-5 py-4 bg-white border border-slate-300 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-lg"
            placeholder="ORD-1020"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-2xl font-semibold transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Buscar
          </button>
        </form>

        {/* Result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:p-8">
            {/* Order header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                  {order.description || 'Orden de Servicio'}
                </h2>
                <p className="text-slate-500">
                  Orden #{order.trackingCode || order.id}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-xl font-medium ${
                order.status === 'REPARADO' || order.status === 'ENTREGADO'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {order.status === 'REPARADO' ? 'Listo para recoger' : 
                 order.status === 'ENTREGADO' ? 'Entregado' : 'En Proceso'}
              </span>
            </div>

            {/* Progress Steps */}
            <div className="relative mb-10">
              {/* Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 rounded-full" />
              <div 
                className="absolute top-6 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%` }}
              />
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {STEPS.map((step, index) => {
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all
                        ${isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                        }
                        ${isCurrent ? 'ring-4 ring-green-200' : ''}
                      `}>
                        {isCompleted ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <p className={`mt-3 text-sm font-medium ${isCurrent ? 'text-slate-800' : 'text-slate-500'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-blue-500">En curso</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Bitácora de Actividad:</h3>
              <div className="space-y-3">
                {order.status === 'REPARADO' && (
                  <div className="flex gap-3">
                    <span className="text-slate-400 text-sm w-16">Hoy</span>
                    <p className="text-slate-600">Equipo listo para entrega.</p>
                  </div>
                )}
                {(order.status === 'EN_ESPERA_REPUESTO' || order.status === 'REPARADO') && (
                  <div className="flex gap-3">
                    <span className="text-slate-400 text-sm w-16">10:00 AM</span>
                    <p className="text-slate-600">Técnico inició la reparación del equipo.</p>
                  </div>
                )}
                {(order.status === 'DIAGNOSTICO' || order.status === 'EN_ESPERA_REPUESTO' || order.status === 'REPARADO') && (
                  <div className="flex gap-3">
                    <span className="text-slate-400 text-sm w-16">Ayer</span>
                    <p className="text-slate-600">Diagnóstico completado. Se requiere revisión.</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <span className="text-slate-400 text-sm w-16">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Inicio'}
                  </span>
                  <p className="text-slate-600">Orden recibida en el sistema.</p>
                </div>
              </div>
            </div>

            {/* Ready message */}
            {order.status === 'REPARADO' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 font-medium text-center">
                  🎉 ¡Tu equipo está listo! Puedes pasar a recogerlo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer link */}
        <div className="text-center mt-8">
          <Link to="/login" className="text-slate-500 hover:text-slate-700 text-sm">
            Volver al Login (Demo)
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PublicTracking;
