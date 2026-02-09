import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  MANTENIMIENTO: 'Mantenimiento',
  REPARACION: 'Reparación',
  ENSAMBLE: 'Ensamble',
};

const Valoracion = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getById(orderId);
      setOrder(response.data);
      // Verificar si ya tiene valoracion
      if (response.data.rating) {
        setRating(response.data.rating);
        setComment(response.data.ratingComment || '');
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error cargando orden:', err);
      toast.error('No se pudo cargar la orden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    try {
      await orderService.addRating(orderId, { rating, comment });
      toast.success('¡Gracias por tu valoración!');
      setSubmitted(true);
    } catch (error) {
      console.error('Error enviando valoración:', error);
      toast.error('Error al enviar la valoración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (r) => {
    const labels = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente',
    };
    return labels[r] || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Orden no encontrada</h2>
          <button
            onClick={() => navigate('/cliente/dashboard')}
            className="text-sky-500 hover:text-sky-600 font-medium"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/cliente/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al dashboard
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Valorar Servicio</h1>
              <p className="text-amber-100 text-sm">Tu opinión nos ayuda a mejorar</p>
            </div>
          </div>
        </div>

        {/* Order info */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Orden</p>
              <p className="font-mono text-sky-600 font-semibold">#{order.trackingCode || order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">Tipo de servicio</p>
              <p className="font-medium text-slate-800">{TYPE_LABELS[order.type] || order.type}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-slate-500 mb-1">Descripción</p>
            <p className="text-slate-800">{order.description}</p>
          </div>
        </div>

        {/* Rating form */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">¡Gracias por tu valoración!</h2>
              <p className="text-slate-500 mb-6">Tu opinión nos ayuda a mejorar nuestros servicios.</p>

              {/* Show submitted rating */}
              <div className="inline-flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-8 h-8 ${star <= rating ? 'text-amber-400' : 'text-slate-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>

              {comment && (
                <div className="bg-slate-50 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-slate-600 italic">"{comment}"</p>
                </div>
              )}

              <button
                onClick={() => navigate('/cliente/dashboard')}
                className="mt-6 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
              >
                Volver al dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Star rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                  ¿Cómo calificarías nuestro servicio?
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-12 h-12 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {(hoverRating || rating) > 0 && (
                  <p className="text-center mt-2 text-sm font-medium text-amber-600">
                    {getRatingLabel(hoverRating || rating)}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Cuéntanos sobre tu experiencia..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enviar valoración
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Valoracion;
