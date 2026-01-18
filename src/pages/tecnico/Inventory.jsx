import { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';

// Datos de prueba
const mockInventory = [
  { id: 1, sku: 'REP-001', nombre: 'Disco SSD 500GB', marca: 'Samsung', stock: 15, precio: 85.00, stockMinimo: 5 },
  { id: 2, sku: 'REP-002', nombre: 'Memoria RAM 8GB DDR4', marca: 'Kingston', stock: 8, precio: 45.00, stockMinimo: 3 },
  { id: 3, sku: 'REP-003', nombre: 'Fuente de Poder 600W', marca: 'EVGA', stock: 3, precio: 65.00, stockMinimo: 5 },
  { id: 4, sku: 'REP-004', nombre: 'Cable HDMI 2m', marca: 'Genérico', stock: 25, precio: 8.00, stockMinimo: 10 },
  { id: 5, sku: 'REP-005', nombre: 'Pasta Térmica', marca: 'Arctic', stock: 12, precio: 12.00, stockMinimo: 5 },
  { id: 6, sku: 'REP-006', nombre: 'Teclado USB', marca: 'Logitech', stock: 0, precio: 25.00, stockMinimo: 3 },
];

const Inventory = () => {
  const [inventory, setInventory] = useState(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Descomentar cuando el backend esté listo
  // useEffect(() => {
  //   fetchInventory();
  // }, []);
  
  // const fetchInventory = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await inventoryService.getAll();
  //     setInventory(response.data);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.marca.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStock === 'low') {
      return matchesSearch && item.stock <= item.stockMinimo && item.stock > 0;
    } else if (filterStock === 'out') {
      return matchesSearch && item.stock === 0;
    }
    return matchesSearch;
  });

  const getStockStatus = (item) => {
    if (item.stock === 0) {
      return { label: 'Agotado', color: 'bg-red-500/20 text-red-400' };
    } else if (item.stock <= item.stockMinimo) {
      return { label: 'Stock Bajo', color: 'bg-yellow-500/20 text-yellow-400' };
    }
    return { label: 'Disponible', color: 'bg-green-500/20 text-green-400' };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-slate-400">Control de stock de repuestos</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Repuesto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtro de stock */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStock('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStock === 'all' 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStock('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStock === 'low' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Stock Bajo
            </button>
            <button
              onClick={() => setFilterStock('out')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStock === 'out' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Agotados
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Total Productos</p>
          <p className="text-2xl font-bold text-white">{inventory.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Stock Bajo</p>
          <p className="text-2xl font-bold text-yellow-400">
            {inventory.filter(i => i.stock <= i.stockMinimo && i.stock > 0).length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Agotados</p>
          <p className="text-2xl font-bold text-red-400">
            {inventory.filter(i => i.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Producto</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Marca</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-400">Stock</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Precio</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-400">Estado</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-400">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{item.nombre}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{item.marca}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-semibold">{item.stock}</span>
                        <span className="text-slate-500 text-sm ml-1">/ {item.stockMinimo} min</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white">${item.precio.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sky-400 hover:text-sky-300 text-sm font-medium">
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
