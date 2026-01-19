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
    { label: 'Órdenes Activas', value: orders.filter(o => !['ENTREGADO', 'CANCELADO'].includes(o.status)).length, color: 'bg-blue-500' },
    { label: 'Completadas', value: orders.filter(o => o.status === 'ENTREGADO').length, color: 'bg-green-500' },
    { label: 'Productos', value: products.length, color: 'bg-purple-500' },
    { label: 'Stock Bajo', value: products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length, color: 'bg-orange-500' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      'PENDIENTE': 'bg-slate-100 text-slate-600',
      'DIAGNOSTICO': 'bg-blue-100 text-blue-600',
      'EN_ESPERA_REPUESTO': 'bg-orange-100 text-orange-600',
      'REPARADO': 'bg-green-100 text-green-600',
      'ENTREGADO': 'bg-emerald-100 text-emerald-600',
      'CANCELADO': 'bg-red-100 text-red-600',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
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
            <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Órdenes Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Descripción</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Tipo</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Estado</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sm text-slate-500">#{order.id}</td>
                  <td className="px-6 py-4 text-slate-800">{order.description}</td>
                  <td className="px-6 py-4 text-slate-600">{order.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-green-600 font-semibold">
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
