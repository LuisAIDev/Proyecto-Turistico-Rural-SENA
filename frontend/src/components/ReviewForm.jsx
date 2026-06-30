import { useState } from 'react';
import api from '../services/api';
import { Star, X, MessageCircle } from 'lucide-react';

function ReviewForm({ reserva, onClose, onSuccess }) {
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calificacion === 0) {
      setError('Selecciona una calificación');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/valoraciones/crear', {
        reserva_id: reserva.id,
        calificacion,
        comentario: comentario.trim() || null,
      });
      setEnviado(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar la valoración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {enviado ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="text-2xl font-black text-green-800 mb-2">¡Gracias por tu opinión!</h2>
            <p className="text-gray-500 font-bold mb-6">
              Tu valoración ayuda a mejorar la experiencia de todos.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-green-900 text-white py-4 rounded-2xl font-black hover:bg-green-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle size={24} className="text-green-800" />
              <h2 className="text-2xl font-black">Calificar Estadía</h2>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-1">
              <p className="font-black text-sm text-gray-700">
                {reserva.alojamiento_nombre}
              </p>
              <p className="font-bold text-xs text-gray-500">
                {reserva.nombre_cliente}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-bold text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <p className="font-black text-gray-700 mb-3">Puntuación</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCalificacion(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-all duration-150 hover:scale-110"
                    >
                      <Star
                        size={36}
                        className={
                          (hover || calificacion) >= n
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-400 mt-2">
                  {calificacion === 1 && 'Malo'}
                  {calificacion === 2 && 'Regular'}
                  {calificacion === 3 && 'Bueno'}
                  {calificacion === 4 && 'Muy bueno'}
                  {calificacion === 5 && 'Excelente'}
                </p>
              </div>

              <textarea
                placeholder="Comparte tu experiencia (opcional)"
                rows={4}
                maxLength={500}
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold resize-none"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
              <p className="text-xs text-gray-400 font-bold text-right -mt-4">
                {comentario.length}/500
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || calificacion === 0}
                  className="flex-1 bg-green-900 text-white py-4 rounded-2xl font-black hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Enviando...' : 'Enviar Opinión'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReviewForm;
