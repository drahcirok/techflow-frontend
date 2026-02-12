import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../../services/orderService';

const TYPE_LABELS = {
  MANTENIMIENTO: 'Mantenimiento',
  REPARACION: 'Reparación',
  ENSAMBLE: 'Ensamble',
};

const Factura = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detectar si estamos en admin o cliente
  const isAdmin = location.pathname.startsWith('/admin');
  const backPath = isAdmin ? '/admin/history' : '/cliente/dashboard';

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getById(orderId);
      setOrder(response.data);
    } catch (err) {
      console.error('Error cargando orden:', err);
      setError('No se pudo cargar la orden');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('es', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Error al cargar</h2>
          <p className="text-slate-500 mb-4">{error || 'Orden no encontrada'}</p>
          <button
            onClick={() => navigate(backPath)}
            className="text-sky-500 hover:text-sky-600 font-medium"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const itemsTotal = order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;
  const laborCost = order.laborCost || 0;
  const total = order.totalCost || (laborCost + itemsTotal);

  return (
    <>
      {/* Estilos de impresion */}
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
          .print-only {
            display: block !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 py-6 px-4">
        {/* Botones de accion - no se imprimen */}
        <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between no-print">
          <button
            onClick={() => navigate(backPath)}
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
                  <p className="text-slate-300 text-sm">Servicio Técnico Especializado</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">FACTURA</p>
                <p className="text-slate-300 text-sm">#{order.trackingCode || order.id}</p>
              </div>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-6 p-6 border-b border-slate-200 bg-slate-50">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-semibold text-slate-800">{order.clientName || 'Cliente'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fecha de emisión</p>
              <p className="font-semibold text-slate-800">{today}</p>
            </div>
          </div>

          {/* Order details */}
          <div className="p-6 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tipo de Servicio</p>
                <p className="font-medium text-slate-800">{TYPE_LABELS[order.type] || order.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fecha de Ingreso</p>
                <p className="font-medium text-slate-800">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Descripción del Servicio</p>
              <p className="text-slate-800">{order.description || 'Servicio técnico'}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">Concepto</th>
                  <th className="text-center py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">Cant.</th>
                  <th className="text-right py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">P. Unit.</th>
                  <th className="text-right py-3 text-xs text-slate-400 uppercase tracking-wider font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Labor cost */}
                {laborCost > 0 && (
                  <tr>
                    <td className="py-3 text-slate-800">Mano de obra</td>
                    <td className="py-3 text-center text-slate-600">1</td>
                    <td className="py-3 text-right text-slate-600">${laborCost.toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-slate-800">${laborCost.toFixed(2)}</td>
                  </tr>
                )}
                {/* Items */}
                {order.items && order.items.length > 0 && order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-slate-800">{item.product?.name || item.productName || item.productSku || 'Repuesto'}</td>
                    <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-600">${(item.price || 0).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-slate-800">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Empty state */}
                {(!order.items || order.items.length === 0) && laborCost === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Sin items registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t-2 border-slate-200">
              <div className="flex justify-end">
                <div className="w-64">
                  {laborCost > 0 && order.items && order.items.length > 0 && (
                    <>
                      <div className="flex justify-between py-2 text-slate-600">
                        <span>Mano de obra:</span>
                        <span>${laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 text-slate-600">
                        <span>Repuestos:</span>
                        <span>${itemsTotal.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-3 border-t border-slate-200 mt-2">
                    <span className="text-lg font-bold text-slate-800">TOTAL:</span>
                    <span className="text-lg font-bold text-sky-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-200">
            <div className="text-center text-sm text-slate-500">
              <p className="mb-2">Gracias por confiar en TechFlow</p>
              <p className="text-xs text-slate-400">
                Este documento es un comprobante de servicio. Conserve su código de seguimiento: <span className="font-mono font-medium text-slate-600">#{order.trackingCode || order.id}</span>
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

export default Factura;
