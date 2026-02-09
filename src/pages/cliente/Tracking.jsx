import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

// Configuracion de mensajes por tipo de servicio
const SERVICE_TYPE_CONFIG = {
  REPARACION: {
    steps: [
      { id: 'PENDIENTE', label: 'Recibido', icon: '📥' },
      { id: 'DIAGNOSTICO', label: 'Diagnóstico', icon: '🔍' },
      { id: 'EN_ESPERA_REPUESTO', label: 'Reparación', icon: '🔧' },
      { id: 'REPARADO', label: 'Listo', icon: '✅' },
    ],
    activityMessages: {
      REPARADO: 'Equipo reparado y listo para entrega.',
      EN_ESPERA_REPUESTO: 'Técnico inició la reparación del equipo.',
      DIAGNOSTICO: 'Diagnóstico completado. Se requiere revisión.',
      PENDIENTE: 'Orden recibida en el sistema.',
    },
    successMessage: '¡Tu equipo está reparado! Puedes pasar a recogerlo.',
    statusBadgeReady: '✅ Listo para recoger',
  },
  MANTENIMIENTO: {
    steps: [
      { id: 'PENDIENTE', label: 'Recibido', icon: '📥' },
      { id: 'DIAGNOSTICO', label: 'Revisión', icon: '🔍' },
      { id: 'EN_ESPERA_REPUESTO', label: 'Mantenimiento', icon: '🛠️' },
      { id: 'REPARADO', label: 'Listo', icon: '✅' },
    ],
    activityMessages: {
      REPARADO: 'Mantenimiento completado. Equipo listo para entrega.',
      EN_ESPERA_REPUESTO: 'Técnico inició el mantenimiento del equipo.',
      DIAGNOSTICO: 'Revisión inicial completada.',
      PENDIENTE: 'Orden de mantenimiento recibida en el sistema.',
    },
    successMessage: '¡El mantenimiento fue completado! Puedes pasar a recoger tu equipo.',
    statusBadgeReady: '✅ Mantenimiento completado',
  },
  ENSAMBLE: {
    steps: [
      { id: 'PENDIENTE', label: 'Recibido', icon: '📥' },
      { id: 'DIAGNOSTICO', label: 'Planificación', icon: '📋' },
      { id: 'EN_ESPERA_REPUESTO', label: 'Ensamblaje', icon: '🔩' },
      { id: 'REPARADO', label: 'Listo', icon: '✅' },
    ],
    activityMessages: {
      REPARADO: 'Ensamblaje completado. Equipo listo para entrega.',
      EN_ESPERA_REPUESTO: 'Técnico inició el ensamblaje del equipo.',
      DIAGNOSTICO: 'Planificación de componentes completada.',
      PENDIENTE: 'Orden de ensamble recibida en el sistema.',
    },
    successMessage: '¡Tu equipo ha sido ensamblado! Puedes pasar a recogerlo.',
    statusBadgeReady: '✅ Ensamble completado',
  },
};

const getServiceConfig = (orderType) => {
  return SERVICE_TYPE_CONFIG[orderType] || SERVICE_TYPE_CONFIG.REPARACION;
};

const TYPE_LABELS = {
  MANTENIMIENTO: 'Mantenimiento',
  REPARACION: 'Reparación',
  ENSAMBLE: 'Ensamble',
};

const TYPE_COLORS = {
  MANTENIMIENTO: 'bg-amber-100 text-amber-700',
  REPARACION: 'bg-rose-100 text-rose-700',
  ENSAMBLE: 'bg-violet-100 text-violet-700',
};

const STATUS_ORDER = ['PENDIENTE', 'DIAGNOSTICO', 'EN_ESPERA_REPUESTO', 'REPARADO'];

