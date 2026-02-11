import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { purchaseService } from '../../services/purchaseService';
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
  const [ratingOrderId, setRatingOrderId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [purchases, setPurchases] = useState([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      const data = response.data || [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (error) {
      console.error('Error cargando ordenes:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyPurchases = async () => {
    setIsLoadingPurchases(true);
    try {
      const response = await purchaseService.getMyPurchases();
      const data = response.data || [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPurchases(data);
    } catch {
      setPurchases([]);
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'purchases' && purchases.length === 0) {
      fetchMyPurchases();
    }
  };

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackCode.trim()) {
      navigate(`/cliente/tracking?code=${quickTrackCode.trim()}`);
    }
  };

  const handleSubmitRating = async (orderId) => {
    if (ratingValue === 0) {
      toast.error('Selecciona una calificacion');
      return;
    }
    setIsSubmittingRating(true);
    try {
      await orderService.addRating(orderId, { rating: ratingValue, comment: ratingComment });
      toast.success('Gracias por tu valoracion');
      setRatingOrderId(null);
      setRatingValue(0);
      setRatingComment('');
      fetchMyOrders();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar la valoracion');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Ordenes pendientes de calificar (entregadas sin rating)
  const pendingRatingOrders = orders.filter(o => o.status === 'ENTREGADO' && !o.rating);
  // Ordenes visibles: no mostrar las entregadas que ya fueron calificadas
  const visibleOrders = orders.filter(o => !(o.status === 'ENTREGADO' && o.rating));

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

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => handleTabChange('orders')}
          className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
            activeTab === 'orders'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Ordenes de Servicio
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === 'orders' ? 'bg-sky-400/30 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            {orders.length}
          </span>
        </button>
        <button
          onClick={() => handleTabChange('purchases')}
          className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
            activeTab === 'purchases'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Compras en Tienda
          {purchases.length > 0 && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'purchases' ? 'bg-sky-400/30 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {purchases.length}
            </span>
          )}
        </button>
      </div>

      {/* Orders tab */}
      {activeTab === 'orders' && (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Mis Ordenes
          </h2>
          <span className="text-sm text-slate-400">{visibleOrders.length} orden{visibleOrders.length !== 1 ? 'es' : ''}</span>
        </div>

        {visibleOrders.length === 0 && pendingRatingOrders.length === 0 ? (
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
            {/* Seccion: Califica tu orden */}
            {pendingRatingOrders.length > 0 && (
              <div className="bg-amber-50/50">
                <div className="px-4 py-3 border-b border-amber-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-700">Califica tu orden</span>
                </div>
                {pendingRatingOrders.map((order) => (
                  <div key={order.id} className="p-4 border-b border-amber-100 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded text-sky-600 font-semibold">
                            #{order.trackingCode || order.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[order.type] || 'bg-slate-100 text-slate-600'}`}>
                            {TYPE_LABELS[order.type] || order.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-green-100 text-green-700">Entregado</span>
                        </div>
                        <p className="text-sm text-slate-700 truncate">{order.description || 'Orden de servicio'}</p>
                      </div>
                    </div>

                    {ratingOrderId === order.id ? (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200">
                        <p className="text-sm text-slate-600 mb-2">Como calificarias el servicio?</p>
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingValue(star)}
                              onMouseEnter={() => setRatingHover(star)}
                              onMouseLeave={() => setRatingHover(0)}
                              className="focus:outline-none"
                            >
                              <svg
                                className={`w-7 h-7 transition-colors ${
                                  star <= (ratingHover || ratingValue)
                                    ? 'text-amber-400'
                                    : 'text-slate-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                          {ratingValue > 0 && (
                            <span className="text-sm text-slate-500 ml-2">
                              {ratingValue === 1 ? 'Malo' : ratingValue === 2 ? 'Regular' : ratingValue === 3 ? 'Bueno' : ratingValue === 4 ? 'Muy bueno' : 'Excelente'}
                            </span>
                          )}
                        </div>
                        <textarea
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          placeholder="Comentario opcional..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-slate-700 placeholder-slate-400"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleSubmitRating(order.id)}
                            disabled={isSubmittingRating || ratingValue === 0}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {isSubmittingRating ? 'Enviando...' : 'Enviar calificacion'}
                          </button>
                          <button
                            onClick={() => { setRatingOrderId(null); setRatingValue(0); setRatingComment(''); setRatingHover(0); }}
                            className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setRatingOrderId(order.id); setRatingValue(0); setRatingComment(''); }}
                        className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Calificar este servicio
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ordenes activas */}
            {visibleOrders.map((order) => (
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
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cliente/tracking?code=${order.trackingCode || order.id}`);
                        }}
                        className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-sky-600 font-semibold hover:bg-sky-100 hover:text-sky-700 cursor-pointer transition-colors"
                      >
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
                      {order.technician && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Tecnico asignado</p>
                          <p className="text-sm text-slate-700 font-medium">{order.technician.name}</p>
                        </div>
                      )}
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
                        onClick={() => navigate(`/cliente/tracking?code=${order.trackingCode || order.id}`)}
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
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Purchases tab */}
      {activeTab === 'purchases' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Mis Compras
            </h2>
            <span className="text-sm text-slate-400">{purchases.length} compra{purchases.length !== 1 ? 's' : ''}</span>
          </div>

          {isLoadingPurchases ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Cargando compras...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No tienes compras aun</h3>
              <p className="text-slate-500 mb-4">Cuando compres en la tienda, aparecera aqui.</p>
              <button
                onClick={() => navigate('/cliente/tienda')}
                className="text-sky-500 hover:text-sky-600 font-medium text-sm"
              >
                Ir a la tienda
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-sky-600 font-semibold">
                        #{purchase.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        purchase.status === 'ENTREGADO' ? 'bg-green-100 text-green-700' :
                        purchase.status === 'ENVIADO' ? 'bg-sky-100 text-sky-600' :
                        purchase.status === 'PROCESANDO' ? 'bg-amber-100 text-amber-600' :
                        purchase.status === 'CANCELADO' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {purchase.status === 'PENDIENTE' ? 'Pendiente' :
                         purchase.status === 'PROCESANDO' ? 'Procesando' :
                         purchase.status === 'ENVIADO' ? 'Enviado' :
                         purchase.status === 'ENTREGADO' ? 'Entregado' :
                         purchase.status === 'CANCELADO' ? 'Cancelado' : purchase.status}
                      </span>
                    </div>
                    <span className="font-semibold text-sky-600">${purchase.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{purchase.items?.length || 0} producto{(purchase.items?.length || 0) !== 1 ? 's' : ''}</span>
                      <span>-</span>
                      <span>{getTimeAgo(purchase.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/cliente/compra/${purchase.id}`)}
                      className="text-xs text-sky-500 hover:text-sky-600 font-medium"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;
