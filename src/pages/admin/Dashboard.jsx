import { useState } from 'react';

const Dashboard = () => {
  // Datos de prueba
  const stats = [
    { label: 'Órdenes Activas', value: 24, change: '+12%', color: 'sky' },
    { label: 'Completadas Hoy', value: 8, change: '+5%', color: 'emerald' },
    { label: 'Usuarios Activos', value: 156, change: '+3%', color: 'purple' },
    { label: 'Ingresos del Mes', value: '$12,450', change: '+18%', color: 'amber' },
  ];

  const recentOrders = [
    { id: 'TF-001', cliente: 'Juan Pérez', equipo: 'Laptop HP', status: 'En Reparación', fecha: '2025-01-17' },
    { id: 'TF-002', cliente: 'María García', equipo: 'PC Desktop', status: 'Diagnóstico', fecha: '2025-01-17' },
    { id: 'TF-003', cliente: 'Carlos López', equipo: 'Impresora', status: 'Terminado', fecha: '2025-01-16' },
    { id: 'TF-004', cliente: 'Ana Torres', equipo: 'Monitor', status: 'Ingresado', fecha: '2025-01-16' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Ingresado': 'bg-blue-500/20 text-blue-400',
      'Diagnóstico': 'bg-yellow-500/20 text-yellow-400',
      'En Reparación': 'bg-purple-500/20 text-purple-400',
      'Terminado': 'bg-emerald-500/20 text-emerald-400',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <span className="text-emerald-400 text-sm font-medium">{stat.change}</span>
            </div>
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
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Cliente</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Equipo</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Estado</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">{order.id}</td>
                  <td className="px-6 py-4 text-white">{order.cliente}</td>
                  <td className="px-6 py-4 text-slate-300">{order.equipo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{order.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
