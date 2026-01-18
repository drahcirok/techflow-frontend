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
      color: 'sky' 
    },
    { 
      label: 'Completadas', 
      value: orders.filter(o => o.status === 'ENTREGADO').length,
      color: 'emerald' 
    },
    { 
      label: 'Productos', 
      value: products.length,
      color: 'purple' 
    },
    { 
      label: 'Stock Bajo', 
      value: products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length,
      color: 'amber' 
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'PENDIENTE': 'bg-blue-500/20 text-blue-400',
      'DIAGNOSTICO': 'bg-yellow-500/20 text-yellow-400',
      'EN_ESPERA_REPUESTO': 'bg-orange-500/20 text-orange-400',
      'REPARADO': 'bg-purple-500/20 text-purple-400',
      'ENTREGADO': 'bg-emerald-500/20 text-emerald-400',
      'CANCELADO': 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDIENTE': 'Pendiente',
      'DIAGNOSTICO': 'Diagnóstico',
      'EN_ESPERA_REPUESTO': 'Esp. Repuesto',
      'REPARADO': 'Reparado',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Órdenes Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Descripción</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Tipo</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Estado</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">#{order.id}</td>
                  <td className="px-6 py-4 text-white">{order.description}</td>
                  <td className="px-6 py-4 text-slate-300">{order.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-400 font-semibold">
                    ${order.totalCost?.toFixed(2)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
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
