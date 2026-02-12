import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RepairHistory = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      // Obtener todos los usuarios (clientes)
      const usersResponse = await api.get('/users');
      const allUsers = usersResponse.data || [];

      // Filtrar solo clientes
      const clientUsers = allUsers.filter(u =>
        u.role === 'CLIENTE' || u.role === 'ROLE_CLIENTE'
      );

      // Obtener todas las órdenes para contar reparaciones por cliente
      const ordersResponse = await orderService.getAllIncludingHistory();
      const allOrders = ordersResponse.data || [];

      // Enriquecer datos de clientes con conteo de órdenes
      // Buscamos por client.id O por clientEmail para incluir órdenes sin cuenta
      const clientsWithOrders = clientUsers.map(client => {
        const orders = allOrders.filter(order =>
          order.client?.id === client.id ||
          (order.clientEmail && order.clientEmail.toLowerCase() === client.email?.toLowerCase())
        );
        return {
          ...client,
          orderCount: orders.length,
          lastOrderDate: orders.length > 0
            ? new Date(Math.max(...orders.map(o => new Date(o.createdAt || 0))))
            : null
        };
      });

      setClients(clientsWithOrders);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Error al cargar clientes');
      setClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchClientOrders = async (clientId) => {
    setIsLoadingOrders(true);
    try {
      // Usar el nuevo endpoint que busca por clientId Y por email
      const response = await orderService.getByClientId(clientId);
      const orders = response.data || [];

      // Ya vienen ordenados del backend
      setClientOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar historial');
      setClientOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    fetchClientOrders(client.id);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDIENTE': 'bg-slate-100 text-slate-600',
      'DIAGNOSTICO': 'bg-sky-100 text-sky-600',
      'EN_ESPERA_REPUESTO': 'bg-amber-100 text-amber-600',
      'REPARADO': 'bg-sky-100 text-sky-600',
      'ENTREGADO': 'bg-green-100 text-green-700',
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

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Historial de Reparaciones</h1>
        <p className="text-slate-500">Consulta el historial completo de cada cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800 mb-3">Clientes</h2>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {isLoadingClients ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border-b border-slate-100 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ))
              ) : filteredClients.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No hay clientes registrados
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className={`w-full p-4 text-left border-b border-slate-100 transition-colors ${
                      selectedClient?.id === client.id
                        ? 'bg-sky-50 border-l-4 border-l-sky-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 truncate">
                          {client.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          {client.email}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-col items-end">
                        <span className="bg-sky-100 text-sky-700 text-xs font-medium px-2 py-1 rounded-full">
                          {client.orderCount} {client.orderCount === 1 ? 'orden' : 'órdenes'}
                        </span>
                        {client.lastOrderDate && (
                          <span className="text-xs text-slate-400 mt-1">
                            {new Date(client.lastOrderDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Historial de Órdenes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {selectedClient ? (
              <>
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                      <span className="text-sky-600 font-bold text-lg">
                        {selectedClient.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {selectedClient.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {selectedClient.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="bg-slate-50 px-4 py-2 rounded-lg">
                      <span className="text-slate-500 text-sm">Total de órdenes:</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {clientOrders.length}
                      </span>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg">
                      <span className="text-slate-500 text-sm">Total gastado:</span>
                      <span className="ml-2 font-bold text-sky-600">
                        ${clientOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    Historial de Reparaciones
                  </h3>

                  {isLoadingOrders ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-slate-50 rounded-xl p-4">
                          <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                          <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
                          <div className="h-4 bg-slate-200 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : clientOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      Este cliente no tiene órdenes registradas
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {clientOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-slate-50 rounded-xl p-4 hover:shadow-md transition-all border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sky-600 font-semibold text-sm">
                                  #{order.trackingCode || `ORD-${order.id.toString().padStart(4, '0')}`}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${getStatusBadge(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                              <h4 className="text-slate-800 font-medium mb-1">
                                {order.description || 'Sin descripción'}
                              </h4>
                              <p className="text-sm text-slate-500">
                                {order.type || 'General'}
                              </p>
                            </div>
                            {order.totalCost > 0 && (
                              <div className="text-right">
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="text-lg font-bold text-sky-600">
                                  ${order.totalCost.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Valoracion */}
                          {order.rating ? (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <svg key={star} className={`w-4 h-4 ${star <= order.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              {order.ratingComment && (
                                <span className="text-xs text-slate-500 italic truncate max-w-[200px]">"{order.ratingComment}"</span>
                              )}
                            </div>
                          ) : order.status === 'ENTREGADO' ? (
                            <p className="text-xs text-slate-300 mt-2">Sin valoracion</p>
                          ) : null}

                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-3">
                            <span className="text-xs text-slate-400">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Fecha no disponible'}
                            </span>
                            <div className="flex items-center gap-3">
                              {order.technician && (
                                <span className="text-xs text-slate-500">
                                  Tecnico: {order.technician.name}
                                </span>
                              )}
                              {order.items && order.items.length > 0 && (
                                <span className="text-xs text-slate-500">
                                  {order.items.length} {order.items.length === 1 ? 'repuesto' : 'repuestos'}
                                </span>
                              )}
                              <button
                                onClick={() => navigate(`/admin/factura/${order.id}`)}
                                className="text-xs text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ver Factura
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Selecciona un Cliente
                </h3>
                <p className="text-slate-500">
                  Elige un cliente de la lista para ver su historial completo de reparaciones
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairHistory;
