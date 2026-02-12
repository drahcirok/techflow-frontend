import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { purchaseService } from '../../services/purchaseService';
import toast from 'react-hot-toast';

const Carrito = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Datos de tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const TAX_RATE = 0.12; // 12% IVA

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const updateQuantity = (sku, newQuantity) => {
    const product = cart.find(item => item.sku === sku);
    if (newQuantity > product.stock) {
      toast.error('No hay suficiente stock');
      return;
    }
    if (newQuantity === 0) {
      removeFromCart(sku);
      return;
    }
    const newCart = cart.map(item =>
      item.sku === sku ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (sku) => {
    const newCart = cart.filter(item => item.sku !== sku);
    saveCart(newCart);
    toast.success('Producto eliminado');
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getSubtotal() * TAX_RATE;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!shippingAddress.trim()) {
      toast.error('Ingresa una dirección de envío');
      return;
    }

    // Validar datos de tarjeta si el método es TARJETA
    if (paymentMethod === 'TARJETA') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 13) {
        toast.error('Ingresa un número de tarjeta válido');
        return;
      }
      if (!cardHolder.trim()) {
        toast.error('Ingresa el nombre del titular');
        return;
      }
      if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        toast.error('Ingresa la fecha de expiración (MM/AA)');
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        toast.error('Ingresa el CVV de la tarjeta');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const purchaseData = {
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        notes: notes.trim() || null,
        items: cart.map(item => ({
          productSku: item.sku,
          quantity: item.quantity
        }))
      };

      const response = await purchaseService.create(purchaseData);

      if (response && response.data && response.data.id) {
        toast.success('¡Compra realizada exitosamente!');
        clearCart();
        navigate(`/cliente/compra/${response.data.id}`);
      } else {
        toast.error('Error: No se recibió confirmación de la compra');
      }
    } catch (error) {
      console.error('Error al procesar compra:', error);
      // El error ya se muestra por el interceptor
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/cliente/tienda')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la Tienda
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-slate-500 mb-6">Agrega productos desde la tienda para comenzar</p>
          <button
            onClick={() => navigate('/cliente/tienda')}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
          >
            Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/cliente/tienda')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Seguir Comprando
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Carrito de Compras</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.sku} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-50 to-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{item.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                      className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center font-semibold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                      className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center"
                      disabled={item.quantity >= item.stock}
                    >
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.sku)}
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Precio unitario</p>
                <p className="text-lg font-bold text-sky-600">${item.price.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-2">Subtotal</p>
                <p className="text-xl font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Resumen de Compra</h2>

            {/* Totals */}
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (12%):</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span className="text-sky-600">${getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dirección de Envío *
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                placeholder="Ingresa tu dirección completa"
              />
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta de Crédito/Débito</option>
              </select>
            </div>

            {/* Card Details - Solo si se selecciona TARJETA */}
            {paymentMethod === 'TARJETA' && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Datos de la Tarjeta</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Número de Tarjeta *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(formatted.slice(0, 19));
                      }}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Titular de la Tarjeta *
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="NOMBRE APELLIDO"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Fecha de Expiración *
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setCardExpiry(value);
                        }}
                        placeholder="MM/AA"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                placeholder="Instrucciones especiales..."
              />
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !shippingAddress.trim()}
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Finalizar Compra
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center mt-4">
              Al finalizar la compra aceptas nuestros términos y condiciones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
