import { useState } from 'react';
import api from '../services/api';
import ReviewForm from './ReviewForm';
import { CalendarDays, MapPin, Star, Search, X, Loader } from 'lucide-react';

const formatFecha = (f) => {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

function MisReservasModal({ onClose }) {
  const [tipoBusqueda, setTipoBusqueda] = useState('email');
  const [valorBusqueda, setValorBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [reservas, setReservas] = useState(null);
  const [huesped, setHuesped] = useState(null);
  const [reviewReserva, setReviewReserva] = useState(null);
  const [sinResultados, setSinResultados] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!valorBusqueda.trim()) {
      setError('Ingresa tu correo o documento');
      return;
    }
    setError('');
    setBuscando(true);
    setReservas(null);
    setSinResultados(false);
    try {
      const body = tipoBusqueda === 'email'
        ? { email: valorBusqueda.trim() }
        : { documento: valorBusqueda.trim() };
      const res = await api.post('/public/reservas/consultar', body);
      const lista = res.data.data || [];
      if (lista.length === 0) {
        setSinResultados(true);
      } else {
        setReservas(lista);
        setHuesped(res.data.huesped);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al consultar reservas');
    } finally {
      setBuscando(false);
    }
  };

  const handleReviewExitoso = () => {
    setReviewReserva(null);
    setReservas(null);
    setSinResultados(false);
    setValorBusqueda('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {reviewReserva ? (
          <ReviewForm
            reserva={reviewReserva}
            onClose={() => setReviewReserva(null)}
            onSuccess={handleReviewExitoso}
          />
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Search size={24} className="text-green-800" />
              <h2 className="text-2xl font-black">Mis Reservas</h2>
            </div>

            <form onSubmit={handleBuscar} className="space-y-4">
              <div className="flex gap-2 bg-gray-50 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setTipoBusqueda('email')}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                    tipoBusqueda === 'email'
                      ? 'bg-white text-green-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Correo electrónico
                </button>
                <button
                  type="button"
                  onClick={() => setTipoBusqueda('documento')}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                    tipoBusqueda === 'documento'
                      ? 'bg-white text-green-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Documento / Cédula
                </button>
              </div>

              <input
                type={tipoBusqueda === 'email' ? 'email' : 'text'}
                placeholder={tipoBusqueda === 'email' ? 'tucorreo@ejemplo.com' : 'Número de cédula'}
                required
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold"
                value={valorBusqueda}
                onChange={(e) => setValorBusqueda(e.target.value)}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-bold text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={buscando}
                className="w-full bg-green-900 text-white py-4 rounded-2xl font-black hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {buscando ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Consultar reservas'
                )}
              </button>
            </form>

            {sinResultados && (
              <div className="mt-6 text-center py-8 bg-gray-50 rounded-2xl">
                <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-gray-500">No encontramos reservas asociadas</p>
                <p className="text-sm text-gray-400 mt-1">Verifica el dato ingresado</p>
              </div>
            )}

            {reservas && reservas.length > 0 && (
              <div className="mt-6">
                <p className="font-black text-gray-700 mb-3">
                  Hola {huesped?.nombre || 'Cliente'}, estas son tus reservas:
                </p>
                <div className="space-y-3">
                  {reservas.map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-black text-green-800 flex items-center gap-2">
                            <MapPin size={14} />
                            {r.alojamiento_nombre}
                          </h4>
                          <p className="text-xs font-bold text-gray-500">
                            {formatFecha(r.fecha_entrada)} → {formatFecha(r.fecha_salida)}
                            {r.noches ? ` · ${r.noches} noche${r.noches > 1 ? 's' : ''}` : ''}
                          </p>
                          <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black ${
                            r.estado === 'confirmada'
                              ? 'bg-green-100 text-green-700'
                              : r.estado === 'cancelada'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.estado === 'confirmada' ? 'Confirmada' : r.estado === 'cancelada' ? 'Cancelada' : 'Pendiente'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-green-800">
                            ${Number(r.total_pago || 0).toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>

                      {r.estado === 'confirmada' && !r.valoracion_id && (
                        <button
                          onClick={() => {
                            setReviewReserva({
                              id: r.id,
                              alojamiento_nombre: r.alojamiento_nombre,
                              nombre_cliente: huesped?.nombre || 'Cliente',
                              total_pago: r.total_pago,
                            });
                          }}
                          className="mt-3 w-full bg-amber-500 text-white py-3 rounded-2xl font-black hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Star size={16} />
                          Calificar Estadía
                        </button>
                      )}

                      {r.valoracion_id && (
                        <div className="mt-3 flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                size={14}
                                className={n <= (r.valoracion_calificacion || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-500">Ya calificada</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MisReservasModal;
