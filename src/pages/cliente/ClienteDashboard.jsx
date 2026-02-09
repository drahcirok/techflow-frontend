import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  MANTENIMIENTO: 'bg-amber-100 text-amber-700',
  REPARACION: 'bg-rose-100 text-rose-700',
  ENSAMBLE: 'bg-violet-100 text-violet-700',
};

const TYPE_LABELS = {
  MANTENIMIENTO: 'Mantenimiento',
  REPARACION: 'Reparación',
  ENSAMBLE: 'Ensamble',
};

const STATUS_STYLES = {
  PENDIENTE: 'bg-slate-100 text-slate-600',
  DIAGNOSTICO: 'bg-sky-100 text-sky-600',
  EN_ESPERA_REPUESTO: 'bg-amber-100 text-amber-600',
  REPARADO: 'bg-green-100 text-green-700',
  ENTREGADO: 'bg-slate-100 text-slate-500',
  CANCELADO: 'bg-red-100 text-red-600',
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  DIAGNOSTICO: 'En diagnóstico',
  EN_ESPERA_REPUESTO: 'En proceso',
  REPARADO: 'Listo para recoger',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const getTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const created = new Date(date);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return new Date(date).toLocaleDateString();
  if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffMins > 0) return `hace ${diffMins} min`;
  return 'Ahora';
};

const ClienteDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [quickTrackCode, setQuickTrackCode] = useState('');

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      const data = response.data || [];
      // Ordenar por fecha mas reciente
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (error) {
      console.error('Error cargando ordenes:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackCode.trim()) {
      navigate(`/cliente/tracking`);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Stats
  const activeOrders = orders.filter(o => !['ENTREGADO', 'CANCELADO'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'REPARADO');
  const completedOrders = orders.filter(o => o.status === 'ENTREGADO');

  const stats = [
    {
      label: 'Total de Órdenes',
      value: orders.length,
      bgLight: 'bg-sky-50',
      iconBg: 'bg-sky-100',
      textColor: 'text-sky-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'En Proceso',
      value: activeOrders.length,
      bgLight: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Listas para Recoger',
      value: readyOrders.length,
      bgLight: 'bg-green-50',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Completadas',
      value: completedOrders.length,
      bgLight: 'bg-slate-50',
      iconBg: 'bg-slate-100',
      textColor: 'text-slate-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando tus órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido, {user?.name || 'Cliente'}
        </h1>
        <p className="text-slate-500 mt-1">Aquí puedes ver el estado de tus órdenes de servicio.</p>
      </div>

      {/* Alert for ready orders */}
      {readyOrders.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-800">
              {readyOrders.length === 1
                ? 'Tienes 1 orden lista para recoger'
                : `Tienes ${readyOrders.length} órdenes listas para recoger`}
            </p>
            <p className="text-green-600 text-sm">Puedes pasar por el taller a retirar tu equipo.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center ${stat.textColor}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick tracking */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
        <form onSubmit={handleQuickTrack} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <input
              type="text"
              value={quickTrackCode}
              onChange={(e) => setQuickTrackCode(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              placeholder="Buscar por código de seguimiento..."
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rastrear
          </button>
        </form>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Mis Órdenes
          </h2>
          <span className="text-sm text-slate-400">{orders.length} orden{orders.length !== 1 ? 'es' : ''}</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No tienes órdenes aún</h3>
            <p className="text-slate-500 mb-4">Cuando registres un servicio, aparecerá aquí.</p>
            <button
              onClick={() => navigate('/cliente/tracking')}
              className="text-sky-500 hover:text-sky-600 font-medium text-sm"
            >
              Buscar una orden por código de seguimiento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id}>
                {/* Order row */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  {/* Status indicator */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    order.status === 'REPARADO' ? 'bg-green-500' :
                    order.status === 'ENTREGADO' ? 'bg-slate-400' :
                    order.status === 'CANCELADO' ? 'bg-red-400' :
                    'bg-sky-500 animate-pulse'
                  }`} />

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-sky-600 font-semibold">
                        #{order.trackingCode || order.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[order.type] || 'bg-slate-100 text-slate-600'}`}>
                        {TYPE_LABELS[order.type] || order.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 truncate">
                      {order.description || 'Orden de servicio'}
                    </p>
                  </div>

                  {/* Status + time */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="text-xs text-slate-400">{getTimeAgo(order.createdAt)}</span>
                  </div>

                  {/* Cost */}
                  <div className="hidden md:block text-right shrink-0 w-20">
                    {order.totalCost > 0 && (
                      <span className="font-semibold text-sky-600">${order.totalCost.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded details */}
                {expandedOrderId === order.id && (
                  <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Descripción</p>
                        <p className="text-sm text-slate-700">{order.description || 'Sin descripción'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Estado actual</p>
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Fecha de ingreso</p>
                        <p className="text-sm text-slate-700">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Código de seguimiento</p>
                        <p className="text-sm font-mono text-sky-600 font-semibold">#{order.trackingCode || order.id}</p>
                      </div>
                      {order.totalCost > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Costo total</p>
                          <p className="text-sm font-semibold text-sky-600">${order.totalCost.toFixed(2)}</p>
                        </div>
                      )}
                      {order.items && order.items.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-slate-400 mb-2">Repuestos utilizados</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
                                {item.productName || item.productSku} x{item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-4">
                      <button
                        onClick={() => navigate('/cliente/tracking')}
                        className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Ver seguimiento
                      </button>
                      {(order.status === 'REPARADO' || order.status === 'ENTREGADO') && (
                        <button
                          onClick={() => navigate(`/cliente/factura/${order.id}`)}
                          className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Ver factura
                        </button>
                      )}
                      {order.status === 'ENTREGADO' && !order.rating && (
                        <button
                          onClick={() => navigate(`/cliente/valorar/${order.id}`)}
                          className="text-sm text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Dejar valoración
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteDashboard;
