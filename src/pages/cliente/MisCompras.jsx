import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  PROCESANDO: 'bg-sky-100 text-sky-700',
  ENVIADO: 'bg-purple-100 text-purple-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  PROCESANDO: 'Procesando',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const MisCompras = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await purchaseService.getMyPurchases();
      setPurchases(response.data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Error al cargar compras');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mis Compras</h1>
        <p className="text-slate-500">Historial de todas tus compras en la tienda</p>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No tienes compras aún</h2>
          <p className="text-slate-500 mb-6">Explora nuestra tienda y encuentra los mejores productos</p>
          <button
            onClick={() => navigate('/cliente/tienda')}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
          >
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
              onClick={() => navigate(`/cliente/compra/${purchase.id}`)}
            >
              {/* Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-sky-600 font-semibold">
                    {purchase.orderNumber}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[purchase.status] || 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABELS[purchase.status] || purchase.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Fecha no disponible'}
                </p>
              </div>

              {/* Items Preview */}
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {purchase.items && purchase.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 truncate flex-1">
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="text-slate-600 ml-2">
                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {purchase.items && purchase.items.length > 3 && (
                    <p className="text-xs text-slate-400">
                      +{purchase.items.length - 3} producto(s) más
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total:</span>
                    <span className="text-xl font-bold text-sky-600">
                      ${(purchase.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Address */}
                {purchase.shippingAddress && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">Dirección de envío:</p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {purchase.shippingAddress}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cliente/compra/${purchase.id}`);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ver Factura
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCompras;
