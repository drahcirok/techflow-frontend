import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderService.getAll(),
        productService.getAll()
      ]);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Órdenes Activas', 
      value: orders.filter(o => !['ENTREGADO', 'CANCELADO'].includes(o.status)).length, 
      color: 'bg-sky-500',
      bgLight: 'bg-sky-100',
      textColor: 'text-sky-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      label: 'Completadas', 
      value: orders.filter(o => o.status === 'ENTREGADO').length, 
      color: 'bg-sky-500',
      bgLight: 'bg-sky-100',
      textColor: 'text-sky-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: 'Productos', 
      value: products.length, 
      color: 'bg-violet-500',
      bgLight: 'bg-violet-100',
      textColor: 'text-violet-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      label: 'Stock Bajo', 
      value: products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length, 
      color: 'bg-amber-500',
      bgLight: 'bg-amber-100',
      textColor: 'text-amber-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      'PENDIENTE': 'bg-slate-100 text-slate-600',
      'DIAGNOSTICO': 'bg-sky-100 text-sky-600',
      'EN_ESPERA_REPUESTO': 'bg-amber-100 text-amber-600',
      'REPARADO': 'bg-sky-100 text-sky-600',
      'ENTREGADO': 'bg-sky-100 text-sky-700',
      'CANCELADO': 'bg-red-100 text-red-600',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDIENTE': 'Pendiente',
      'DIAGNOSTICO': 'En Diagnóstico',
      'EN_ESPERA_REPUESTO': 'En Reparación',
      'REPARADO': 'Listo',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Resumen general del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgLight} rounded-xl flex items-center justify-center ${stat.textColor}`}>
                {stat.icon}
              </div>
              {stat.label === 'Stock Bajo' && stat.value > 0 && (
                <span className="px-2 py-1 bg-amber-100 text-amber-600 text-xs font-medium rounded-lg">
                  ⚠️ Alerta
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
            <p className="text-slate-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Órdenes Recientes</h2>
          <span className="text-sm text-slate-500">{orders.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Descripción</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Tipo</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Cliente</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Estado</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-sky-600 font-medium">
                      #{order.trackingCode || `ORD-${order.id.toString().padStart(4, '0')}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-800">{order.description || 'Sin descripción'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{order.type || 'General'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">
                      {order.clientName || `Cliente #${order.clientId}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sky-600 font-semibold">
                      ${order.totalCost?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay órdenes registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