const getActivityEntries = (order, config) => {
  if (!order) return [];
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  if (currentIdx === -1) return [];

  const entries = [];
  for (let i = currentIdx; i >= 0; i--) {
    const status = STATUS_ORDER[i];
    entries.push({
      message: config.activityMessages[status],
      dotColor: i === currentIdx && i > 0 ? 'bg-amber-500' : i === currentIdx ? 'bg-sky-500' : i === 0 ? 'bg-slate-400' : 'bg-sky-500',
      timeLabel: i === currentIdx ? 'En proceso' :
                 i === 0 ? (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Inicio') :
                 config.steps[i]?.label || '',
    });
  }
  return entries;
};

const PublicTracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { isAuthenticated, isCliente } = useAuth();
  const isEmbedded = isAuthenticated && isCliente;

  const searchOrder = async (e) => {
    e?.preventDefault();

    if (!trackingCode.trim()) {
      toast.error('Ingresa un número de orden');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      const response = await orderService.getByTracking(trackingCode.trim());
      setOrder(response.data);
    } catch (error) {
      setOrder(null);
      toast.error('Orden no encontrada');
    } finally {
      setIsLoading(false);
    }
  };

  const config = order ? getServiceConfig(order.type) : SERVICE_TYPE_CONFIG.REPARACION;
  const steps = config.steps;

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.id === status);
  };

  const currentIndex = order ? getStepIndex(order.status) : -1;
  const activityEntries = getActivityEntries(order, config);

  // Contenido compartido entre modo publico y embebido
  const trackingContent = (
    <>
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className={`font-bold text-slate-800 mb-2 ${isEmbedded ? 'text-2xl' : 'text-3xl'}`}>
          Rastrear Orden
        </h1>
        <p className="text-slate-500">Ingresa tu número de orden para ver el estado en tiempo real.</p>
      </div>

      {/* Search */}
      <form onSubmit={searchOrder} className="flex gap-3 max-w-xl mx-auto mb-10">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm text-lg"
            placeholder="TF-XXXXXX"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white rounded-2xl font-semibold transition-colors shadow-lg shadow-sky-500/30 flex items-center gap-2"
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
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 lg:p-8 animate-fadeIn">
          {/* Order header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {order.description || 'Orden de Servicio'}
              </h2>
              <p className="text-slate-500 flex items-center gap-2 flex-wrap">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sky-600 font-semibold">
                  #{order.trackingCode || order.id}
                </span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[order.type] || 'bg-slate-100 text-slate-600'}`}>
                  {TYPE_LABELS[order.type] || order.type || 'General'}
                </span>
              </p>
            </div>
            <span className={`px-4 py-2 rounded-xl font-medium ${
              order.status === 'REPARADO' || order.status === 'ENTREGADO'
                ? 'bg-sky-100 text-sky-700'
                : 'bg-sky-100 text-sky-700'
            }`}>
              {order.status === 'REPARADO' ? config.statusBadgeReady :
               order.status === 'ENTREGADO' ? '📦 Entregado' : '🔄 En Proceso'}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="relative mb-10">
            {/* Line background */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 rounded-full" />
            {/* Line progress */}
            <div
              className="absolute top-6 left-0 h-1 bg-sky-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all
                      ${isCompleted
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                      }
                      ${isCurrent ? 'ring-4 ring-sky-200 scale-110' : ''}
                    `}>
                      {isCompleted ? (
                        <span className="text-lg">{step.icon}</span>
                      ) : (
                        <span className="font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <p className={`mt-3 text-sm font-medium ${isCurrent ? 'text-slate-800' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="text-xs text-sky-500 font-medium mt-1 animate-pulse">En curso</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bitácora de Actividad
            </h3>
            <div className="space-y-3">
              {activityEntries.map((entry, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className={`w-2 h-2 rounded-full ${entry.dotColor} mt-2 shrink-0`} />
                  <div>
                    <p className="text-slate-600">{entry.message}</p>
                    <span className="text-slate-400 text-xs">{entry.timeLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready message */}
          {order.status === 'REPARADO' && (
            <div className="mt-6 p-4 bg-sky-50 border border-sky-200 rounded-xl">
              <p className="text-sky-700 font-medium text-center flex items-center justify-center gap-2">
                <span className="text-2xl">🎉</span>
                {config.successMessage}
              </p>
            </div>
          )}

          {/* Cost if available */}
          {order.totalCost > 0 && (
            <div className="mt-6 p-4 bg-slate-100 rounded-xl flex items-center justify-between">
              <span className="text-slate-600 font-medium">Total a pagar:</span>
              <span className="text-2xl font-bold text-sky-600">${order.totalCost.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Not found message */}
      {searched && !order && !isLoading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Orden no encontrada</h3>
          <p className="text-slate-500">Verifica que el código esté correcto e intenta nuevamente.</p>
        </div>
      )}
    </>
  );

  // Modo embebido: sin header propio, sin footer
  if (isEmbedded) {
    return (
      <div className="max-w-4xl mx-auto">
        {trackingContent}
      </div>
    );
  }

  // Modo publico: con header y footer
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="TechFlow" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg">TechFlow</span>
          </div>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Iniciar Sesión
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {trackingContent}

        {/* Footer link */}
        <div className="text-center mt-8">
          <Link to="/login" className="text-slate-500 hover:text-slate-700 text-sm">
            ¿Tienes cuenta? Inicia sesión para más opciones
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PublicTracking;
