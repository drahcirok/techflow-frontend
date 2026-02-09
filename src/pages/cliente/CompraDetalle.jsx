import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';

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

const CompraDetalle = () => {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchase();
  }, [purchaseId]);

  const fetchPurchase = async () => {
    try {
      const response = await purchaseService.getById(purchaseId);
      setPurchase(response.data);
    } catch (err) {
      console.error('Error cargando compra:', err);
      setError('No se pudo cargar la compra');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando compra...</p>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Error al cargar</h2>
          <p className="text-slate-500 mb-4">{error || 'Compra no encontrada'}</p>
          <button
            onClick={() => navigate('/cliente/mis-compras')}
            className="text-sky-500 hover:text-sky-600 font-medium"
          >
            Volver a mis compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .factura-container, .factura-container * {
            visibility: visible;
          }
          .factura-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 py-6 px-4">
        {/* Botones de acción - no se imprimen */}
        <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between no-print">
          <button
            onClick={() => navigate('/cliente/mis-compras')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / Guardar PDF
          </button>
        </div>

        {/* Factura */}
        <div className="factura-container max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="TechFlow" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-xl font-bold">TechFlow</h1>
                  <p className="text-slate-300 text-sm">Tienda de Repuestos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">FACTURA</p>
                <p className="text-slate-300 text-sm">{purchase.orderNumber}</p>
              </div>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-6 p-6 border-b border-slate-200 bg-slate-50">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-semibold text-slate-800">{purchase.clientName}</p>
              <p className="text-sm text-slate-600">{purchase.clientEmail}</p>
              {purchase.clientPhone && (
                <p className="text-sm text-slate-600">{purchase.clientPhone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fecha de Compra</p>
              <p className="font-semibold text-slate-800">
                {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="p-6 border-b border-slate-200">
            <div className="mb-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Dirección de Envío</p>
              <p className="text-slate-800">{purchase.shippingAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Método de Pago</p>
                <p className="font-medium text-slate-800">{purchase.paymentMethod || 'EFECTIVO'}</p>
              </div>
              {purchase.notes && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Notas</p>
                  <p className="text-sm text-slate-600">{purchase.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">Producto</th>
                  <th className="text-center py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">Cant.</th>
                  <th className="text-right py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">P. Unit.</th>
                  <th className="text-right py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchase.items && purchase.items.length > 0 ? (
                  purchase.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-slate-800">
                        {item.productName}
                        {item.productSku && (
                          <span className="text-xs text-slate-400 block">SKU: {item.productSku}</span>
                        )}
                      </td>
                      <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">${(item.price || 0).toFixed(2)}</td>
                      <td className="py-3 text-right font-medium text-slate-800">
                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Sin productos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t-2 border-slate-200">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 text-slate-600">
                    <span>Subtotal:</span>
                    <span>${(purchase.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-slate-600">
                    <span>IVA (12%):</span>
                    <span>${(purchase.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-200 mt-2">
                    <span className="text-lg font-bold text-slate-800">TOTAL:</span>
                    <span className="text-lg font-bold text-sky-600">${(purchase.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-200">
            <div className="text-center text-sm text-slate-500">
              <p className="mb-2">Gracias por tu compra en TechFlow</p>
              <p className="text-xs text-slate-400">
                Número de orden: <span className="font-mono font-medium text-slate-600">{purchase.orderNumber}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Instrucciones - no se imprimen */}
        <div className="max-w-3xl mx-auto mt-4 text-center text-sm text-slate-400 no-print">
          <p>Presiona Ctrl+P (o Cmd+P en Mac) para imprimir o guardar como PDF</p>
        </div>
      </div>
    </>
  );
};

export default CompraDetalle;
